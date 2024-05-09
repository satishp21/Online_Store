import express from 'express';
import { databaseConnection } from './database';
import { expressApp } from './express-app';
import { CreateChannel } from './utils';

import dotenv from 'dotenv';
dotenv.config();

const StartServer = async (): Promise<void> => {
  const app = express();

  await databaseConnection();

  const channel = await CreateChannel();

  await expressApp(app);

  const PORT = process.env.PORT || 8001;

  app
    .listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    })
    .on('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .on('close', () => {
      channel.close();
    });
};

StartServer();
