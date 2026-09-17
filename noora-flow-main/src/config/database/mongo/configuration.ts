import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  uri: process.env.MONGO_URI,
  dbName: process.env.MONGO_DBNAME,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
}));
