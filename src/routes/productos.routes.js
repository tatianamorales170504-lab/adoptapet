import { Router } from 'express';
import { getProductos, postProducto, putProducto, deleteProducto } from '../controladores/productosCtrl.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/productos', getProductos);
// Agregamos upload.single('prod_imagen') aquí
router.post('/productos', upload.single('prod_imagen'), postProducto); 
router.put('/productos/:id', upload.single('prod_imagen'), putProducto); // También en el PUT si quieres actualizar
router.delete('/productos/:id', deleteProducto);

export default router;