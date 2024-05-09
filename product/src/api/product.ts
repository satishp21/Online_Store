import { Express, Request, Response, NextFunction } from 'express';
import ProductService from '../services/product-service';
import { RPCObserver } from '../utils';

export const productRoute = (app: Express, channel: any, redisClient: any) => {
  const service = new ProductService();

  RPCObserver('PRODUCT_RPC', service);

  app.post('/product/create', async (req: Request, res: Response, next: NextFunction) => {
    const { name, desc, type, unit, price, available, suplier, banner } = req.body;
    // validation
    const { data } = await service.CreateProduct({
      name,
      desc,
      type,
      unit,
      price,
      available,
      suplier,
      banner,
    });
    return res.json(data);
  });

  app.get('/category/:type', async (req: Request, res: Response, next: NextFunction) => {
    const type: string = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const productId: string = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.post('/ids', async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ msg: '/ or /products : I am products Service' });
  });

  // get Top products and category
  app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    // check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
