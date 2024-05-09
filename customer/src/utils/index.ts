import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as amqplib from 'amqplib';

import dotenv from 'dotenv';
dotenv.config();

// Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: any) => {
  return await jwt.sign(payload, process.env.APP_SECRET!, { expiresIn: '1d' });
};

export const ValidateSignature = async (req: any, res: any) => {
  const signature = req.get('Authorization');

  if (signature) {
    const payload = await jwt.verify(signature.split(' ')[1], process.env.APP_SECRET!);
    res.locals.user = payload;
    return true;
  }

  return false;
};

export const FormateData = (data: any) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};

// Message Broker
export const CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(process.env.MSG_QUEUE_URL!);
    const channel = await connection.createChannel();
    await channel.assertQueue(process.env.EXCHANGE_NAME!, { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
};

export const PublishMessage = (channel: any, service: string, msg: any) => {
  channel.publish(process.env.EXCHANGE_NAME, service, Buffer.from(msg));
  console.log('Sent: ', msg);
};

export const SubscribeMessage = async (channel: any, service: any) => {
  await channel.assertExchange(process.env.EXCHANGE_NAME!, 'direct', { durable: true });
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(` Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, process.env.EXCHANGE_NAME!, 'customer_service');

  channel.consume(
    q.queue,
    (msg: any) => {
      if (msg.content) {
        console.log('the message is:', msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
      console.log('[X] received');
    },
    {
      noAck: true,
    },
  );
};

export const getCaching = async (redisClient: any, uniqueName: string) => {
  let results;
  let isCached = false;

  const cacheResults = await redisClient.get(uniqueName);
  if (cacheResults) {
    isCached = true;
    results = JSON.parse(cacheResults);
  }
  return { isCached, results };
};

export const setCaching = async (redisClient: any, uniqueName: string, results: any) => {
  await redisClient.set(uniqueName, JSON.stringify(results), {
    EX: 30,
    NX: true,
  });
};
