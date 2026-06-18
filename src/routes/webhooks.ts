import { Router } from 'express';
import { db } from '../db/index.js';
import { processedMessages, hubLogs } from '../db/schema.js';
import { sendTextMessage } from '../services/meta.js';
import { addPrivateNote } from '../services/chatwoot.js';
import { eq } from 'drizzle-orm';
import { triggerN8nWebhook } from '../services/n8n.js';

export const webhooksRouter = Router();

// Meta Webhook Verification
webhooksRouter.get('/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// Meta Webhook Incoming messages
webhooksRouter.post('/meta', async (req, res) => {
  const body = req.body;
  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const value = body.entry[0].changes[0].value;
      const phoneNumberId = value.metadata.phone_number_id;
      const from = value.messages[0].from; // sender phone number
      const metaMessageId = value.messages[0].id; // Meta Message ID
      
      // Store incoming message in DB to keep track of interactions
      if (db) {
        await db.insert(processedMessages).values({
          chatwootMessageId: null,
          conversationId: null, // to be updated later if needed
          metaMessageId: metaMessageId,
          direction: 'incoming',
          status: 'received',
          payload: JSON.stringify(value),
        }).onConflictDoNothing(); // Prevent duplicate processing if Meta retries
      }
      
      // If using Chatwoot Custom Inbox, we should forward this message to Chatwoot's API.
      // If using native setup but routing via proxy, we forward to n8n or Chatwoot appropriately.
      console.log(`Received incoming message from ${from}`);
    }
    return res.status(200).send('EVENT_RECEIVED');
  } else {
    return res.sendStatus(404);
  }
});

// Endpoint for chatwoot webhook
webhooksRouter.post('/chatwoot', async (req, res) => {
  const payload = req.body;
  
  if (payload.event !== 'message_created') {
    return res.status(200).send('Ignoring non-message event');
  }

  // Ensure it's an outgoing message
  if (payload.message_type !== 'outgoing') {
    return res.status(200).send('Ignoring non-outgoing message');
  }

  // Ignore private messages
  if (payload.private) {
    return res.status(200).send('Ignoring private message');
  }
  
  const chatwootMessageId = String(payload.id);
  
  // Check if we already processed this message
  if (db) {
    const existing = await db.select().from(processedMessages).where(eq(processedMessages.chatwootMessageId, chatwootMessageId)).limit(1);
    if (existing && existing.length > 0) {
      return res.status(200).send('Message already processed');
    }
  }

  // Extract necessary details
  const conversation = payload.conversation;
  const phoneNumber = conversation?.meta?.sender?.phone_number;
  if (!phoneNumber) {
    return res.status(200).send('No phone number found');
  }
  
  const sender = payload.sender; // Agent
  if (!sender) {
    return res.status(200).send('No sender found');
  }
  
  // Avoid loop: skip bot messages if needed (e.g., sender.type === 'contact' or 'system')
  if (sender.type === 'system' || sender.type === 'contact') {
    return res.status(200).send('Ignoring system/contact message');
  }

  let finalMessage = payload.content;
  
  // Add agent signature for human agents
  if (sender.type === 'user') {
    const format = process.env.AGENT_SIGNATURE_FORMAT || '{agent_name} | Armazém Cloud:\n{message}';
    
    // O nome do agente VEM DO CHATWOOT dinamicamente (sender.name)
    // Ex: "Gabriel Koeke"
    let agentName = sender.name || 'Atendente';
    
    // A variável USE_AGENT_FIRST_NAME é apenas uma chave (true/false) para decidir
    // se o sistema deve pegar apenas a primeira palavra do nome (Ex: "Gabriel")
    if (process.env.USE_AGENT_FIRST_NAME === 'true') {
      agentName = agentName.split(' ')[0];
    }
    
    finalMessage = format
      .replace('{agent_name}', agentName)
      .replace('{message}', finalMessage);
  }

  try {
    // Send to Meta
    const metaResponse = await sendTextMessage(phoneNumber.replace('+', ''), finalMessage);
    const metaMessageId = metaResponse?.messages?.[0]?.id || '';
    
    // Log successful format send
    if (db) {
       await db.insert(processedMessages).values({
         chatwootMessageId,
         conversationId: String(conversation.id),
         metaMessageId,
         direction: 'outgoing',
         status: 'sent',
         payload: JSON.stringify(payload),
       });
    }
    
    // Optionally trigger n8n for additional flow if needed (maybe just an outgoing log)
    // await triggerN8nWebhook('/whatsapp-outgoing', { conversation, message: finalMessage });

    return res.status(200).send('Message processed and sent');
  } catch (error: any) {
    console.error('Failed to process message:', error);
    
    // Add private note on failure
    if (conversation?.id) {
      await addPrivateNote(conversation.id, `Hub Error: Falha ao enviar mensagem para a Meta. ${error.message}`);
    }

    if (db) {
      await db.insert(hubLogs).values({
        level: 'error',
        message: 'Failed to process Chatwoot webhook',
        metadata: JSON.stringify({ error: error.message, payload }),
      });
    }

    // Acknowledge anyway so Chatwoot doesn't retry infinitely
    return res.status(200).send('Failed to send, logged error');
  }
});
