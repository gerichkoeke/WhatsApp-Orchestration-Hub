import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const processedMessages = pgTable('processed_messages', {
  id: serial('id').primaryKey(),
  chatwootMessageId: text('chatwoot_message_id').unique(),
  conversationId: text('conversation_id'),
  metaMessageId: text('meta_message_id'),
  direction: text('direction'), // 'incoming', 'outgoing'
  status: text('status'),
  payload: text('payload'),
  processedAt: timestamp('processed_at').defaultNow(),
});

export const hubLogs = pgTable('hub_logs', {
  id: serial('id').primaryKey(),
  level: text('level'),
  message: text('message'),
  metadata: text('metadata'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
});
