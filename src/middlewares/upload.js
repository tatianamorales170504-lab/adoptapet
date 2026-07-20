import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Configuración de Cloudinary
// Asegúrate de tener estas variables definidas en tu archivo .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuración del almacenamiento
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mascotas', // Carpeta donde se guardarán las imágenes en la nube
    resource_type: 'auto', // Detecta automáticamente si es jpg, png, etc.
    // Genera un nombre único para evitar sobreescrituras
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`
  },
});

// 3. Instancia de multer configurada
const upload = multer({ 
    storage: storage,
    // (Opcional) Puedes añadir filtros para permitir solo imágenes
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Formato no soportado, solo se permiten imágenes'), false);
        }
    }
});

// Exportamos la configuración
export default upload;