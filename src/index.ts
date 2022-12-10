import { MongoClient } from 'mongodb';
import { createApp } from './app';
import { getConfig } from './config';

const config = getConfig();

const mongoClient = new MongoClient(config.mongoURI);

const db = mongoClient.db(config.mongoDbName);

const app = createApp(config, db);

app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
});

mongoClient.connect().then(() => {
    console.log('Connected to MongoDB');
});
