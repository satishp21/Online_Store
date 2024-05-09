import express, { Request, Response, NextFunction } from 'express';
import CustomerService from '../services/customer-service';

export default (app: express.Application): void => {
  const service: any = new CustomerService();

  app.use('/app-events', async (req: Request, res: Response, next: NextFunction) => {
    const { payload }: { payload: any } = req.body;

    // Handle subscribe events
    service.SubscribeEvents(payload);

    console.log('============= customer ================');
    console.log(payload);
    res.json(payload);
  });
};
