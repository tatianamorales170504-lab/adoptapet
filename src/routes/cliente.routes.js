import { Router } from 'express';
import { 
    obtenerClientes, 
    obtenerClientePorId, 
    actualizarCliente,
    obtenerClientePorUsuarioId,
    inactivarCliente 
} from '../controladores/clienteCtrl.js';

const router = Router();

// Rutas GET
router.get('/', obtenerClientes);
router.get('/usuario/:usuario_id', obtenerClientePorUsuarioId);
router.get('/:id', obtenerClientePorId);

// Rutas de modificación
router.put('/:id', actualizarCliente);

// Ruta para el borrado lógico (Inactivar)
router.patch('/usuario/:usuario_id/inactivar', inactivarCliente);

export default router;