// src/routes/pedidos.routes.js
import { Router } from 'express';
import { crearPedido } from '../controladores/pedidosCtrl.js';
import { verificarToken } from '../middlewares/auth.js'; // Ajusta la ruta a tu middleware de auth

const router = Router();

// La ruta debe tener el middleware para que el servidor no falle
router.post('/pedidos', verificarToken, crearPedido);

export default router;