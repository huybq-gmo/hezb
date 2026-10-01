export type AdminMessage = { id: string; name: string; email: string; company: string; topic: string; message: string; status: 'new' | 'read' | 'replied' | 'archived'; createdAt: string };

export const localAdminMessages: AdminMessage[] = [
  { id: 'msg-1', name: 'Nguyễn Hà', email: 'ha@example.com', company: 'Northstar', topic: 'AI integration', message: 'Chúng tôi muốn tìm hiểu về một trợ lý AI cho đội hỗ trợ.', status: 'new', createdAt: '2026-10-01' },
  { id: 'msg-2', name: 'Minh Phạm', email: 'minh@example.com', company: 'Kite', topic: 'Process automation', message: 'Cần tư vấn tự động hóa quy trình duyệt đơn.', status: 'read', createdAt: '2026-09-30' },
];
