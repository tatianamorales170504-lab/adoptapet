import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.sirv.com',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'tiendaimagenes',
    // IMPORTANTE: Al quitar el 'acl', evitamos conflictos de permisos de firma
    key: (req, file, cb) => {
      const fileName = `productos/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  })
});

// Esta función helper te servirá en tu controlador para guardar la URL correcta
export const getSirvUrl = (key) => `https://tiendaimagenes.sirv.com/${key}`;

export default upload;