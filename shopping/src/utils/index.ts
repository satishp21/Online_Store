import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import amqplib from 'amqplib';
import { v4 as uuid4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

let amqplibConnection: any = null;

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
  return await jwt.sign(payload, process.env.APP_SECRET!, { expiresIn: '90d' });
};

export const ValidateSignature = async (req: any) => {
  const signature = req.get('Authorization');

  if (signature) {
    const payload = await jwt.verify(signature.split(' ')[1], process.env.APP_SECRET!);
    req.user = payload;
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
const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(process.env.MSG_QUEUE_URL!);
  }
  return await amqplibConnection.createChannel();
};

export const CreateChannel = async () => {
  try {
    const channel = await getChannel();
    await channel.assertQueue(process.env.EXCHANGE_NAME, 'direct', { durable: true });
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
  await channel.assertExchange(process.env.EXCHANGE_NAME, 'direct', { durable: true });
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(` Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, process.env.EXCHANGE_NAME, process.env.SHOPPING_SERVICE);

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

const requestData = async (RPC_QUEUE_NAME: string, requestPayload: any, uuid: string) => {
  try {
    const channel = await getChannel();

    const q = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(RPC_QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
      replyTo: q.queue,
      correlationId: uuid,
    });

    return new Promise((resolve, reject) => {
      // timeout n
      const timeout = setTimeout(() => {
        channel.close();
        resolve('API could not fulfill the request!');
      }, 8000);
      channel.consume(
        q.queue,
        (msg: any) => {
          if (msg.properties.correlationId == uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject('data Not found!');
          }
        },
        {
          noAck: true,
        },
      );
    });
  } catch (error) {
    console.log(error);
    return 'error';
  }
};

export const RPCRequest = async (RPC_QUEUE_NAME: string, requestPayload: any) => {
  const uuid = uuid4(); // correlationId
  return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
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
