import { Layout, Button, Dropdown, Space, Typography, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const currentTheme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { token } = theme.useToken();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const dropdownItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Hồ sơ',
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: token.colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Space>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
        />
      </Space>

      <Space size="middle">
        <Button
          type="text"
          icon={currentTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
        />

        <Dropdown menu={dropdownItems}>
          <Space style={{ cursor: 'pointer' }}>
            <UserOutlined />
            <Text>{user?.full_name || user?.username || 'Người dùng'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
