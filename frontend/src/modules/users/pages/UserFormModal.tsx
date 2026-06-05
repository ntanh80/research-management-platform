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
      title={isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}
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
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input disabled={isEdit} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item name="department_id" label="Khoa/Bộ môn">
            <Select
              allowClear
              placeholder="Chọn khoa/bộ môn"
              options={departments.map((d) => ({
                label: d.name,
                value: d.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="is_active" label="Hoạt động" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
