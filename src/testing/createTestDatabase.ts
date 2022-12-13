import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppDatabaseCollections } from '../types';

export interface TestDatabase {
    provider: MongoMemoryServer;
    uri: string;
    consumer: MongoClient;
    db: AppDatabaseCollections;
    shutdown: () => Promise<void>;
}

/** Makes an in-memory MongoDb server and client. */
export async function createTestDatabase(): Promise<TestDatabase> {
    const provider = await MongoMemoryServer.create();
    const uri = provider.getUri();

    const consumer = new MongoClient(uri);
    await consumer.connect();

    const db: AppDatabaseCollections = {
        users: consumer.db().collection('users'),
    };

    return {
        provider,
        uri,
        consumer,
        db,
        shutdown: async () => {
            await consumer.close();
            await provider.stop();
        },
    };
}
