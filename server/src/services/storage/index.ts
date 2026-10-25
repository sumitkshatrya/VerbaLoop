import { IStorageRepository } from './types';
import { InMemoryStorage } from './inMemoryStorage';
import { MongoStorage } from './mongoStorage';
import { config } from '../../config/env';

let instance: IStorageRepository | null = null;

export async function getStorageRepository(): Promise<IStorageRepository> {
  if (instance) return instance;

  const inMemory = new InMemoryStorage();

  if (config.mongoUri) {
    try {
      const mongo = new MongoStorage(config.mongoUri);
      await mongo.init();
      console.log('✅ [Storage] Connected successfully to MongoDB:', config.mongoUri);
      instance = mongo;
      return instance;
    } catch (err: any) {
      console.warn(
        '⚠️ [Storage] MongoDB connection attempt failed (' +
          (err?.message || 'timeout') +
          '). Defaulting to resilient development In-Memory storage repository.'
      );
    }
  }

  await inMemory.init();
  instance = inMemory;
  return instance;
}

export { IStorageRepository, InMemoryStorage, MongoStorage };

