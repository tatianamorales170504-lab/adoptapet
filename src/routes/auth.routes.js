import { Router } from 'express';
import {login, registrar, guardarTokenPush} from '../controladores/authCtrl.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/registro', registrar);
router.post('/login', login);
//próximo token push
router.put('/token', verificarToken, guardarTokenPush);

export default router;

