import { Router } from 'express';
import {
    guardarPedido,
    getPedidos,
    getPedidoxId
} from '../controladores/pedidosCtrl.js';

import { verificarToken } from '../middlewares/auth.js';

const router = Router();

// Crear pedido
router.post('/pedidos', verificarToken, guardarPedido);

// Obtener todos los pedidos
router.get('/pedidos', verificarToken, getPedidos);

// Obtener un pedido por ID
router.get('/pedidos/:id', verificarToken, getPedidoxId);

export default router;