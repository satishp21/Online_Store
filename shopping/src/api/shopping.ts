import { Request, Response, NextFunction } from 'express';
import ShoppingService from '../services/shopping-service';
import { SubscribeMessage, PublishMessage } from '../utils';
import { authMiddleware } from './middlewares/auth';

export const shoppingRoute = (app: any, channel: any, redisClient: any) => {
  const service = new ShoppingService();

  SubscribeMessage(channel, service);

  // Cart
  app.post('/cart', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const { product_id, qty } = req.body;
    const { data } = await service.AddCartItem(_id, product_id, qty);
    res.status(200).json(data);
  });

  app.delete('/cart/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const productId = req.params.id;
    const { data } = await service.RemoveCartItem(_id, productId);
    res.status(200).json(data);
  });

  app.get('/cart', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const data = await service.GetCart(_id);
    return res.status(200).json(data);
  });

  // Wishlist
  app.post('/wishlist', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const { product_id } = req.body;
    const data = await service.AddToWishlist(_id, product_id);
    return res.status(200).json(data);
  });
  app.get('/wishlist', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const data = await service.GetWishlist(_id);
    return res.status(200).json(data);
  });
  app.delete('/wishlist/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const product_id = req.params.id;
    const data = await service.RemoveFromWishlist(_id, product_id);
    return res.status(200).json(data);
  });

  // Orders
  app.post('/order', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const { txnNumber } = req.body;
    const data = await service.CreateOrder(_id, txnNumber);
    return res.status(200).json(data);
  });

  app.get('/order/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const data = await service.GetOrder(_id);
    return res.status(200).json(data);
  });

  app.get('/orders', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = res.locals.user as { _id: string };
    const data = await service.GetOrders(_id);
    return res.status(200).json(data);
  });

  app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ msg: '/shoping : I am Shopping Service' });
  });
};
