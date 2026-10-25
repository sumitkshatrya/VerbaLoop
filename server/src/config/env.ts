import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
// Also attempt loading .env from server directory and root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  mongoUri: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  openaiApiBaseUrl?: string;
  translationProvider: 'gemini' | 'openai' | 'mymemory' | 'fallback';
}

const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

let detectedProvider: 'gemini' | 'openai' | 'mymemory' | 'fallback' = 'fallback';
if (geminiKey) {
  detectedProvider = 'gemini';
} else if (openaiKey) {
  detectedProvider = 'openai';
} else {
  // Free public / fallback provider
  detectedProvider = 'mymemory';
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/verbaloop',
  geminiApiKey: geminiKey,
  openaiApiKey: openaiKey,
  openaiApiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  translationProvider:
    (process.env.TRANSLATION_PROVIDER as any) || detectedProvider,
};

