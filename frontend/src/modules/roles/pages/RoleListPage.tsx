import { useState, useCallback } from 'react';
import { Button, Space, Tag, Popconfirm, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/api/roles.api';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/formatters';
import type { Role, RoleCreate, RoleUpdate } from '@/types/role.types';
import type { Pagination } from '@/types/api.types';
import DataGrid from '@/components/DataGrid/DataGrid';
import PageHeader from '@/components/PageHeader/PageHeader';
import RoleFormModal from './RoleFormModal';

export default function RoleListPage() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: RoleCreate) => rolesApi.createRole(data),
    onSuccess: () => {
      message.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Failed to create role';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleUpdate }) =>
      rolesApi.updateRole(id, data),
    onSuccess: () => {
      message.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Failed to update role';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: () => {
      message.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: () => {
      message.error('Failed to delete role');
    },
  });

  const handleCreate = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleSubmit = async (values: RoleCreate | RoleUpdate) => {
    if (selectedRole) {
      await updateMutation.mutateAsync({
        id: selectedRole.id,
        data: values as RoleUpdate,
      });
    } else {
      await createMutation.mutateAsync(values as RoleCreate);
    }
  };

  const fetchRoles = useCallback(
    async (params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }) => {
      const res = await rolesApi.getRoles(params);
      return res as { success: boolean; data: Role[]; pagination: Pagination | null };
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      render: (_: unknown, record: Role) => (
        <Space>
          {can('roles.edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {can('roles.delete') && (
            <Popconfirm
              title="Delete this role?"
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
        title="Roles"
        createPermission="roles.create"
        onCreate={handleCreate}
      />

      <DataGrid
        columns={columns}
        fetchData={fetchRoles}
        queryKey="roles"
        permissionPrefix="roles"
        actions={
          can('roles.create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              New Role
            </Button>
          )
        }
      />

      <RoleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedRole}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
