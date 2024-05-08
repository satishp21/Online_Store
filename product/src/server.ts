import logger from './utils/logger';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { AppDataSource } from './config/db';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger-config';
import cors from 'cors';
// import { landlordRouter, adminRouter, mortgageRouter, tenantRouter, realEstateAgentRouter} from './routes';

dotenv.config({ path: './.env' });
// const port = process.env.PORT;
const app: Express = express();
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// app.use(tenantRouter);
// app.use(landlordRouter);
// app.use(adminRouter);
// app.use(mortgageRouter);
// app.use(tenantRouter);
// app.use(realEstateAgentRouter);
const urls: string[] = [];
const start = async () => {
  await AppDataSource.initialize();
  logger.info('Database connected');
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
  logger.info(`Fetched urls are as follows ${urls}`);
};

start();
