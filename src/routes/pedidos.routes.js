// src/routes/pedidos.routes.js
// src/routes/pedidos.routes.js
import { Router } from 'express';
import { crearPedido, obtenerPedidos, obtenerPedidoPorId } from '../controladores/pedidosCtrl.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/pedidos', verificarToken, crearPedido);
// Obtener todos los pedidos
router.get('/pedidos', verificarToken, obtenerPedidos);
// Obtener un pedido específico por su ID
router.get('/pedidos/:id', verificarToken, obtenerPedidoPorId);

export default router;