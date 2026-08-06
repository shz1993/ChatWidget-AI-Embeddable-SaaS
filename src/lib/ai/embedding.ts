// src/lib/ai/embedding.ts
import { pipeline, env } from '@xenova/transformers';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Konfigurasi wajib untuk Vercel Serverless & Turbopack
env.allowLocalModels = false;
env.useFS = false;

// Paksa gunakan WASM backend untuk menghindari pencarian libonnxruntime native (.so)
if (env.backends?.onnx) {
  env.backends.onnx.wasm.numThreads = 1;
}

class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      // Pastikan berjalan di mode aman
      this.instance = await pipeline(this.task, this.model, {
        quantized: true,
      });
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