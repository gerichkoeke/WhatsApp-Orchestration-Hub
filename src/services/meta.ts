import axios from 'axios';

const getMetaClient = () => {
  const version = process.env.META_GRAPH_VERSION || 'v19.0';
  const phoneId = process.env.META_PHONE_ID;
  const token = process.env.META_TOKEN;

  if (!phoneId || !token) {
    throw new Error('META_PHONE_ID or META_TOKEN is not configured');
  }

  return axios.create({
    baseURL: `https://graph.facebook.com/${version}/${phoneId}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const sendMetaMessage = async (payload: any) => {
  const client = getMetaClient();
  try {
    const response = await client.post('/messages', payload);
    return response.data;
  } catch (error: any) {
    console.error('Meta API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const sendTextMessage = async (to: string, text: string) => {
  return sendMetaMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body: text,
    },
  });
};

export const sendListMessage = async (to: string, text: string, button: string, sections: any[]) => {
  return sendMetaMessage({
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
