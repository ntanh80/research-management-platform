import { useState, useCallback } from 'react';
import {
  Button,
  Space,
  Tag,
  Input,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Select,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UnlockOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { departmentsApi } from '@/api/departments.api';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/formatters';
import type { User, UserCreate, UserUpdate } from '@/types/user.types';
import type { Pagination } from '@/types/api.types';
import DataGrid from '@/components/DataGrid/DataGrid';
import PageHeader from '@/components/PageHeader/PageHeader';
import UserFormModal from './UserFormModal';

const { Text } = Typography;

export default function UserListPage() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState<number | undefined>();
  const [filterActive, setFilterActive] = useState<boolean | undefined>();

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments({ page_size: 100 }),
  });

  const departments = departmentsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: UserCreate) => usersApi.createUser(data),
    onSuccess: () => {
      message.success('Người dùng đã được tạo');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Tạo người dùng thất bại';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      message.success('Người dùng đã được cập nhật');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Cập nhật người dùng thất bại';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      message.success('Người dùng đã được xóa');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Xóa người dùng thất bại');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      usersApi.resetPassword(id, password),
    onSuccess: () => {
      message.success('Đặt lại mật khẩu thành công');
    },
    onError: () => {
      message.error('Đặt lại mật khẩu thất bại');
    },
  });

  const unlockMutation = useMutation({
    mutationFn: (id: number) => usersApi.unlockUser(id),
    onSuccess: () => {
      message.success('Mở khóa người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Mở khóa người dùng thất bại');
    },
  });

  const handleCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSubmit = async (values: UserCreate | UserUpdate) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        data: values as UserUpdate,
      });
    } else {
      await createMutation.mutateAsync(values as UserCreate);
    }
  };

  const fetchUsers = useCallback(
    async (params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }) => {
      const res = await usersApi.getUsers({
        ...params,
        search: searchText || undefined,
        department_id: filterDept,
        is_active: filterActive,
      });
      return res as { success: boolean; data: User[]; pagination: Pagination | null };
    },
    [searchText, filterDept, filterActive]
  );

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: true,
    },
    {
      title: 'Khoa/Bộ môn',
      dataIndex: 'department_id',
      key: 'department_id',
      render: (_: unknown, record: User) => {
        const dept = departments.find((d) => d.id === record.department_id);
        return dept?.name || '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) =>
        active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>,
    },
    {
      title: 'Lần cuối đăng nhập',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (date: string | null) => formatDateTime(date),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space>
          {can('users.edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {can('users.edit') && (
            <Popconfirm
              title="Đặt lại mật khẩu mặc định?"
              onConfirm={() =>
                resetPasswordMutation.mutate({ id: record.id, password: 'default123' })
              }
            >
              <Button type="link" icon={<KeyOutlined />} />
            </Popconfirm>
          )}
          {can('users.edit') && (
            <Popconfirm
              title="Mở khóa người dùng này?"
              onConfirm={() => unlockMutation.mutate(record.id)}
            >
              <Button type="link" icon={<UnlockOutlined />} />
            </Popconfirm>
          )}
          {can('users.delete') && (
            <Popconfirm
              title="Xóa người dùng này?"
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
        title="Người dùng"
        createPermission="users.create"
        onCreate={handleCreate}
        extraActions={[
          {
            key: 'search',
            label: '',
            icon: <SearchOutlined />,
            onClick: () => {},
          },
        ]}
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
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Khoa/Bộ môn"
            allowClear
            style={{ width: '100%' }}
            value={filterDept}
            onChange={setFilterDept}
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: '100%' }}
            value={filterActive}
            onChange={(val) => setFilterActive(val ?? undefined)}
            options={[
              { label: 'Hoạt động', value: true },
              { label: 'Không hoạt động', value: false },
            ]}
          />
        </Col>
      </Row>

      <DataGrid
        columns={columns}
        fetchData={fetchUsers}
        queryKey="users"
        queryParams={{
          search: searchText || undefined,
          department_id: filterDept,
          is_active: filterActive,
        }}
        permissionPrefix="users"
      />

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedUser}
        departments={departments}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
