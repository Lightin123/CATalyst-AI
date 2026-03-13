import { pipeline } from '@xenova/transformers';

let extractor: any = null;

export const initExtractor = async () => {
  if (!extractor) {
    // using a lightweight model for embeddings
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const getExtractor = await initExtractor();
  const output = await getExtractor(text, { pooling: 'mean', normalize: true });
  // xenova returns a Float32Array
  return Array.from(output.data);
};
