// src/lib/ai/embedding.ts
import { pipeline, env } from '@huggingface/transformers';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Konfigurasi wajib untuk Vercel Serverless
env.allowLocalModels = false;
env.useFS = false;

// 💡 PENTING: Gunakan optional chaining (?.) agar TypeScript tidak error jika properti belum ada
if (env.backends?.onnx) {
  env.backends.onnx.node = false;
  if (env.backends.onnx.wasm) {
    env.backends.onnx.wasm.numThreads = 1;
  }
}

class PipelineSingleton {
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

export async function generateEmbedding(text: string): Promise<number[]> {
  const sanitizedText = text.replace(/\n/g, ' ');
  const generateEmbeddingPipeline = await PipelineSingleton.getInstance();

  const output = await generateEmbeddingPipeline(sanitizedText, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}

export async function splitTextIntoChunks(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  return await splitter.splitText(text);
}