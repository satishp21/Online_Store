import { Request, Response, NextFunction, Application } from 'express';
import CustomerService from '../services/customer-service';
import { middleware } from './middlewares/auth';
import { AddAddress, deleteProfile, getProfile, login, signUp } from '../controllers/customer';

export const customerRoute = (app: Application, channel: any, redisClient: any): void => {
  app.use((req, res, next) => {
    res.locals.redisClient = redisClient; // Pass the Redis client
    res.locals.channel = channel; // Pass the channel
    next();
  });

  app.post('/signup', signUp);

  app.post('/login', login);

  app.post('/address', middleware, AddAddress);

  app.get('/profile', middleware, getProfile);

  app.delete('/profile', middleware, deleteProfile);
};
