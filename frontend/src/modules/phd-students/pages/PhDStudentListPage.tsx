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
  Descriptions,
  Table,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phdStudentsApi } from '@/api/phd-students.api';
import { usePermission } from '@/hooks/usePermission';
import { formatDate, formatStatus } from '@/utils/formatters';
import type { PhDStudent, PhDStudentCreate, PhDStudentUpdate } from '@/types/phd-student.types';
import type { Pagination } from '@/types/api.types';
import DataGrid from '@/components/DataGrid/DataGrid';
import PageHeader from '@/components/PageHeader/PageHeader';
import Loading from '@/components/common/Loading';
import PhDStudentFormModal from './PhDStudentFormModal';

const statusColorMap: Record<string, string> = {
  studying: 'blue',
  defended: 'green',
  dropped_out: 'red',
  suspended: 'orange',
  graduated: 'purple',
};

export default function PhDStudentListPage() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PhDStudent | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterCohort, setFilterCohort] = useState<string | undefined>();
  const [filterMajor, setFilterMajor] = useState<string | undefined>();

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['phd-students-summary'],
    queryFn: () => phdStudentsApi.getSummary(),
  });

  const createMutation = useMutation({
    mutationFn: (data: PhDStudentCreate) => phdStudentsApi.createPhDStudent(data),
    onSuccess: () => {
      message.success('Nghiên cứu sinh đã được tạo');
      queryClient.invalidateQueries({ queryKey: ['phd-students'] });
      queryClient.invalidateQueries({ queryKey: ['phd-students-summary'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Tạo nghiên cứu sinh thất bại';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PhDStudentUpdate }) =>
      phdStudentsApi.updatePhDStudent(id, data),
    onSuccess: () => {
      message.success('Nghiên cứu sinh đã được cập nhật');
      queryClient.invalidateQueries({ queryKey: ['phd-students'] });
      queryClient.invalidateQueries({ queryKey: ['phd-students-summary'] });
      setModalOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Cập nhật nghiên cứu sinh thất bại';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => phdStudentsApi.deletePhDStudent(id),
    onSuccess: () => {
      message.success('Nghiên cứu sinh đã được xóa');
      queryClient.invalidateQueries({ queryKey: ['phd-students'] });
      queryClient.invalidateQueries({ queryKey: ['phd-students-summary'] });
    },
    onError: () => {
      message.error('Xóa nghiên cứu sinh thất bại');
    },
  });

  const handleCreate = () => {
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const handleEdit = (student: PhDStudent) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PhDStudentCreate | PhDStudentUpdate) => {
    if (selectedStudent) {
      await updateMutation.mutateAsync({
        id: selectedStudent.id,
        data: values as PhDStudentUpdate,
      });
    } else {
      await createMutation.mutateAsync(values as PhDStudentCreate);
    }
  };

  const fetchStudents = useCallback(
    async (params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }) => {
      const res = await phdStudentsApi.getPhDStudents({
        ...params,
        search: searchText || undefined,
        status: filterStatus,
        cohort: filterCohort,
        major: filterMajor,
      });
      return res as {
        success: boolean;
        data: PhDStudent[];
        pagination: Pagination | null;
      };
    },
    [searchText, filterStatus, filterCohort, filterMajor]
  );

  const expandedRowRender = (record: PhDStudent) => {
    const topicData = record.topic
      ? [
          { key: 'name', label: 'Tên đề tài', value: record.topic.name },
          {
            key: 'name_en',
            label: 'Tên đề tài (EN)',
            value: record.topic.name_en || '-',
          },
          {
            key: 'description',
            label: 'Mô tả',
            value: record.topic.description || '-',
          },
          {
            key: 'status',
            label: 'Trạng thái',
            value: formatStatus(record.topic.status),
          },
          {
            key: 'start_date',
            label: 'Ngày bắt đầu',
            value: formatDate(record.topic.start_date),
          },
          {
            key: 'expected_end_date',
            label: 'Ngày dự kiến kết thúc',
            value: formatDate(record.topic.expected_end_date),
          },
        ]
      : [];

    const supervisorColumns = [
      { title: 'Giảng viên', dataIndex: 'full_name', key: 'full_name' },
      { title: 'Vai trò', dataIndex: 'role', key: 'role' },
      {
        title: 'Chính',
        dataIndex: 'is_primary',
        key: 'is_primary',
        render: (val: boolean) => (val ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>),
      },
    ];

    return (
      <div style={{ padding: 16 }}>
        {record.topic && (
          <>
            <Descriptions title="Thông tin đề tài" size="small" column={2}>
              {topicData.map((item) => (
                <Descriptions.Item key={item.key} label={item.label}>
                  {item.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </>
        )}

        {record.supervisors && record.supervisors.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>Người hướng dẫn</h4>
            <Table
              columns={supervisorColumns}
              dataSource={record.supervisors}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}

        {!record.topic && (!record.supervisors || record.supervisors.length === 0) && (
          <p>Không có thông tin bổ sung.</p>
        )}
      </div>
    );
  };

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
      title: 'Khóa',
      dataIndex: 'cohort',
      key: 'cohort',
      sorter: true,
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'major',
      key: 'major',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColorMap[status] || 'default'}>
          {formatStatus(status)}
        </Tag>
      ),
    },
    {
      title: 'Dự kiến bảo vệ',
      dataIndex: 'expected_defense_date',
      key: 'expected_defense_date',
      render: (date: string | null) => formatDate(date),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: PhDStudent) => (
        <Space>
          {can('phd_students.edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {can('phd_students.delete') && (
            <Popconfirm
              title="Xóa nghiên cứu sinh này?"
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
        title="Nghiên cứu sinh"
        createPermission="phd_students.create"
        onCreate={handleCreate}
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
            <span style={{ color: '#666', marginRight: 4 }}>Đang học:</span>
            <b style={{ color: '#1890ff' }}>{summaryData.data.studying}</b>
          </Col>
          <Col style={{ marginLeft: 16 }}>
            <span style={{ color: '#666', marginRight: 4 }}>Đã bảo vệ:</span>
            <b style={{ color: '#3f8600' }}>{summaryData.data.defended}</b>
          </Col>
          <Col style={{ marginLeft: 16 }}>
            <span style={{ color: '#666', marginRight: 4 }}>Chưa có công bố:</span>
            <b style={{ color: '#cf1322' }}>{summaryData.data.no_publications}</b>
          </Col>
        </Row>
      ) : null}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} md={6}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: '100%' }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { label: 'Đang học', value: 'studying' },
              { label: 'Đã bảo vệ', value: 'defended' },
              { label: 'Đã thôi học', value: 'dropped_out' },
              { label: 'Tạm ngừng', value: 'suspended' },
              { label: 'Đã tốt nghiệp', value: 'graduated' },
            ]}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Input
            placeholder="Khóa"
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value || undefined)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Input
            placeholder="Chuyên ngành"
            value={filterMajor}
            onChange={(e) => setFilterMajor(e.target.value || undefined)}
            allowClear
          />
        </Col>
      </Row>

      <DataGrid
        columns={columns}
        fetchData={fetchStudents}
        queryKey="phd-students"
        queryParams={{
          search: searchText || undefined,
          status: filterStatus,
          cohort: filterCohort,
          major: filterMajor,
        }}
        permissionPrefix="phd_students"
      />

      <PhDStudentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedStudent}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
