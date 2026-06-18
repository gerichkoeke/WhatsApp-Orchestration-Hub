import axios from 'axios';

const getChatwootClient = () => {
  const url = process.env.CHATWOOT_URL;
  const token = process.env.CHATWOOT_ADMIN_TOKEN;

  if (!url || !token) {
    throw new Error('CHATWOOT_URL or CHATWOOT_ADMIN_TOKEN is not configured');
  }

  return axios.create({
    baseURL: `${url}/api/v1`,
    headers: {
      api_access_token: token,
      'Content-Type': 'application/json',
    },
  });
};

export const getConversation = async (conversationId: string | number) => {
  const client = getChatwootClient();
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || '1';
  try {
    const response = await client.get(`/accounts/${accountId}/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Chatwoot API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const addPrivateNote = async (conversationId: string | number, content: string) => {
  const client = getChatwootClient();
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || '1';
  return client.post(`/accounts/${accountId}/conversations/${conversationId}/messages`, {
    content,
    private: true,
  });
};

export const assignConversation = async (conversationId: string | number, teamId?: number, assigneeId?: number) => {
  const client = getChatwootClient();
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || '1';
  
  const payload: any = {};
  if (teamId) payload.team_id = teamId;
  if (assigneeId) payload.assignee_id = assigneeId;

  return client.post(`/accounts/${accountId}/conversations/${conversationId}/assignments`, payload);
};

export const toggleStatus = async (conversationId: string | number, status: 'open' | 'resolved' | 'pending' | 'snoozed') => {
  const client = getChatwootClient();
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || '1';
  return client.post(`/accounts/${accountId}/conversations/${conversationId}/toggle_status`, {
    status
  });
};

export const addLabels = async (conversationId: string | number, labels: string[]) => {
  const client = getChatwootClient();
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || '1';
  return client.post(`/accounts/${accountId}/conversations/${conversationId}/labels`, {
    labels
  });
};
