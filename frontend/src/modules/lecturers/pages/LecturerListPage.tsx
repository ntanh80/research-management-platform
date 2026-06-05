import { useState, useCallback } from 'react';
import {
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Select,
  Input,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
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
  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState<number | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

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
      message.success('Giảng viên đã được tạo');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers-summary'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Tạo giảng viên thất bại';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LecturerUpdate }) =>
      lecturersApi.updateLecturer(id, data),
    onSuccess: () => {
      message.success('Giảng viên đã được cập nhật');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers-summary'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Cập nhật giảng viên thất bại';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lecturersApi.deleteLecturer(id),
    onSuccess: () => {
      message.success('Giảng viên đã được xóa');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
      queryClient.invalidateQueries({ queryKey: ['lecturers-summary'] });
    },
    onError: () => {
      message.error('Xóa giảng viên thất bại');
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

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    queryClient.invalidateQueries({ queryKey: ['lecturers'] });
  };

  const fetchLecturers = useCallback(
    async (params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }) => {
      const res = await lecturersApi.getLecturers({
        ...params,
        search: searchText || undefined,
        department_id: filterDept,
      });
      return res as {
        success: boolean;
        data: Lecturer[];
        pagination: Pagination | null;
      };
    },
    [searchText, filterDept]
  );

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: true,
    },
    {
      title: 'Học hàm',
      dataIndex: 'academic_title',
      key: 'academic_title',
      sorter: true,
    },
    {
      title: 'Học vị',
      dataIndex: 'degree',
      key: 'degree',
      sorter: true,
    },
    {
      title: 'Khoa/Bộ môn',
      dataIndex: 'department_id',
      key: 'department_id',
      sorter: true,
      render: (_: unknown, record: Lecturer) => {
        if (!record.department_id) return '-';
        const dept = departments.find((d) => d.id === record.department_id);
        return dept?.name || '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: boolean) =>
        status ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
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
              title="Xóa giảng viên này?"
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
        title="Giảng viên"
        createPermission="lecturers.create"
        onCreate={handleCreate}
        onRefresh={handleRefresh}
      />

      {summaryLoading ? (
        <Loading rows={1} type="card" />
      ) : summaryData?.data ? (
        <Row gutter={8} style={{ marginBottom: 16 }}>
          <Col>
            <span style={{ color: '#666', marginRight: 4 }}>Tổng:</span>
            <b>{summaryData.data.total}</b>
          </Col>
          <Col style={{ marginLeft: 16 }}>
            <span style={{ color: '#666', marginRight: 4 }}>Hoạt động:</span>
            <b style={{ color: '#3f8600' }}>{summaryData.data.active}</b>
          </Col>
        </Row>
      ) : null}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Khoa/Bộ môn"
            allowClear
            style={{ width: '100%' }}
            value={filterDept}
            onChange={setFilterDept}
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Col>
      </Row>

      <DataGrid
        columns={columns}
        fetchData={fetchLecturers}
        queryKey="lecturers"
        queryParams={{
          search: searchText || undefined,
          department_id: filterDept,
        }}
        permissionPrefix="lecturers"
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
