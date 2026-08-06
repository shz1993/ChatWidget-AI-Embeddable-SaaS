// src/actions/knowledge-client.ts
'use server';

import { db } from '@/db';
import { knowledgeChunks } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function addKnowledgeChunksAction(
  botId: string,
  title: string,
  chunks: Array<{ content: string; embedding: number[] }>
) {
  try {
    for (const chunk of chunks) {
      await db.insert(knowledgeChunks).values({
        botId,
        title,
        content: chunk.content,
        embedding: chunk.embedding,
      });
    }

    revalidatePath(`/bots/${botId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Database Error saving knowledge:', error);
    return { success: false, error: error.message };
  }
}