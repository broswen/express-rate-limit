"use strict";
import { createClient } from 'redis';
import express, { Request, Response } from 'express';
import { fixedWindow, tokenBucket } from './middleware';

const app = express();
const port = 3000;

const client = createClient();
client.on('error', (err) => console.error(err));
(async () => {
  await client.connect();
})();

app.get('/health', async (req: Request, res: Response) => {
  const response = await client.ping()
  console.log(response)
  res.send('OK');
});

app.get('/decr', tokenBucket(1, 10, client), async (req: Request, res: Response) => {
  const counter = await client.decr('counter')
  res.json({ counter, timestamp: new Date().toISOString() })
})

app.get('/incr', fixedWindow(10000, 10, client), async (req: Request, res: Response) => {
  const counter = await client.incr('counter')
  res.json({ counter, timestamp: new Date().toISOString() })
})



app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
