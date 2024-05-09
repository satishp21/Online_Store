import { connection } from './connection';
import { ShoppingRepository as ShoppingRepo } from './repository/shopping-repository';

export const databaseConnection = connection;
export const ShoppingRepository = ShoppingRepo;
