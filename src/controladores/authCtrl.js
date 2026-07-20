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
        // Iniciamos transacción para asegurar integridad
        await conmysql.query('START TRANSACTION');

        const claveEncriptada = await bcrypt.hash(password, 10);
        
        // 1. Intentar insertar en usuarios
        // Si el email ya existe, aquí se dispara el error ER_DUP_ENTRY
        const [userResult] = await conmysql.query(
            'INSERT INTO usuarios (email, password, rol, activo) VALUES (?, ?, ?, 1)', 
            [email, claveEncriptada, rolUsuario]
        );
        
        const nuevoUsuarioId = userResult.insertId;

        // 2. Intentar insertar en clientes
        // Si la identificación ya existe, aquí se dispara el error ER_DUP_ENTRY
        if (rolUsuario === 'cliente') {
            await conmysql.query(
                'INSERT INTO clientes (usuario_id, nombre, apellido, identificacion, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)', 
                [nuevoUsuarioId, nombre, apellido, identificacion || null, telefono || null, direccion || null]
            );
        }

        // Si llegamos aquí, todo fue correcto
        await conmysql.query('COMMIT');

        // Notificación protegida
        try {
            await enviarNotificacion(1, "Nuevo Registro", `Nuevo cliente registrado: ${nombre} ${apellido}`);
        } catch (notificacionError) {
            console.error("Error en notificación (no crítico):", notificacionError);
        }

        return res.status(201).json({ message: 'Usuario registrado con éxito' });

    } catch (error) {
    // Intentar revertir la transacción
    await conmysql.query('ROLLBACK').catch(() => {});

    console.error("ERROR COMPLETO:", error);

    return res.status(500).json({
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message
    });
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

        // RESPUESTA CORREGIDA:
        // Incluimos el objeto cliente completo (incluyendo el id) para el frontend
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
        console.error("Error en login:", error);
        return res.status(500).json({ message: 'Error en servidor' });
    }
};

export const guardarTokenPush = async (req, res) => {
    const { token_push } = req.body;
    const usuario_id = req.usuario.id; 
    try {
        await conmysql.query('UPDATE usuarios SET token_push = ? WHERE id = ?', [token_push, usuario_id]);
        return res.json({ message: 'Token actualizado' });
    } catch (error) {
        console.error("Error al actualizar token:", error);
        return res.status(500).json({ message: 'Error al actualizar token' });
    }
};
}