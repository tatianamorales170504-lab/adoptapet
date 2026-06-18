import { Router } from 'express';
import { getProductos, postProducto, putProducto, deleteProducto } from '../controladores/productosCtrl.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/productos', getProductos);
router.post('/productos', upload.single('prod_imagen'), postProducto); 
router.put('/productos/:id', upload.single('prod_imagen'), putProducto); 
router.delete('/productos/:id', deleteProducto);

export default router;