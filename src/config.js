import { config } from 'dotenv';
config();

export const BD_HOST = process.env.DB_HOST || 'localhost';
export const BD_DATABASE = process.env.DB_DATABASE || 'adoptapet_db';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_PORT = Number(process.env.DB_PORT) || 3306;
export const PORT = Number(process.env.PORT) || 3001;