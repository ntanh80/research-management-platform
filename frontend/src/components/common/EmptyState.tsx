import { Empty } from 'antd';

interface EmptyStateProps {
  description?: string;
}

export default function EmptyState({
  description = 'No data',
}: EmptyStateProps) {
  return <Empty description={description} />;
}
