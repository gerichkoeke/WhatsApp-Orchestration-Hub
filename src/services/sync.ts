import { db } from '../db/index.js';
import { conversationTicketLinks, syncedMessages } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { addTicketInteraction } from './softdesk.js';
import { addPrivateNote } from './chatwoot.js';

export const linkConversationToTicket = async (
  instanceId: number,
  chatwootAccountId: number,
  chatwootConversationId: number,
  softdeskTicketId: string,
  softdeskTicketCode: string,
  phoneNumber: string,
  customerName?: string,
  source: string = 'whatsapp'
) => {
  if (!db) return null;
  const result = await db.insert(conversationTicketLinks).values({
    instanceId,
    chatwootAccountId,
    chatwootConversationId,
    softdeskTicketId,
    softdeskTicketCode,
    phoneNumber,
    customerName,
    source,
  }).returning();
  return result[0];
};

export const syncMessageToSoftdesk = async (
  instanceId: number,
  chatwootConversationId: number,
  messageId: string,
  senderName: string,
  message: string,
  systemName: string
) => {
  if (!db) return;

  // Find link
  const link = await db.query.conversationTicketLinks.findFirst({
    where: eq(conversationTicketLinks.chatwootConversationId, chatwootConversationId),
  });

  if (!link) return;

  // Format message
  const formattedMessage = `[${systemName} - ${senderName}]\n${message}`;

  try {
    // Send to softdesk
    await addTicketInteraction(link.softdeskTicketId, formattedMessage);

    // Save to sync history
    await db.insert(syncedMessages).values({
      instanceId,
      sourceSystem: systemName.toLowerCase(),
      sourceMessageId: messageId,
      chatwootConversationId,
      softdeskTicketId: link.softdeskTicketId,
      senderName,
      message,
      syncedToSoftdesk: true,
    });
  } catch (err) {
    console.error(`Failed to sync message ${messageId} to Softdesk:`, err);
  }
};
