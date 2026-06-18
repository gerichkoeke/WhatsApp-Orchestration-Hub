import axios from 'axios';

const getSoftdeskClient = () => {
  const url = process.env.SOFTDESK_URL;
  const token = process.env.SOFTDESK_TOKEN;

  if (!url || !token) {
    throw new Error('SOFTDESK_URL or SOFTDESK_TOKEN is not configured');
  }

  return axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const searchClientByPhone = async (phone: string) => {
  const client = getSoftdeskClient();
  // Example endpoint
  const response = await client.get(`/api/clientes?telefone=${phone}`);
  return response.data;
};

export const createTicket = async (data: any) => {
  const client = getSoftdeskClient();
  // Example endpoint
  const response = await client.post(`/api/chamados`, data);
  return response.data;
};
