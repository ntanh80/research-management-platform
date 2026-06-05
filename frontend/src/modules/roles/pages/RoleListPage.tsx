import { useState, useCallback } from 'react';
import { Button, Space, Tag, Popconfirm, message, Row, Col, Input } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
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
  const [searchText, setSearchText] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: RoleCreate) => rolesApi.createRole(data),
    onSuccess: () => {
      message.success('Vai trò đã được tạo');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Tạo vai trò thất bại';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleUpdate }) =>
      rolesApi.updateRole(id, data),
    onSuccess: () => {
      message.success('Vai trò đã được cập nhật');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Cập nhật vai trò thất bại';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: () => {
      message.success('Vai trò đã được xóa');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: () => {
      message.error('Xóa vai trò thất bại');
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
      const res = await rolesApi.getRoles({
        ...params,
        search: searchText || undefined,
      });
      return res as { success: boolean; data: Role[]; pagination: Pagination | null };
    },
    [searchText]
  );

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) =>
        status ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>,
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
              title="Xóa vai trò này?"
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
        title="Vai trò"
        createPermission="roles.create"
        onCreate={handleCreate}
      />

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
      </Row>

      <DataGrid
        columns={columns}
        fetchData={fetchRoles}
        queryKey="roles"
        queryParams={{ search: searchText || undefined }}
        permissionPrefix="roles"
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
