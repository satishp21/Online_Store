import { connection } from './connection';
import { CustomerRepository as CustomerRepo } from './repository/customer-repository';

export const databaseConnection = connection;
export const CustomerRepository = CustomerRepo;
