import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Spin,
  Tabs,
  Checkbox,
  Space,
  Typography,
  Card,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '@/api/permissions.api';
import type { Role, RoleCreate, RoleUpdate } from '@/types/role.types';
import type { PermissionModule } from '@/types/role.types';

const { Text } = Typography;

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RoleCreate | RoleUpdate) => Promise<void>;
  initialValues?: Role | null;
  loading?: boolean;
}

export default function RoleFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: RoleFormModalProps) {
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const isEdit = !!initialValues;

  const { data: modulesData } = useQuery({
    queryKey: ['permission-modules'],
    queryFn: () => permissionsApi.getModules(),
    enabled: open,
  });

  const modules = modulesData?.data || [];

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          code: initialValues.code,
          name: initialValues.name,
          description: initialValues.description,
          status: initialValues.status,
        });
        setSelectedPermissions(
          initialValues.permissions?.map((p) => p.id) || []
        );
      } else {
        form.resetFields();
        setSelectedPermissions([]);
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        permission_ids: selectedPermissions,
      });
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPermissions([]);
    onClose();
  };

  const handlePermissionChange = (modulePermIds: number[], module: PermissionModule) => {
    const otherModuleIds = selectedPermissions.filter(
      (id) => !module.permissions.some((p) => p.id === id)
    );
    setSelectedPermissions([...otherModuleIds, ...modulePermIds]);
  };

  const tabItems = modules.map((mod) => ({
    key: mod.module,
    label: mod.module.charAt(0).toUpperCase() + mod.module.slice(1),
    children: (
      <Card size="small" style={{ marginTop: 8 }}>
        <Checkbox
          indeterminate={
            mod.permissions.some((p) => selectedPermissions.includes(p.id)) &&
            !mod.permissions.every((p) => selectedPermissions.includes(p.id))
          }
          checked={mod.permissions.every((p) => selectedPermissions.includes(p.id))}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedPermissions([
                ...selectedPermissions.filter(
                  (id) => !mod.permissions.some((p) => p.id === id)
                ),
                ...mod.permissions.map((p) => p.id),
              ]);
            } else {
              setSelectedPermissions(
                selectedPermissions.filter(
                  (id) => !mod.permissions.some((p) => p.id === id)
                )
              );
            }
          }}
        >
          <Text strong>Chọn tất cả</Text>
        </Checkbox>
        <div style={{ marginTop: 8 }}>
          <Checkbox.Group
            value={selectedPermissions.filter((id) =>
              mod.permissions.some((p) => p.id === id)
            )}
            onChange={(checkedValues) =>
              handlePermissionChange(checkedValues as number[], mod)
            }
          >
            <Space direction="vertical">
              {mod.permissions.map((perm) => (
                <Checkbox key={perm.id} value={perm.id}>
                  {perm.name}
                  <Text type="secondary" style={{ marginLeft: 4 }}>
                    ({perm.code})
                  </Text>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      </Card>
    ),
  }));

  return (
    <Modal
      title={isEdit ? 'Sửa vai trò' : 'Thêm vai trò'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={!!loading}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input disabled={isEdit} placeholder="VD: admin" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="VD: Quản trị viên" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>

          {open && modules.length > 0 && (
            <Form.Item label="Quyền">
              <Tabs items={tabItems} />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
