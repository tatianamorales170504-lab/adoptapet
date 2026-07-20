import { config } from 'dotenv';
config();

export const BD_HOST = process.env.BD_HOST || 'localhost';
export const BD_DATABASE = process.env.BD_DATABASE || 'adoptapet_db';
export const BD_USER = process.env.BD_USER || 'root';
export const BD_PASSWORD = process.env.BD_PASSWORD || '';
export const BD_PORT = Number(process.env.BD_PORT) || 3306;
export const PORT = Number(process.env.PORT) || 3001;

export const JWT_SECRET = process.env.JWT_SECRET || '1234';

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;