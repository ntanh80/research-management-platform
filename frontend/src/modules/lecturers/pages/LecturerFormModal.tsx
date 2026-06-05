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
      label: 'Thông tin cơ bản',
      children: (
        <div>
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input disabled={isEdit} placeholder="VD: GV001" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item name="academic_title" label="Học hàm">
            <Input placeholder="VD: Giáo sư" />
          </Form.Item>

          <Form.Item name="degree" label="Học vị">
            <Input placeholder="VD: Tiến sĩ" />
          </Form.Item>

          <Form.Item name="position" label="Chức vụ">
            <Input placeholder="VD: Trưởng khoa" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Điện thoại">
            <Input placeholder="Số điện thoại" />
          </Form.Item>

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

          <Form.Item name="status" label="Trạng thái" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'research',
      label: 'Nghiên cứu',
      children: (
        <div>
          <Form.Item name="specialization" label="Chuyên môn">
            <Input placeholder="Chuyên môn chính" />
          </Form.Item>

          <Form.Item name="research_interests" label="Hướng nghiên cứu">
            <TextArea rows={3} placeholder="Hướng nghiên cứu" />
          </Form.Item>

          <Form.Item name="scholar_url" label="Google Scholar">
            <Input placeholder="https://scholar.google.com/..." />
          </Form.Item>

          <Form.Item name="orcid" label="ORCID">
            <Input placeholder="0000-0000-0000-0000" />
          </Form.Item>

          <Form.Item name="scopus_id" label="Scopus ID">
            <Input placeholder="Mã tác giả Scopus" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú bổ sung" />
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={isEdit ? 'Sửa giảng viên' : 'Thêm giảng viên'}
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
