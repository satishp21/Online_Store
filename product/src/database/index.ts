import { connection } from './connection';
import { ProductRepository as ProductRepo } from './repository/product-repository';

export const databaseConnection = connection;
export const ProductRepository = ProductRepo;
