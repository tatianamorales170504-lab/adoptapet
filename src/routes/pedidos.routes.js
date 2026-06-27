import { Router } from 'express';
import { crearPedido } from '../controladores/pedidosCtrl.js'; 

const router = Router();
router.post('/pedidos', crearPedido);

export default router;