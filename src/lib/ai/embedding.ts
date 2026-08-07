// src/lib/ai/embedding.ts
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function generateEmbedding(text: string): Promise<number[]> {
  const sanitizedText = text.replace(/\n/g, ' ');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is missing in environment variables');
  }

  // Menggunakan Hugging Face Free Inference API (Model all-MiniLM-L6-v2)
  const response = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: sanitizedText }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hugging Face API error: ${errText}`);
  }

  const result = await response.json();
  
  // Hasil dari API Hugging Face berupa array vektor 384 dimensi
  return result;
}

export async function splitTextIntoChunks(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  return await splitter.splitText(text);
}