import { Router } from 'express';
import { sendTextMessage, sendListMessage, sendMetaMessage } from '../services/meta.js';
import { assignConversation, toggleStatus } from '../services/chatwoot.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRouter.post('/send/text/:instanceName', async (req, res) => {
  const { to, text } = req.body;
  const { instanceName } = req.params;

  if (!to || !text) {
    return res.status(400).json({ error: 'Missing to or text' });
  }

  try {
    const result = await sendTextMessage(instanceName, to, text);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/send/list/:instanceName', async (req, res) => {
  const { to, text, button, sections } = req.body;
  const { instanceName } = req.params;
  
  if (!to || !text || !button || !sections) {
    return res.status(400).json({ error: 'Missing required list fields' });
  }

  try {
    const result = await sendListMessage(instanceName, to, text, button, sections);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/send/template/:instanceName', async (req, res) => {
  const { to, templateName, languageCode, components } = req.body;
  const { instanceName } = req.params;
  
  if (!to || !templateName) {
    return res.status(400).json({ error: 'Missing to or templateName' });
  }

  try {
    const result = await sendMetaMessage(instanceName, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode || 'pt_BR' },
        components: components || [],
      }
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/conversation/assign/:instanceName', async (req, res) => {
  const { conversationId, teamId, assigneeId } = req.body;
  const { instanceName } = req.params;

  if (!conversationId) {
    return res.status(400).json({ error: 'Missing conversationId' });
  }

  try {
    const result = await assignConversation(instanceName, conversationId, teamId, assigneeId);
    return res.json(result.data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/conversation/close/:instanceName', async (req, res) => {
  const { conversationId } = req.body;
  const { instanceName } = req.params;

  if (!conversationId) {
    return res.status(400).json({ error: 'Missing conversationId' });
  }

  try {
    const result = await toggleStatus(instanceName, conversationId, 'resolved');
    return res.json(result.data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
