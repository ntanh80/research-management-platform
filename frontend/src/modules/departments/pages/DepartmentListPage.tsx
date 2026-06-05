import { useState, useCallback } from 'react';
import { Button, Space, Tag, Popconfirm, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '@/api/departments.api';
import { lecturersApi } from '@/api/lecturers.api';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/formatters';
import type { Department, DepartmentCreate, DepartmentUpdate } from '@/types/department.types';
import type { Pagination } from '@/types/api.types';
import DataGrid from '@/components/DataGrid/DataGrid';
import PageHeader from '@/components/PageHeader/PageHeader';
import DepartmentFormModal from './DepartmentFormModal';

export default function DepartmentListPage() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const { data: lecturersData } = useQuery({
    queryKey: ['lecturers-all'],
    queryFn: () => lecturersApi.getLecturers({ page_size: 200 }),
  });

  const lecturers = lecturersData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: DepartmentCreate) => departmentsApi.createDepartment(data),
    onSuccess: () => {
      message.success('Department created successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Failed to create department';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentUpdate }) =>
      departmentsApi.updateDepartment(id, data),
    onSuccess: () => {
      message.success('Department updated successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Failed to update department';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentsApi.deleteDepartment(id),
    onSuccess: () => {
      message.success('Department deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => {
      message.error('Failed to delete department');
    },
  });

  const handleCreate = () => {
    setSelectedDept(null);
    setModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setModalOpen(true);
  };

  const handleSubmit = async (values: DepartmentCreate | DepartmentUpdate) => {
    if (selectedDept) {
      await updateMutation.mutateAsync({
        id: selectedDept.id,
        data: values as DepartmentUpdate,
      });
    } else {
      await createMutation.mutateAsync(values as DepartmentCreate);
    }
  };

  const fetchDepartments = useCallback(
    async (params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }) => {
      const res = await departmentsApi.getDepartments(params);
      return res as {
        success: boolean;
        data: Department[];
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Head Lecturer',
      dataIndex: 'head_lecturer_id',
      key: 'head_lecturer_id',
      render: (_: unknown, record: Department) => {
        if (!record.head_lecturer_id) return '-';
        const lecturer = lecturers.find((l) => l.id === record.head_lecturer_id);
        return lecturer?.full_name || '-';
      },
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
      render: (_: unknown, record: Department) => (
        <Space>
          {can('departments.edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {can('departments.delete') && (
            <Popconfirm
              title="Delete this department?"
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
        title="Departments"
        createPermission="departments.create"
        onCreate={handleCreate}
      />

      <DataGrid
        columns={columns}
        fetchData={fetchDepartments}
        queryKey="departments"
        permissionPrefix="departments"
        actions={
          can('departments.create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              New Department
            </Button>
          )
        }
      />

      <DepartmentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedDept}
        lecturers={lecturers}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
