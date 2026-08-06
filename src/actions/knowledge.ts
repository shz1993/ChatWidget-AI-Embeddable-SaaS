// src/actions/knowledge.ts
'use server';

import { db } from '@/db';
import { botKnowledge } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getBotKnowledgeList(botId: string) {
  try {
    const list = await db
      .select()
      .from(botKnowledge)
      .where(eq(botKnowledge.botId, botId));
    return list;
  } catch (error) {
    console.error('Error fetching knowledge list:', error);
    return [];
  }
}

export async function deleteKnowledge(id: string, botId: string) {
  try {
    await db.delete(botKnowledge).where(eq(botKnowledge.id, id));
    revalidatePath(`/bots/${botId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting knowledge:', error);
    return { success: false, error: error.message };
  }
}