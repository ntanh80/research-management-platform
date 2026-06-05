import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Spin } from 'antd';
import type { User, UserCreate, UserUpdate } from '@/types/user.types';
import type { Department } from '@/types/department.types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: UserCreate | UserUpdate) => Promise<void>;
  initialValues?: User | null;
  departments: Department[];
  loading?: boolean;
}

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  departments,
  loading,
}: UserFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          username: initialValues.username,
          email: initialValues.email,
          full_name: initialValues.full_name,
          department_id: initialValues.department_id,
          is_active: initialValues.is_active,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? 'Edit User' : 'Create User'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={!!loading}>
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input disabled={isEdit} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item name="department_id" label="Department">
            <Select
              allowClear
              placeholder="Select department"
              options={departments.map((d) => ({
                label: d.name,
                value: d.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
