import { Request, Response, NextFunction } from 'express';
import { ValidateSignature } from '../../utils';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAuthorized: boolean = await ValidateSignature(req);

    if (isAuthorized) {
      return next();
    }
    throw new Error('not authorised to access resources');
  } catch (error) {
    next(error);
  }
};
