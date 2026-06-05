import { useState, useCallback } from 'react';
import {
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Card,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lecturersApi } from '@/api/lecturers.api';
import { departmentsApi } from '@/api/departments.api';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/formatters';
import type { Lecturer, LecturerCreate, LecturerUpdate } from '@/types/lecturer.types';
import type { Pagination } from '@/types/api.types';
import DataGrid from '@/components/DataGrid/DataGrid';
import PageHeader from '@/components/PageHeader/PageHeader';
import Loading from '@/components/common/Loading';
import LecturerFormModal from './LecturerFormModal';

export default function LecturerListPage() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['lecturers-summary'],
    queryFn: () => lecturersApi.getSummary(),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments-all'],
    queryFn: () => departmentsApi.getDepartments({ page_size: 100 }),
  });

  const departments = departmentsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: LecturerCreate) => lecturersApi.createLecturer(data),
    onSuccess: () => {
      message.success('Lecturer created successfully');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers-summary'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Failed to create lecturer';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LecturerUpdate }) =>
      lecturersApi.updateLecturer(id, data),
    onSuccess: () => {
      message.success('Lecturer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers-summary'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Failed to update lecturer';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lecturersApi.deleteLecturer(id),
    onSuccess: () => {
      message.success('Lecturer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers-summary'] });
    },
    onError: () => {
      message.error('Failed to delete lecturer');
    },
  });

  const handleCreate = () => {
    setSelectedLecturer(null);
    setModalOpen(true);
  };

  const handleEdit = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setModalOpen(true);
  };

  const handleSubmit = async (values: LecturerCreate | LecturerUpdate) => {
    if (selectedLecturer) {
      await updateMutation.mutateAsync({
        id: selectedLecturer.id,
        data: values as LecturerUpdate,
      });
    } else {
      await createMutation.mutateAsync(values as LecturerCreate);
    }
  };

  const fetchLecturers = useCallback(
    async (params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }) => {
      const res = await lecturersApi.getLecturers(params);
      return res as {
        success: boolean;
        data: Lecturer[];
        pagination: Pagination | null;
      };
    },
    []
  );

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: true,
    },
    {
      title: 'Academic Title',
      dataIndex: 'academic_title',
      key: 'academic_title',
    },
    {
      title: 'Degree',
      dataIndex: 'degree',
      key: 'degree',
    },
    {
      title: 'Department',
      dataIndex: 'department_id',
      key: 'department_id',
      render: (_: unknown, record: Lecturer) => {
        if (!record.department_id) return '-';
        const dept = departments.find((d) => d.id === record.department_id);
        return dept?.name || '-';
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) =>
        status ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Lecturer) => (
        <Space>
          {can('lecturers.edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {can('lecturers.delete') && (
            <Popconfirm
              title="Delete this lecturer?"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Lecturers"
        createPermission="lecturers.create"
        onCreate={handleCreate}
      />

      {summaryLoading ? (
        <Loading rows={2} type="card" />
      ) : summaryData?.data ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Total Lecturers" value={summaryData.data.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Active"
                value={summaryData.data.active}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      ) : null}

      <DataGrid
        columns={columns}
        fetchData={fetchLecturers}
        queryKey="lecturers"
        permissionPrefix="lecturers"
        actions={
          can('lecturers.create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              New Lecturer
            </Button>
          )
        }
      />

      <LecturerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedLecturer}
        departments={departments}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
