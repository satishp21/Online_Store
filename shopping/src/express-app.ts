import express, { Express } from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { shoppingRoute } from './api/shopping';
import { CreateChannel } from './utils';

dotenv.config();

export const expressApp = async (app: Express) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  // Check if REDIS_URL is defined
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL is not defined in environment variables.');
    process.exit(1); // Exit with error code
  }

  const redisClient = createClient({
    url: process.env.REDIS_URL as string,
  });

  redisClient.on('error', (error: any) => console.error(`Error : ${error}`));

  await redisClient.connect();

  const channel = await CreateChannel();

  shoppingRoute(app, channel, redisClient);
};
