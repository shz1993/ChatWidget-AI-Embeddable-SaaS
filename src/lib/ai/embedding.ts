// src/lib/ai/embedding.ts
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      // 💡 Gunakan Dynamic Import agar aman dari static build-time bundling di Vercel
      const { pipeline, env } = await import('@xenova/transformers');
      
      env.allowLocalModels = false;
      env.useFS = false;
      
      if (env.backends?.onnx) {
        env.backends.onnx.wasm.numThreads = 1;
      }

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