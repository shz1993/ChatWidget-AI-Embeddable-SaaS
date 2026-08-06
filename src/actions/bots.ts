// src/actions/bots.ts
'use server';

import { db } from '@/db';
import { bots } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 1. Buat Bot Baru
export async function createBot(name: string) {
  try {
    const [newBot] = await db.insert(bots).values({
      name,
      welcomeMessage: `Halo! Selamat datang di ${name}. Ada yang bisa kami bantu?`,
      primaryColor: '#2563eb',
      requireLead: true,
    }).returning();

    revalidatePath('/');
    return { success: true, botId: newBot.id };
  } catch (error) {
    console.error('❌ Error creating bot:', error);
    return { success: false, error: String(error) };
  }
}

// 2. Ambil Daftar Semua Bot
export async function getBots() {
  try {
    return await db.select().from(bots);
  } catch (error) {
    console.error('❌ Error getting bots:', error);
    return [];
  }
}

// 3. Ambil Detail Bot Berdasarkan ID
export async function getBotById(id: string) {
  try {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || null;
  } catch (error) {
    console.error('❌ Error getting bot by id:', error);
    return null;
  }
}

// 4. Update Pengaturan Bot
export async function updateBotSettings(id: string, data: { name: string; welcomeMessage: string; primaryColor: string; requireLead: boolean }) {
  try {
    await db.update(bots).set(data).where(eq(bots.id, id));
    revalidatePath(`/bots/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating bot:', error);
    return { success: false, error: String(error) };
  }
}

// 5. Hapus Bot
export async function deleteBot(id: string) {
  try {
    await db.delete(bots).where(eq(bots.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting bot:', error);
    return { success: false, error: String(error) };
  }
}