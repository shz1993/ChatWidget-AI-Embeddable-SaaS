// src/app/api/widget/chat/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { botKnowledge, chatLogs } from '@/db/schema';
import { generateEmbedding } from '@/lib/ai/embedding';
import { eq, sql } from 'drizzle-orm';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { botId, leadId, message } = await req.json();

    if (!botId || !message) {
      return new Response('Missing botId or message', { status: 400 });
    }

    // 1. Generate embedding for user question
    const userEmbedding = await generateEmbedding(message);
    const embeddingSql = JSON.stringify(userEmbedding);

    // 2. Vector Cosine Search on botKnowledge for this specific botId
    const contextResults = await db
      .select({
        title: botKnowledge.title,
        content: botKnowledge.content,
        similarity: sql<number>`1 - (${botKnowledge.embedding} <=> ${embeddingSql}::vector)`,
      })
      .from(botKnowledge)
      .where(
        sql`${botKnowledge.botId} = ${botId} AND (1 - (${botKnowledge.embedding} <=> ${embeddingSql}::vector)) > 0.3`
      )
      .orderBy(sql`1 - (${botKnowledge.embedding} <=> ${embeddingSql}::vector) DESC`)
      .limit(4);

    const contextText = contextResults.map((r) => r.content).join('\n\n');

    // Save user message to chat logs
    await db.insert(chatLogs).values({
      botId,
      leadId: leadId || null,
      role: 'user',
      message,
    });

    // 3. System Prompt Construction
    const systemPrompt = `You are a helpful customer service AI widget assistant for a store/website.
Use ONLY the context information below to answer the user's question clearly, politely, and concisely.
If the answer is not contained in the context, politely inform the user that you don't have that specific information and offer to connect them with human support.

Context:
${contextText || 'No specific SOP context found for this query.'}`;

    // 4. Stream response from Groq
    const groqResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    let fullAiResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of groqResponse) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullAiResponse += content;
            controller.enqueue(encoder.encode(content));
          }
        }

        // Save AI response to chat logs when stream completes
        await db.insert(chatLogs).values({
          botId,
          leadId: leadId || null,
          role: 'assistant',
          message: fullAiResponse,
        });

        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Widget chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}