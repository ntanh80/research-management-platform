import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Spin, Tabs } from 'antd';
import type { Lecturer, LecturerCreate, LecturerUpdate } from '@/types/lecturer.types';
import type { Department } from '@/types/department.types';

const { TextArea } = Input;

interface LecturerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LecturerCreate | LecturerUpdate) => Promise<void>;
  initialValues?: Lecturer | null;
  departments: Department[];
  loading?: boolean;
}

export default function LecturerFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  departments,
  loading,
}: LecturerFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

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

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <div>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Code is required' }]}
          >
            <Input disabled={isEdit} placeholder="e.g., GV001" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>

          <Form.Item name="academic_title" label="Academic Title">
            <Input placeholder="e.g., Professor" />
          </Form.Item>

          <Form.Item name="degree" label="Degree">
            <Input placeholder="e.g., PhD" />
          </Form.Item>

          <Form.Item name="position" label="Position">
            <Input placeholder="e.g., Dean" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="Phone number" />
          </Form.Item>

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

          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'research',
      label: 'Research',
      children: (
        <div>
          <Form.Item name="specialization" label="Specialization">
            <Input placeholder="Main specialization" />
          </Form.Item>

          <Form.Item name="research_interests" label="Research Interests">
            <TextArea rows={3} placeholder="Research interests" />
          </Form.Item>

          <Form.Item name="scholar_url" label="Google Scholar URL">
            <Input placeholder="https://scholar.google.com/..." />
          </Form.Item>

          <Form.Item name="orcid" label="ORCID">
            <Input placeholder="0000-0000-0000-0000" />
          </Form.Item>

          <Form.Item name="scopus_id" label="Scopus ID">
            <Input placeholder="Scopus author ID" />
          </Form.Item>

          <Form.Item name="note" label="Note">
            <TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={isEdit ? 'Edit Lecturer' : 'Create Lecturer'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={!!loading}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs items={tabItems} />
        </Form>
      </Spin>
    </Modal>
  );
}
