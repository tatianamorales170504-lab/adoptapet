import { conmysql as pool } from '../db.js';
import { messaging } from '../config/firebase.js';

// Función auxiliar interna para buscar el token de un usuario y enviar la notificación
const enviarPushPorUsuarioId = async (usuarioId, titulo, cuerpo) => {
    try {
        const [rows] = await pool.query(
            'SELECT token_push FROM usuarios WHERE id = ? AND token_push IS NOT NULL', 
            [usuarioId]
        );

        if (rows.length > 0 && rows[0].token_push) {
            await messaging.send({
                token: rows[0].token_push,
                notification: { title: titulo, body: cuerpo }
            });
        }
    } catch (error) {
        console.error("Error al enviar notificación push:", error);
    }
};

// 1. CREAR SOLICITUD (El usuario normal la envía)
export const registrarSolicitud = async (req, res) => {
    const { cliente_id, mascota_id, motivo } = req.body;
    
    if (!cliente_id || !mascota_id) {
        return res.status(400).json({ message: "Datos incompletos: cliente_id o mascota_id faltan." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar disponibilidad
        const [mascotas] = await connection.query("SELECT estado FROM mascotas WHERE id = ?", [mascota_id]);
        if (mascotas.length === 0) throw new Error("Mascota no encontrada");
        
        if (mascotas[0].estado.toLowerCase() !== 'disponible') {
            throw new Error("La mascota no está disponible");
        }

        // Insertar solicitud
        await connection.query(
            "INSERT INTO solicitudes_adopcion (cliente_id, mascota_id, motivo, estado) VALUES (?, ?, ?, 'pendiente')",
            [cliente_id, mascota_id, motivo]
        );

        // Cambiar estado mascota
        await connection.query("UPDATE mascotas SET estado = 'en_proceso' WHERE id = ?", [mascota_id]);

        await connection.commit();

        // NOTIFICACIÓN: Avisar a los Administradores (Buscamos a todos los que tengan rol de administrador)
        const [admins] = await pool.query("SELECT id FROM usuarios WHERE rol = 'administrador'");
        for (const admin of admins) {
            await enviarPushPorUsuarioId(admin.id, "Nueva Solicitud", "Hay una nueva solicitud de adopción pendiente.");
        }

        res.status(201).json({ message: "Éxito" });
    } catch (error) {
        await connection.rollback();
        console.error("DETALLE DEL ERROR:", error.message); 
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// 2. OBTENER TODAS LAS SOLICITUDES (Para el Admin)
export const obtenerSolicitudes = async (req, res) => {
    try {
        const [solicitudes] = await pool.query(`
            SELECT s.*, m.nombre AS nombre_mascota, c.nombre AS nombre_usuario
            FROM solicitudes_adopcion s
            JOIN mascotas m ON s.mascota_id = m.id
            JOIN clientes c ON s.cliente_id = c.id
            ORDER BY s.creado_en DESC
        `);
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. OBTENER SOLICITUDES POR CLIENTE (Para ver el historial del usuario)
export const obtenerSolicitudesPorCliente = async (req, res) => {
    const { cliente_id } = req.params; 

    try {
        const [solicitudes] = await pool.query(`
            SELECT s.*, m.nombre AS nombre_mascota 
            FROM solicitudes_adopcion s
            JOIN mascotas m ON s.mascota_id = m.id
            WHERE s.cliente_id = ?
            ORDER BY s.creado_en DESC
        `, [cliente_id]);
        
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. GESTIONAR SOLICITUD (El admin aprueba o rechaza)
export const gestionarSolicitud = async (req, res) => {
    const { id } = req.params;
    const { estado, comentarios_admin, mascota_id, cliente_id } = req.body;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Actualizar estado de la solicitud
        await connection.query(
            "UPDATE solicitudes_adopcion SET estado = ?, comentarios_admin = ?, actualizado_en = NOW() WHERE id = ?",
            [estado, comentarios_admin, id]
        );

        // 2. Controlar estado de la mascota
        if (estado === 'aprobada') {
            await connection.query("UPDATE mascotas SET estado = 'adoptado' WHERE id = ?", [mascota_id]);
        } else if (estado === 'rechazada') {
            await connection.query("UPDATE mascotas SET estado = 'disponible' WHERE id = ?", [mascota_id]);
        }

        await connection.commit();

        // NOTIFICACIÓN: Avisar al Cliente buscando su usuario_id a partir de su cliente_id
        if (cliente_id) {
            const [clienteRows] = await pool.query("SELECT usuario_id FROM clientes WHERE id = ?", [cliente_id]);
            if (clienteRows.length > 0) {
                const usuarioIdCliente = clienteRows[0].usuario_id;
                await enviarPushPorUsuarioId(usuarioIdCliente, "Estado de Solicitud", `Tu solicitud ha sido: ${estado}`);
            }
        }

        res.json({ message: `Solicitud ${estado} correctamente.` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};