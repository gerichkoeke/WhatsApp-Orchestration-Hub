import axios from 'axios';
import { db } from '../db/index.js';
import { instances } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const getMetaClient = async (instanceName: string) => {
  if (!db) throw new Error('Database not connected');
  
  const instanceList = await db.select().from(instances).where(eq(instances.name, instanceName));
  if (instanceList.length === 0) {
    throw new Error(`Instance ${instanceName} not found`);
  }
  
  const instance = instanceList[0];

  const version = process.env.META_GRAPH_VERSION || 'v19.0';
  const phoneId = instance.phoneNumberId;
  const token = instance.accessToken;

  if (!phoneId || !token) {
    throw new Error(`META_PHONE_ID or META_TOKEN is not configured for instance ${instanceName}`);
  }

  return axios.create({
    baseURL: `https://graph.facebook.com/${version}/${phoneId}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const sendMetaMessage = async (instanceName: string, payload: any) => {
  const client = await getMetaClient(instanceName);
  try {
    const response = await client.post('/messages', payload);
    return response.data;
  } catch (error: any) {
    console.error(`Meta API Error [${instanceName}]:`, error.response?.data || error.message);
    throw error;
  }
};

export const sendTextMessage = async (instanceName: string, to: string, text: string) => {
  return sendMetaMessage(instanceName, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body: text,
    },
  });
};

export const sendListMessage = async (instanceName: string, to: string, text: string, button: string, sections: any[]) => {
  return sendMetaMessage(instanceName, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: {
        type: 'text',
        text: 'Armazém Cloud'
      },
      body: {
        text
      },
      action: {
        button,
        sections
      }
    }
  });
};
