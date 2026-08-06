// src/actions/knowledge.ts
'use server';

import { db } from '@/db';
import { botKnowledge } from '@/db/schema';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/ai/embedding';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addKnowledgeToBot(botId: string, title: string, textContent: string) {
  try {
    const chunks = await splitTextIntoChunks(textContent);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      await db.insert(botKnowledge).values({
        botId,
        title,
        content: chunk,
        embedding,
      });
    }

    revalidatePath(`/bots/${botId}`);
    return { success: true, count: chunks.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBotKnowledgeList(botId: string) {
  try {
    return await db
      .select({
        id: botKnowledge.id,
        title: botKnowledge.title,
        content: botKnowledge.content,
        createdAt: botKnowledge.createdAt,
      })
      .from(botKnowledge)
      .where(eq(botKnowledge.botId, botId))
      .orderBy(desc(botKnowledge.createdAt));
  } catch (error) {
    console.error('Failed to fetch knowledge:', error);
    return [];
  }
}

export async function deleteKnowledge(id: string, botId: string) {
  try {
    await db.delete(botKnowledge).where(eq(botKnowledge.id, id));
    revalidatePath(`/bots/${botId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}