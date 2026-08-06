// src/db/schema.ts
import { pgTable, text, timestamp, uuid, customType, boolean } from 'drizzle-orm/pg-core';

// Custom type untuk Vector 384 Dimensi (MiniLM-L6-v2)
const vector384 = customType<{ data: number[] }>({
  dataType() {
    return 'vector(384)';
  },
  toDriver(value: number[]) {
    return JSON.stringify(value);
  },
  fromDriver(value: any) {
    return typeof value === 'string' ? JSON.parse(value) : value;
  },
});

// 1. Table: Bots (Konfigurasi Widget)
export const bots = pgTable('bots', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  welcomeMessage: text('welcome_message').default('Hello! How can I help you today?').notNull(),
  primaryColor: text('primary_color').default('#2563eb').notNull(),
  requireLead: boolean('require_lead').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Table: Bot Knowledge Base (Vector RAG per Bot)
export const botKnowledge = pgTable('bot_knowledge', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  embedding: vector384('embedding').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Table: Leads (Data Pengunjung Website)
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Table: Chat Logs (Riwayat Percakapan)
export const chatLogs = pgTable('chat_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});