import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmOptions {
  title: string;
  content: string;
  onOk: () => Promise<void> | void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function showConfirm({
  title,
  content,
  onOk,
  onCancel,
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  danger = false,
}: ConfirmOptions) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    okButtonProps: { danger },
    onOk,
    onCancel,
    centered: true,
  });
}

export default ConfirmModal;
