import axios from 'axios';

export const triggerN8nWebhook = async (path: string, payload: any) => {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!baseUrl) {
    console.warn('N8N_WEBHOOK_BASE_URL not configured. Skipping trigger.');
    return;
  }
  
  try {
    const response = await axios.post(`${baseUrl}${path}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`N8n Webhook Error (${path}):`, error.message);
  }
};
