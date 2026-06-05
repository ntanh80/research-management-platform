import { useMemo, useState, useCallback } from 'react';
import { Table, Button, Space, type TablePaginationConfig } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import type { SorterResult } from 'antd/es/table/interface';
import { useQuery } from '@tanstack/react-query';
import type { Pagination } from '@/types/api.types';
import { usePermission } from '@/hooks/usePermission';
import EmptyState from '@/components/common/EmptyState';

interface DataGridProps<T> {
  columns: ColumnsType<T>;
  fetchData: (params: {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    [key: string]: unknown;
  }) => Promise<{
    success: boolean;
    data: T[];
    pagination: Pagination | null;
  }>;
  queryKey: string;
  queryParams?: Record<string, unknown>;
  rowKey?: string;
  title?: string;
  actions?: React.ReactNode;
  permissionPrefix?: string;
  showRefresh?: boolean;
  defaultPageSize?: number;
}

export default function DataGrid<T extends Record<string, unknown>>({
  columns,
  fetchData,
  queryKey,
  queryParams,
  rowKey = 'id',
  actions,
  permissionPrefix,
  showRefresh = true,
  defaultPageSize = 10,
}: DataGridProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>();
  const { can } = usePermission();

  const params = useMemo(
    () => ({
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...queryParams,
    }),
    [page, pageSize, sortBy, sortOrder, queryParams]
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetchData(params),
  });

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      _filters: Record<string, unknown>,
      sorter: SorterResult<T> | SorterResult<T>[]
    ) => {
      setPage(pagination.current || 1);
      setPageSize(pagination.pageSize || defaultPageSize);

      const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      if (singleSorter?.field) {
        setSortBy(String(singleSorter.field));
        setSortOrder(singleSorter.order === 'ascend' ? 'asc' : 'desc');
      } else {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    },
    [defaultPageSize]
  );

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total: data?.pagination?.total || 0,
    showSizeChanger: true,
    showTotal: (total) => `Tổng: ${total} mục`,
  };

  const rowSelection: TableRowSelection<T> | undefined =
    permissionPrefix && can(`${permissionPrefix}.delete`)
      ? { type: 'checkbox' as const }
      : undefined;

  const canCreate = permissionPrefix
    ? can(`${permissionPrefix}.create`)
    : true;

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {actions}
          {showRefresh && (
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Làm mới
            </Button>
          )}
        </Space>
        {canCreate && permissionPrefix && (
          <div>{/* Create button is passed via actions prop */}</div>
        )}
      </div>

      <Table<T>
        columns={columns}
        dataSource={data?.data || []}
        rowKey={rowKey}
        loading={isLoading || isFetching}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: <EmptyState description="Không có dữ liệu" />,
        }}
      />
    </div>
  );
}
