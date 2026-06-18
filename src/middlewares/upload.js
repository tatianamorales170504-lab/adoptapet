import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';


const s3 = new S3Client({
  region: 'us-east-1', 
  endpoint: 'https://s3.sirv.com',
  credentials: {
    accessKeyId: 'tatianamorales170504@gmail.com', 
    secretAccessKey: 'boDJzzAl2yvNqyvHMFzgWg92GCKAeKkCHwNtGNAiJCFEa9Em' 
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'tiendaimagenes',
    acl: 'public-read', 
    key: (req, file, cb) => {
      cb(null, `productos/${Date.now()}-${file.originalname}`); // Se guardarán en la carpeta 'productos'
    }
  })
});

export default upload;