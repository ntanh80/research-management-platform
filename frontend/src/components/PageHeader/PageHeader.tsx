import { Typography, Space, Button, Breadcrumb } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { usePermission } from '@/hooks/usePermission';

const { Title } = Typography;

interface Action {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  permission?: string;
  type?: 'primary' | 'default' | 'dashed';
}

interface PageHeaderProps {
  title: string;
  breadcrumb?: { label: string; href?: string }[];
  onCreate?: () => void;
  createPermission?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  extraActions?: Action[];
}

export default function PageHeader({
  title,
  breadcrumb,
  onCreate,
  createPermission,
  onRefresh,
  onExport,
  onImport,
  extraActions,
}: PageHeaderProps) {
  const { can } = usePermission();

  const canCreate = createPermission ? can(createPermission) : true;

  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb
          items={breadcrumb.map((item) => ({
            title: item.label,
            href: item.href,
          }))}
          style={{ marginBottom: 8 }}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Space>
          {onImport && <Button icon={<UploadOutlined />} onClick={onImport}>Nhập</Button>}
          {onExport && <Button icon={<DownloadOutlined />} onClick={onExport}>Xuất</Button>}
          {onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Làm mới
            </Button>
          )}
          {extraActions?.map((action) => {
            if (action.permission && !can(action.permission)) return null;
            return (
              <Button
                key={action.key}
                type={action.type || 'default'}
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            );
          })}
          {onCreate && canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              Thêm mới
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
