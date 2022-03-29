import fs from 'fs';
import path from 'path';

export const CONFIG_PATH =
  process.env.CONFIG_PATH || path.join(__dirname, '..', '..', 'config');

export const JWT_KEY = {
  privateKey: fs.readFileSync(path.join(CONFIG_PATH, 'JWT_PRIVATE_KEY.pem')),
  publicKey: fs.readFileSync(path.join(CONFIG_PATH, 'JWT_PUBLIC_KEY.pub')),
};
