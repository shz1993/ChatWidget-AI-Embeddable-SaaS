// src/lib/ai/client-embedding.ts
'use client';

import { pipeline, env } from '@huggingface/transformers';

// Konfigurasi untuk browser
env.allowLocalModels = false;
env.useFS = false;

class BrowserPipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

export async function generateClientEmbedding(text: string): Promise<number[]> {
  const sanitizedText = text.replace(/\n/g, ' ');
  const extractor = await BrowserPipelineSingleton.getInstance();
  const output = await extractor(sanitizedText, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
}

// Fungsi pembagi teks sederhana di sisi client
export function clientSplitText(text: string, chunkSize = 500, chunkOverlap = 100): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize - chunkOverlap;
  }
  return chunks;
}