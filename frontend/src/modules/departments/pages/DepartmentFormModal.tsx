import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Spin } from 'antd';
import type { Department, DepartmentCreate, DepartmentUpdate } from '@/types/department.types';
import type { Lecturer } from '@/types/lecturer.types';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DepartmentCreate | DepartmentUpdate) => Promise<void>;
  initialValues?: Department | null;
  lecturers: Lecturer[];
  loading?: boolean;
}

export default function DepartmentFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  lecturers,
  loading,
}: DepartmentFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          code: initialValues.code,
          name: initialValues.name,
          description: initialValues.description,
          head_lecturer_id: initialValues.head_lecturer_id,
          status: initialValues.status,
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
      title={isEdit ? 'Edit Department' : 'Create Department'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={!!loading}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Code is required' }]}
          >
            <Input disabled={isEdit} placeholder="e.g., CS" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="e.g., Computer Science" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="head_lecturer_id" label="Head Lecturer">
            <Select
              allowClear
              placeholder="Select head lecturer"
              showSearch
              optionFilterProp="label"
              options={lecturers
                .filter((l) => l.status)
                .map((l) => ({
                  label: `${l.full_name} (${l.code})`,
                  value: l.id,
                }))}
            />
          </Form.Item>

          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
