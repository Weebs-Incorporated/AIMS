import express from 'express';

const app = express();

app.get('/', (_req, res) => res.sendStatus(200));

export default app;
