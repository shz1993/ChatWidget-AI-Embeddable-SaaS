// src/actions/bots.ts
'use server';

import { db } from '@/db';
import { bots } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createBot(name: string) {
  try {
    const [newBot] = await db
      .insert(bots)
      .values({ name })
      .returning();

    revalidatePath('/');
    return { success: true, bot: newBot };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBots() {
  try {
    return await db.select().from(bots).orderBy(desc(bots.createdAt));
  } catch (error) {
    console.error('Failed to fetch bots:', error);
    return [];
  }
}

export async function getBotById(id: string) {
  try {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || null;
  } catch (error) {
    console.error('Failed to fetch bot:', error);
    return null;
  }
}

export async function updateBotSettings(
  id: string,
  data: {
    name: string;
    welcomeMessage: string;
    primaryColor: string;
    requireLead: boolean;
  }
) {
  try {
    await db
      .update(bots)
      .set({
        name: data.name,
        welcomeMessage: data.welcomeMessage,
        primaryColor: data.primaryColor,
        requireLead: data.requireLead,
      })
      .where(eq(bots.id, id));

    revalidatePath(`/bots/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBot(id: string) {
  try {
    await db.delete(bots).where(eq(bots.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}