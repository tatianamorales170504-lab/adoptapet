import { Router } from 'express';
import { 
    registrarSolicitud, 
    obtenerSolicitudes, 
    gestionarSolicitud ,
    obtenerSolicitudesPorCliente
} from '../controladores/solicitudesCtrl.js';

const router = Router();

// El usuario normal usa POST para enviar su petición
router.post('/', registrarSolicitud);

// El admin usa GET para ver la lista y PUT para aprobar/rechazar
router.get('/', obtenerSolicitudes);
router.get('/cliente/:cliente_id', obtenerSolicitudesPorCliente);
router.put('/:id', gestionarSolicitud);

export default router;