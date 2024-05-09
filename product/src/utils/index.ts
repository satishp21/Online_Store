import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import amqplib from 'amqplib';

import dotenv from 'dotenv';

dotenv.config();

let amqplibConnection: amqplib.Connection | null = null;

// Utility functions
export const GenerateSalt = async (): Promise<string> => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string): Promise<string> => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string,
): Promise<boolean> => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: any): Promise<string> => {
  return await jwt.sign(payload, process.env.APP_SECRET!, { expiresIn: '1d' });
};

export const ValidateSignature = async (req: any): Promise<boolean> => {
  const signature = req.get('Authorization');

  if (signature) {
    const payload = await jwt.verify(signature.split(' ')[1], process.env.APP_SECRET!);
    req.user = payload;
    return true;
  }

  return false;
};

export const FormateData = (data: any): { data: any } => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};

// Message Broker
const getChannel = async (): Promise<amqplib.Channel> => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(process.env.MSG_QUEUE_URL!);
  }
  return await amqplibConnection.createChannel();
};

export const CreateChannel = async (): Promise<amqplib.Channel> => {
  try {
    const channel = await getChannel();
    await channel.assertQueue(process.env.EXCHANGE_NAME!, { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
};

export const PublishMessage = (channel: amqplib.Channel, service: string, msg: any): void => {
  channel.publish(process.env.EXCHANGE_NAME!, service, Buffer.from(msg));
  console.log('Sent: ', msg);
};

export const RPCObserver = async (
  RPC_QUEUE_NAME: string,
  service: { serveRPCRequest: (payload: any) => Promise<any> },
): Promise<void> => {
  const channel = await getChannel();
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false,
  });
  channel.prefetch(1);
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg: any) => {
      if (msg.content) {
        // DB Operation
        const payload = JSON.parse(msg.content.toString());
        const response = await service.serveRPCRequest(payload);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId,
        });
        channel.ack(msg);
      }
    },
    {
      noAck: false,
    },
  );
};

export const getCaching = async (
  redisClient: any,
  uniqueName: string,
): Promise<{ isCached: boolean; results: any }> => {
  let results;
  let isCached = false;

  const cacheResults = await redisClient.get(uniqueName);
  if (cacheResults) {
    isCached = true;
    results = JSON.parse(cacheResults);
  }
  return { isCached, results };
};

export const setCaching = async (redisClient: any, uniqueName: string, results: any): Promise<void> => {
  await redisClient.set(uniqueName, JSON.stringify(results), {
    EX: 30,
    NX: true,
  });
};
