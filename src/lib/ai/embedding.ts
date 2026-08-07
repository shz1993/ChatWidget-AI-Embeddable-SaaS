// src/lib/ai/embedding.ts
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function generateEmbedding(text: string): Promise<number[]> {
  const sanitizedText = text.replace(/\n/g, ' ');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is missing in environment variables');
  }

  // Menggunakan endpoint router terbaru Hugging Face
  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: sanitizedText,
        options: { wait_for_model: true } // Menunggu model siap jika sedang cold start
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hugging Face API error: ${errText}`);
  }

  const result = await response.json();
  return result;
}

export async function splitTextIntoChunks(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  return await splitter.splitText(text);
}