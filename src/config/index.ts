import { config } from 'dotenv';
import { env } from 'process';

config();

const appConfig = {
  port: env.PORT,
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'upload',
};

export default appConfig;
