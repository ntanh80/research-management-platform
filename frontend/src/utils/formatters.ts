import dayjs from 'dayjs';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('DD/MM/YYYY');
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('DD/MM/YYYY HH:mm');
}

export function formatStatus(status: boolean | string | null | undefined): string {
  if (status === null || status === undefined) return '-';
  if (typeof status === 'boolean') {
    return status ? 'Active' : 'Inactive';
  }
  return String(status);
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
