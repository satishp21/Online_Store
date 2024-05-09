import { Request, Response, NextFunction } from 'express';
import { PublishMessage, getCaching, setCaching } from '../utils';

import CustomerService from '../services/customer-service';
const service: CustomerService = new CustomerService();

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, phone }: { email: string; password: string; phone: string } = req.body;
    const data = await service.SignUp({ email, password, phone });
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const data = await service.SignIn({ email, password });
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

export const AddAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: { _id: string } = res.locals.user;
    const redisClient = res.locals.redisClient;

    const { street, postalCode, city, country }: { street: string; postalCode: string; city: string; country: string } =
      req.body;
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
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: { _id: string } = res.locals.user;
    const redisClient = res.locals.redisClient;
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
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: { _id: string } = res.locals.user;
    const channel = res.locals.channel;
    const { data, payload }: { data: any; payload: any } = await service.DeleteProfile(_id);
    // Send message to Shopping Service for removing cart & wishlist
    PublishMessage(channel, 'shopping__service', JSON.stringify(payload));
    return res.json(data);
  } catch (error) {
    next(error);
  }
};
