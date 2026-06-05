import { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, Spin } from 'antd';
import dayjs from 'dayjs';
import type { PhDStudent, PhDStudentCreate, PhDStudentUpdate } from '@/types/phd-student.types';

const { TextArea } = Input;

interface PhDStudentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PhDStudentCreate | PhDStudentUpdate) => Promise<void>;
  initialValues?: PhDStudent | null;
  loading?: boolean;
}

const statusOptions = [
  { label: 'Studying', value: 'studying' },
  { label: 'Defended', value: 'defended' },
  { label: 'Dropped Out', value: 'dropped_out' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Graduated', value: 'graduated' },
];

export default function PhDStudentFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: PhDStudentFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        const vals: Record<string, unknown> = { ...initialValues };
        if (initialValues.date_of_birth) {
          vals.date_of_birth = dayjs(initialValues.date_of_birth);
        }
        if (initialValues.admission_decision_date) {
          vals.admission_decision_date = dayjs(initialValues.admission_decision_date);
        }
        if (initialValues.expected_defense_date) {
          vals.expected_defense_date = dayjs(initialValues.expected_defense_date);
        }
        form.setFieldsValue(vals);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: Record<string, unknown> = { ...values };

      // Convert dayjs objects to strings
      if (values.date_of_birth) {
        payload.date_of_birth = values.date_of_birth.toISOString().split('T')[0];
      }
      if (values.admission_decision_date) {
        payload.admission_decision_date = values.admission_decision_date.toISOString().split('T')[0];
      }
      if (values.expected_defense_date) {
        payload.expected_defense_date = values.expected_defense_date.toISOString().split('T')[0];
      }

      await onSubmit(payload as PhDStudentCreate | PhDStudentUpdate);
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
      title={isEdit ? 'Edit PhD Student' : 'Create PhD Student'}
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
            label="Code"
            rules={[{ required: true, message: 'Code is required' }]}
          >
            <Input disabled={isEdit} placeholder="e.g., NCS001" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>

          <Form.Item name="date_of_birth" label="Date of Birth">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="gender" label="Gender">
            <Select
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              allowClear
            />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="Phone number" />
          </Form.Item>

          <Form.Item name="organization" label="Organization">
            <Input placeholder="Affiliated organization" />
          </Form.Item>

          <Form.Item name="major" label="Major">
            <Input placeholder="Major" />
          </Form.Item>

          <Form.Item name="major_code" label="Major Code">
            <Input placeholder="Major code" />
          </Form.Item>

          <Form.Item name="cohort" label="Cohort">
            <Input placeholder="e.g., 2024" />
          </Form.Item>

          <Form.Item name="admission_decision_date" label="Admission Decision Date">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="expected_defense_date" label="Expected Defense Date">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select options={statusOptions} allowClear placeholder="Select status" />
          </Form.Item>

          <Form.Item name="note" label="Note">
            <TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
