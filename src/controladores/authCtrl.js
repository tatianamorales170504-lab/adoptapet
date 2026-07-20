import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js';

export const registrar = async (req, res) => {
    const { email, password, nombre, apellido, identificacion, telefono, direccion, rol } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido) {
        return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    const rolUsuario = rol || 'cliente';

    try {
        // Iniciamos transacción
        await conmysql.query('START TRANSACTION');

        const claveEncriptada = await bcrypt.hash(password, 10);

        const [userResult] = await conmysql.query(
            'INSERT INTO usuarios (email, password, rol, activo) VALUES (?, ?, ?, 1)',
            [email, claveEncriptada, rolUsuario]
        );

        const nuevoUsuarioId = userResult.insertId;

        if (rolUsuario === 'cliente') {
            await conmysql.query(
                'INSERT INTO clientes (usuario_id, nombre, apellido, identificacion, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    nuevoUsuarioId,
                    nombre,
                    apellido,
                    identificacion || null,
                    telefono || null,
                    direccion || null
                ]
            );
        }

        await conmysql.query('COMMIT');

        return res.status(201).json({
            message: 'Usuario registrado con éxito'
        });

    } catch (error) {
        // Intentar revertir la transacción
        await conmysql.query('ROLLBACK').catch(() => {});

        // Registro interno seguro en los logs de Render (solo para ti)
        console.error("=== ERROR EN REGISTRO ===", error.message);

        // Si es un error de duplicado en MySQL (Correo o Cédula ya existen)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            let mensajeAmigable = 'Este dato ya se encuentra registrado en el sistema.';
            
            if (error.sqlMessage && error.sqlMessage.includes('identificacion')) {
                mensajeAmigable = 'Este número de cédula ya se encuentra registrado.';
            } else if (error.sqlMessage && error.sqlMessage.includes('email')) {
                mensajeAmigable = 'Este correo electrónico ya está registrado.';
            }

            // CAMBIO CLAVE: Retornamos 400 (Bad Request) en vez de 500 para limpiar la consola del navegador
            return res.status(400).json({ message: mensajeAmigable });
        }

        // Para cualquier error real de servidor no previsto
        return res.status(500).json({
            message: 'Ocurrió un error interno en el servidor.'
        });
    } 
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const usuarioBD = rows[0];
        const coincide = await bcrypt.compare(password, usuarioBD.password);
        if (!coincide) return res.status(401).json({ message: 'Credenciales incorrectas' });

        let clienteInfo = null;
        if (usuarioBD.rol === 'cliente') {
            const [clientRows] = await conmysql.query('SELECT id, nombre, apellido FROM clientes WHERE usuario_id = ?', [usuarioBD.id]);
            if (clientRows.length > 0) clienteInfo = clientRows[0];
        }

        const token = jwt.sign({ id: usuarioBD.id, rol: usuarioBD.rol }, process.env.JWT_SECRET || 'FirmaSecretaAdoptaPet', { expiresIn: '2h' });

        return res.json({ 
            token, 
            usuario: { 
                id: usuarioBD.id, 
                email: usuarioBD.email, 
                rol: usuarioBD.rol 
            },
            cliente: clienteInfo ? { 
                id: clienteInfo.id, 
                nombre: clienteInfo.nombre, 
                apellido: clienteInfo.apellido 
            } : null 
        });
        
    } catch (error) {
        console.error("=== ERROR DETALLADO EN LOGIN ===", error);
        return res.status(500).json({ 
            message: 'Error en servidor',
            sqlMessage: error.sqlMessage,
            code: error.code 
        });
    }
};

export const guardarTokenPush = async (req, res) => {
    const { token_push } = req.body;
    const usuario_id = req.usuario.id; 
    try {
        await conmysql.query('UPDATE usuarios SET token_push = ? WHERE id = ?', [token_push, usuario_id]);
        return res.json({ message: 'Token actualizado' });
    } catch (error) {
        console.error("=== ERROR DETALLADO EN PUSH ===", error);
        return res.status(500).json({ 
            message: 'Error al actualizar token',
            sqlMessage: error.sqlMessage,
            code: error.code 
        });
    }
};