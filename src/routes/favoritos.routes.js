import { Router } from 'express';
import { obtenerFavoritos, agregarFavorito, eliminarFavorito } from '../controladores/favoritosCtrl.js';

const router = Router();

// GET: obtener lista de favoritos de un usuario
router.get('/:cliente_id', obtenerFavoritos);

// POST: agregar un favorito
router.post('/', agregarFavorito);

// DELETE: quitar un favorito
router.delete('/:cliente_id/:mascota_id', eliminarFavorito);

export default router;