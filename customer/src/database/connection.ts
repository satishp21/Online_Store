import mongoose, { ConnectOptions } from 'mongoose';

import dotenv from 'dotenv';

dotenv.config();

const options: ConnectOptions = {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
};

export const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!, options);
    console.log('Db Connected');
  } catch (error) {
    console.error('Error ============ ON DB Connection');
    console.log(error);
  }
};
