import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  SafetyOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

const { Sider } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission: string;
}

const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', permission: 'dashboard.view' },
  { key: '/phd-students', icon: <SolutionOutlined />, label: 'PhD Students', permission: 'phd_students.view' },
  { key: '/lecturers', icon: <TeamOutlined />, label: 'Lecturers', permission: 'lecturers.view' },
  { key: '/departments', icon: <BankOutlined />, label: 'Departments', permission: 'departments.view' },
  { key: '/users', icon: <UserOutlined />, label: 'Users', permission: 'users.view' },
  { key: '/roles', icon: <SafetyOutlined />, label: 'Roles', permission: 'roles.view' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  const can = useAuthStore((s) => s.can);

  const filteredItems = useMemo(
    () =>
      menuItems
        .filter((item) => can(item.permission))
        .map(({ key, icon, label }) => ({
          key,
          icon,
          label,
        })),
    [can]
  );

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: collapsed ? 14 : 18,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {collapsed ? 'RMP' : 'Research Mgmt'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={filteredItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}
