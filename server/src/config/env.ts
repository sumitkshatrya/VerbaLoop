import dotenv from 'dotenv';
import path from 'path';

// Priority order for loading server environment (single source of truth in server/.env):
// 1. server/.env from monorepo root (when executed via `npm run dev` or `npm --workspace=server`)
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
// 2. .env in current working directory (when executed directly inside server/ directory)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// 3. server/.env resolved relative to this source/dist config file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  mongoUri: string;
  redisUrl?: string;
  redisHost?: string;
  redisPort?: number;
  redisPassword?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  openaiApiBaseUrl?: string;
  translationProvider: 'gemini' | 'openai' | 'mymemory' | 'fallback';
  rateLimitTurnsPerMin: number;
  rateLimitTranslationsPerMin: number;
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
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
  redisPassword: process.env.REDIS_PASSWORD,
  geminiApiKey: geminiKey,
  openaiApiKey: openaiKey,
  openaiApiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  translationProvider:
    (process.env.TRANSLATION_PROVIDER as any) || detectedProvider,
  rateLimitTurnsPerMin: parseInt(process.env.RATE_LIMIT_TURNS_PER_MIN || '30', 10),
  rateLimitTranslationsPerMin: parseInt(
    process.env.RATE_LIMIT_TRANSLATIONS_PER_MIN || '40',
    10
  ),
};

