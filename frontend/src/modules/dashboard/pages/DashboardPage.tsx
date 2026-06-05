import { Card, Row, Col, Typography } from 'antd';
import {
  TeamOutlined,
  SolutionOutlined,
  BankOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const stats = [
  {
    title: 'Nghiên cứu sinh',
    value: '--',
    icon: <SolutionOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    color: '#e6f7ff',
  },
  {
    title: 'Giảng viên',
    value: '--',
    icon: <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    color: '#f6ffed',
  },
  {
    title: 'Khoa / Bộ môn',
    value: '--',
    icon: <BankOutlined style={{ fontSize: 32, color: '#faad14' }} />,
    color: '#fffbe6',
  },
  {
    title: 'Người dùng',
    value: '--',
    icon: <UserOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
    color: '#f9f0ff',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <Title level={4}>Tổng quan</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Chào mừng đến với Hệ thống Quản lý NCKH. Thống kê tổng quan sẽ được cập nhật trong Sprint 3.
      </Text>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card
              style={{ background: stat.color }}
              bodyStyle={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Text type="secondary">{stat.title}</Text>
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
              {stat.icon}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
