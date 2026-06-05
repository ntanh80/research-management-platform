import { Skeleton, Space } from 'antd';

interface LoadingProps {
  rows?: number;
  type?: 'table' | 'card' | 'form';
}

export default function Loading({ rows = 5, type = 'table' }: LoadingProps) {
  if (type === 'card') {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Skeleton active paragraph={{ rows: 1 }} />
        <Skeleton active paragraph={{ rows: 2 }} />
      </Space>
    );
  }

  if (type === 'form') {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton.Input key={i} active block style={{ height: 40 }} />
        ))}
      </Space>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          active
          title={false}
          paragraph={{ rows: 1, width: ['100%'] }}
        />
      ))}
    </Space>
  );
}
