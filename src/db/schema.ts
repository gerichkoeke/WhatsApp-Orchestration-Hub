import { pgTable, serial, text, timestamp, boolean, integer, unique } from 'drizzle-orm/pg-core';

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

export const conversationTicketLinks = pgTable('conversation_ticket_links', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').references(() => instances.id),
  chatwootAccountId: integer('chatwoot_account_id').notNull(),
  chatwootConversationId: integer('chatwoot_conversation_id'),
  chatwootContactId: integer('chatwoot_contact_id'),
  softdeskTicketId: text('softdesk_ticket_id').notNull(),
  softdeskTicketCode: text('softdesk_ticket_code'),
  phoneNumber: text('phone_number'),
  customerName: text('customer_name'),
  customerDocument: text('customer_document'),
  source: text('source').notNull(), // whatsapp/chatwoot/softdesk_web
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const syncedMessages = pgTable('synced_messages', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').references(() => instances.id),
  sourceSystem: text('source_system').notNull(), // chatwoot, softdesk, meta
  sourceMessageId: text('source_message_id').notNull(),
  chatwootConversationId: integer('chatwoot_conversation_id'),
  softdeskTicketId: text('softdesk_ticket_id'),
  direction: text('direction'), // incoming, outgoing, internal
  senderType: text('sender_type'), // customer, agent, bot, system
  senderName: text('sender_name'),
  message: text('message'),
  syncedToSoftdesk: boolean('synced_to_softdesk').default(false),
  syncedToChatwoot: boolean('synced_to_chatwoot').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  unique().on(t.sourceSystem, t.sourceMessageId),
]);

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

