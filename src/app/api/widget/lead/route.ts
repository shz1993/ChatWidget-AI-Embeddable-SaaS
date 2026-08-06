// src/app/api/widget/lead/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { botId, name, email } = await req.json();

    if (!botId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newLead] = await db
      .insert(leads)
      .values({ botId, name, email })
      .returning();

    return NextResponse.json({ success: true, leadId: newLead.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}