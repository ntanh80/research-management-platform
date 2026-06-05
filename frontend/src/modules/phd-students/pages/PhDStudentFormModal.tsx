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
  { label: 'Đang học', value: 'studying' },
  { label: 'Đã bảo vệ', value: 'defended' },
  { label: 'Đã thôi học', value: 'dropped_out' },
  { label: 'Tạm ngừng', value: 'suspended' },
  { label: 'Đã tốt nghiệp', value: 'graduated' },
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
      title={isEdit ? 'Sửa nghiên cứu sinh' : 'Thêm nghiên cứu sinh'}
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
            <Input disabled={isEdit} placeholder="VD: NCS001" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item name="date_of_birth" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select
              options={[
                { label: 'Nam', value: 'male' },
                { label: 'Nữ', value: 'female' },
                { label: 'Khác', value: 'other' },
              ]}
              allowClear
            />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Điện thoại">
            <Input placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item name="organization" label="Đơn vị công tác">
            <Input placeholder="Đơn vị công tác" />
          </Form.Item>

          <Form.Item name="major" label="Chuyên ngành">
            <Input placeholder="Chuyên ngành" />
          </Form.Item>

          <Form.Item name="major_code" label="Mã chuyên ngành">
            <Input placeholder="Mã chuyên ngành" />
          </Form.Item>

          <Form.Item name="cohort" label="Khóa">
            <Input placeholder="VD: 2024" />
          </Form.Item>

          <Form.Item name="admission_decision_date" label="Ngày nhập học">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="expected_defense_date" label="Dự kiến bảo vệ">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select options={statusOptions} allowClear placeholder="Chọn trạng thái" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú bổ sung" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
