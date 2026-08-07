// src/actions/crm.ts
'use server';

import { db } from '@/db';
import { leads, chatLogs, bots } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// 1. Mengambil semua data leads berdasarkan botId
export async function getLeadsByBot(botId: string) {
  if (!botId || botId === 'undefined') {
    return { success: false, error: 'Invalid botId', data: [] };
  }

  try {
    const data = await db
      .select()
      .from(leads)
      .where(eq(leads.botId, botId))
      .orderBy(desc(leads.createdAt));
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// 2. Mengambil riwayat chat berdasarkan leadId tertentu (Pastikan kolom relasinya benar)
export async function getChatLogsByLead(leadId: string) {
  if (!leadId || leadId === 'undefined') {
    return { success: false, error: 'Invalid leadId', data: [] };
  }

  try {
    const data = await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.leadId, leadId)) // Sesuaikan jika di schema Anda menggunakan lead_id
      .orderBy(chatLogs.createdAt);
      
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching chat logs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// 3. Mengambil daftar semua bot
export async function getAllBots() {
  try {
    const data = await db.select().from(bots).orderBy(desc(bots.createdAt));
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// 4. Mengambil ringkasan statistik
export async function getBotAnalytics(botId: string) {
  if (!botId || botId === 'undefined') {
    return { success: false, error: 'Invalid botId', data: { totalLeads: 0, totalMessages: 0 } };
  }

  try {
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.botId, botId));

    const allChats = await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.botId, botId));

    return {
      success: true,
      data: {
        totalLeads: allLeads.length,
        totalMessages: allChats.length,
      },
    };
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return { success: false, error: error.message, data: { totalLeads: 0, totalMessages: 0 } };
  }
}