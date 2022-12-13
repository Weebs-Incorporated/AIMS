import { MongoClient } from 'mongodb';
import { createApp } from './app';
import { getConfig } from './config';
import { AppDatabaseCollections } from './types';

const config = getConfig();

const mongoClient = new MongoClient(config.mongoURI);

const db = mongoClient.db(config.mongoDbName);

const collections: AppDatabaseCollections = {
    users: db.collection('users'),
};

const app = createApp(config, collections);

app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
});

mongoClient.connect().then(() => {
    console.log('Connected to MongoDB');
});
