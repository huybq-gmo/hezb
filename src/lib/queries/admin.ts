import { localAdminMessages, type AdminMessage } from '@/lib/admin-data';
import { localMembers, localProjects } from '@/lib/data';
import { getServerClient } from '@/lib/supabase/server';

export type AdminDashboardData = {
  totalProjects: number;
  publishedProjects: number;
  publishedMembers: number;
  newMessages: number;
  recentMessages: AdminMessage[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const client = await getServerClient();
  if (client) {
    const [projectsResult, membersResult, messagesResult] = await Promise.all([
      client.from('projects').select('id, is_published'),
      client.from('members').select('id, is_published'),
      client.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    if (!projectsResult.error && !membersResult.error && !messagesResult.error && projectsResult.data && membersResult.data && messagesResult.data) {
      const allMessages: AdminMessage[] = messagesResult.data.map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        company: message.company ?? '',
        topic: message.topic,
        message: message.message,
        status: message.status,
        createdAt: message.created_at,
      }));
      return {
        totalProjects: projectsResult.data.length,
        publishedProjects: projectsResult.data.filter((project) => project.is_published).length,
        publishedMembers: membersResult.data.filter((member) => member.is_published).length,
        newMessages: allMessages.filter((message) => message.status === 'new').length,
        recentMessages: allMessages.slice(0, 5),
      };
    }
  }

  const recentMessages = localAdminMessages.slice(0, 5);
  return {
    totalProjects: localProjects.length,
    publishedProjects: localProjects.filter((project) => project.is_published).length,
    publishedMembers: localMembers.filter((member) => member.is_published).length,
    newMessages: recentMessages.filter((message) => message.status === 'new').length,
    recentMessages,
  };
}
