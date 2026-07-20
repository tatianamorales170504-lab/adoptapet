import { Router } from 'express';
import upload from '../middlewares/upload.js';
import { 
    registrarMascota, 
    actualizarMascota, 
    cambiarEstadoMascota, 
    eliminarMascota, 
    obtenerCatálogo, 
    obtenerDetalleMascota,
    actualizarImagenMascota // 1. Importa la nueva función
} from '../controladores/mascotasCtrl.js';

const router = Router();
router.get('/', obtenerCatálogo);
router.get('/:id', obtenerDetalleMascota);

// --- RUTAS ADMINISTRATIVAS ---
router.post('/registrar', upload.array('imagenes', 5), registrarMascota);
router.put('/actualizar/:id', actualizarMascota);
router.patch('/estado/:id', cambiarEstadoMascota);
router.delete('/eliminar/:id', eliminarMascota);

// 2. Nueva ruta para actualizar una imagen específica
// Usamos el ID del registro de la tabla 'imagenes_mascota'
router.put('/actualizar-imagen/:id_imagen', actualizarImagenMascota);

export default router;