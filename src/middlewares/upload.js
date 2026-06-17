import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Esto apunta a C:\API2026_1\uploads
    cb(null, path.resolve(__dirname, '../../uploads')); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });
export default upload;