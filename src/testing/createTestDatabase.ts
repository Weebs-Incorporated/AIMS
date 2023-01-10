import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppDatabaseCollections } from '../types';
import { PostStatus } from '../types/Post';

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

    const _db = consumer.db();

    const db: AppDatabaseCollections = {
        users: _db.collection('users'),
        posts: {
            [PostStatus.InitialAwaitingValidation]: _db.collection('posts_submissions'),
            [PostStatus.Public]: _db.collection('posts_public'),
            [PostStatus.ReAwaitingValidation]: _db.collection('posts_withdrawn'),
        },
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
