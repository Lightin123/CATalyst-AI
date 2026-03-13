import { ChatGroq } from '@langchain/groq';
import dotenv from 'dotenv';
dotenv.config();

export const getRouterModel = () => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama3-8b-8192', // Usually 'llama3-8b-8192' on Groq
    temperature: 0,
  });
};

export const getTutorModel = () => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama3-70b-8192', // Usually 'llama3-70b-8192' on Groq
    temperature: 0.7,
  });
};
