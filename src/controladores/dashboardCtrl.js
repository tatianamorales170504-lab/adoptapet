import { conmysql as pool } from '../db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [mascotas] = await pool.query('SELECT COUNT(*) as total FROM mascotas');
        const [solicitudes] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_adopcion WHERE estado = "pendiente"');
        const [clientes] = await pool.query('SELECT COUNT(*) as total FROM clientes');
        const [aprobadas] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_adopcion WHERE estado = "aprobada"');

        // NUEVO: Consultar las solicitudes recientes (ej. las últimas 5)
        const [solicitudesRecientes] = await pool.query(`
            SELECT 
                s.id, 
                s.estado, 
                m.nombre as nombreMascota, 
                c.nombre as nombreCliente 
            FROM solicitudes_adopcion s
            JOIN mascotas m ON s.mascota_id = m.id
            JOIN clientes c ON s.cliente_id = c.id
            ORDER BY s.id DESC
            LIMIT 5
        `);

        res.json({
            totalMascotas: mascotas[0].total,
            solicitudesPendientes: solicitudes[0].total,
            totalClientes: clientes[0].total,
            adopcionesExitosas: aprobadas[0].total,
            solicitudesRecientes: solicitudesRecientes // <--- Las enviamos al frontend
        });
        
    } catch (error) {
        console.error("ERROR DETALLADO:", error);
        res.status(500).json({ error: error.message });
    }
};