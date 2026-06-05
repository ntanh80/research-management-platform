import { useState, useCallback } from 'react';
import { Table, type TablePaginationConfig } from 'antd';
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
  permissionPrefix?: string;
  defaultPageSize?: number;
  onRefetch?: (refetch: () => void) => void;
}

export default function DataGrid<T extends Record<string, unknown>>({
  columns,
  fetchData,
  queryKey,
  queryParams,
  rowKey = 'id',
  permissionPrefix,
  defaultPageSize = 10,
  onRefetch,
}: DataGridProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>();
  const { can } = usePermission();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, { page, pageSize, sortBy, sortOrder, ...queryParams }],
    queryFn: () =>
      fetchData({ page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder, ...queryParams }),
  });

  // Expose refetch to parent via callback
  if (onRefetch) {
    onRefetch(refetch);
  }

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      _filters: Record<string, unknown>,
      sorter: SorterResult<T> | SorterResult<T>[],
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
    [defaultPageSize],
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

  return (
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
  );
}
