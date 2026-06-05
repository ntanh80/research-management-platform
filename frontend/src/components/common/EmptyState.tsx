import { Empty } from 'antd';

interface EmptyStateProps {
  description?: string;
}

export default function EmptyState({
  description = 'Không có dữ liệu',
}: EmptyStateProps) {
  return <Empty description={description} />;
}
