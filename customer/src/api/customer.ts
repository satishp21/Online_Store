import { Request, Response, NextFunction, Application } from 'express';
import CustomerService from '../services/customer-service';
import { middleware } from './middlewares/auth';
import { PublishMessage, getCaching, setCaching } from '../utils';

export const customerRoute = (app: Application, channel: any, redisClient: any): void => {
  const service: CustomerService = new CustomerService();

  app.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, phone }: { email: string; password: string; phone: string } = req.body;
      const data = await service.SignUp({ email, password, phone });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: { email: string; password: string } = req.body;
      const data = await service.SignIn({ email, password });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post('/address', middleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { _id }: { _id: string } = res.locals.user;
      const {
        street,
        postalCode,
        city,
        country,
      }: { street: string; postalCode: string; city: string; country: string } = req.body;
      const data = await service.AddNewAddress(_id, {
        street,
        postalCode,
        city,
        country,
      });
      await setCaching(redisClient, `Profile${_id}`, data);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get('/profile', middleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { _id }: { _id: string } = res.locals.user;
      let { isCached, results }: { isCached: boolean; results: any } = await getCaching(redisClient, `Profile${_id}`);
      if (results) {
        return res.json({ data: results, fromCache: isCached });
      } else {
        results = await service.GetProfile(_id);
        if (results.length === 0) {
          throw new Error('Api returned with an empty array');
        }
        await setCaching(redisClient, `Profile${_id}`, results);
        return res.json({ data: results, fromCache: isCached });
      }
    } catch (error) {
      next(error);
    }
  });

  app.delete('/profile', middleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { _id }: { _id: string } = res.locals.user;
      const { data, payload }: { data: any; payload: any } = await service.DeleteProfile(_id);
      // Send message to Shopping Service for removing cart & wishlist
      PublishMessage(channel, 'shopping__service', JSON.stringify(payload));
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ msg: '/customer : I am Customer Service' });
  });
};
