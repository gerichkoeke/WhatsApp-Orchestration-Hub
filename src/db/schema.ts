import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const instances = pgTable('instances', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g., 'arm-cloud-01'
  phoneNumberId: text('phone_number_id'),
  accessToken: text('access_token'),
  verifyToken: text('verify_token'),
  webhookUrl: text('webhook_url'), // URL to forward incoming messages (e.g. Chatwoot/n8n)
  chatwootUrl: text('chatwoot_url'),
  chatwootAccountId: text('chatwoot_account_id'),
  chatwootToken: text('chatwoot_token'),
  status: text('status').default('offline'), // 'online', 'offline', 'error'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const processedMessages = pgTable('processed_messages', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').references(() => instances.id),
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
  instanceId: integer('instance_id').references(() => instances.id),
  level: text('level'),
  message: text('message'),
  metadata: text('metadata'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
});

