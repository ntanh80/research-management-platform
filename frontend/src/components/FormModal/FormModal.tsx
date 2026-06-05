import { useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, DatePicker, InputNumber, Spin } from 'antd';

const { TextArea } = Input;

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'password' | 'textarea' | 'switch' | 'select' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: unknown }[];
  rules?: Record<string, unknown>[];
  hidden?: boolean;
  disabled?: boolean;
  span?: number;
}

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  fields: FieldConfig[];
  title: string;
  initialValues?: Record<string, unknown>;
  loading?: boolean;
  width?: number;
}

export default function FormModal({
  open,
  onClose,
  onSubmit,
  fields,
  title,
  initialValues,
  loading,
  width = 600,
}: FormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
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

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case 'text':
        return <Input placeholder={field.placeholder} disabled={field.disabled} />;
      case 'password':
        return <Input.Password placeholder={field.placeholder} disabled={field.disabled} />;
      case 'textarea':
        return <TextArea rows={3} placeholder={field.placeholder} disabled={field.disabled} />;
      case 'switch':
        return <Switch disabled={field.disabled} />;
      case 'select':
        return (
          <Select
            placeholder={field.placeholder}
            options={field.options}
            disabled={field.disabled}
            allowClear
          />
        );
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        );
      case 'date':
        return <DatePicker style={{ width: '100%' }} disabled={field.disabled} />;
      default:
        return <Input placeholder={field.placeholder} disabled={field.disabled} />;
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={width}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={!!loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          style={{ marginTop: 16 }}
        >
          {fields
            .filter((f) => !f.hidden)
            .map((field) => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={
                  field.required
                    ? [{ required: true, message: `${field.label} is required` }]
                    : []
                }
                valuePropName={field.type === 'switch' ? 'checked' : 'value'}
              >
                {renderField(field)}
              </Form.Item>
            ))}
        </Form>
      </Spin>
    </Modal>
  );
}
