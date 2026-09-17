import { registerAs } from '@nestjs/config';

export default registerAs('elastic', () => ({
  node: process.env.ELASTIC_NODE,
  username: process.env.ELASTIC_USERNAME,
  password: process.env.ELASTIC_PASSWORD,
}));
