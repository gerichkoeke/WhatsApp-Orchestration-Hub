import axios from 'axios';
import { db } from '../db/index.js';
import { instances } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const getChatwootClient = async (instanceName: string) => {
  if (!db) throw new Error('Database not connected');
  
  const instanceList = await db.select().from(instances).where(eq(instances.name, instanceName));
  if (instanceList.length === 0) {
    throw new Error(`Instance ${instanceName} not found`);
  }
  
  const instance = instanceList[0];
  
  const url = instance.chatwootUrl || process.env.CHATWOOT_URL;
  const token = instance.chatwootToken || process.env.CHATWOOT_ADMIN_TOKEN;

  if (!url || !token) {
    throw new Error(`CHATWOOT_URL or CHATWOOT_ADMIN_TOKEN is not configured for instance ${instanceName}`);
  }

  return axios.create({
    baseURL: `${url}/api/v1`,
    headers: {
      api_access_token: token,
      'Content-Type': 'application/json',
    },
  });
};

export const getConversation = async (instanceName: string, conversationId: string | number) => {
  const client = await getChatwootClient(instanceName);
  const instanceList = await db!.select().from(instances).where(eq(instances.name, instanceName));
  const accountId = instanceList[0]?.chatwootAccountId || process.env.CHATWOOT_ACCOUNT_ID || '1';
  try {
    const response = await client.get(`/accounts/${accountId}/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Chatwoot API Error [${instanceName}]:`, error.response?.data || error.message);
    throw error;
  }
};

export const addPrivateNote = async (instanceName: string, conversationId: string | number, content: string) => {
  const client = await getChatwootClient(instanceName);
  const instanceList = await db!.select().from(instances).where(eq(instances.name, instanceName));
  const accountId = instanceList[0]?.chatwootAccountId || process.env.CHATWOOT_ACCOUNT_ID || '1';
  return client.post(`/accounts/${accountId}/conversations/${conversationId}/messages`, {
    content,
    private: true,
  });
};

export const assignConversation = async (instanceName: string, conversationId: string | number, teamId?: number, assigneeId?: number) => {
  const client = await getChatwootClient(instanceName);
  const instanceList = await db!.select().from(instances).where(eq(instances.name, instanceName));
  const accountId = instanceList[0]?.chatwootAccountId || process.env.CHATWOOT_ACCOUNT_ID || '1';
  
  const payload: any = {};
  if (teamId) payload.team_id = teamId;
  if (assigneeId) payload.assignee_id = assigneeId;

  return client.post(`/accounts/${accountId}/conversations/${conversationId}/assignments`, payload);
};

export const toggleStatus = async (instanceName: string, conversationId: string | number, status: 'open' | 'resolved' | 'pending' | 'snoozed') => {
  const client = await getChatwootClient(instanceName);
  const instanceList = await db!.select().from(instances).where(eq(instances.name, instanceName));
  const accountId = instanceList[0]?.chatwootAccountId || process.env.CHATWOOT_ACCOUNT_ID || '1';
  return client.post(`/accounts/${accountId}/conversations/${conversationId}/toggle_status`, {
    status
  });
};

export const addLabels = async (instanceName: string, conversationId: string | number, labels: string[]) => {
  const client = await getChatwootClient(instanceName);
  const instanceList = await db!.select().from(instances).where(eq(instances.name, instanceName));
  const accountId = instanceList[0]?.chatwootAccountId || process.env.CHATWOOT_ACCOUNT_ID || '1';
  return client.post(`/accounts/${accountId}/conversations/${conversationId}/labels`, {
    labels
  });
};
