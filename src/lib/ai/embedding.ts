// src/lib/ai/embedding.ts
import { pipeline, env } from '@huggingface/transformers';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Konfigurasi wajib untuk Vercel Serverless
env.allowLocalModels = false;
env.useFS = false;

// 💡 PENTING: Matikan backend Node dan arahkan WASM ke CDN agar Vercel tidak mencari file .so
if (env.backends?.onnx) {
  (env.backends.onnx as any).node = false;
  (env.backends.onnx as any).wasm = {
    wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/',
    numThreads: 1,
  };
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
  const pipelineInstance = await PipelineSingleton.getInstance();
  const output = await pipelineInstance(sanitizedText, {
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