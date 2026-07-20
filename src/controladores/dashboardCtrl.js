import { conmysql as pool } from '../db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [mascotas] = await pool.query('SELECT COUNT(*) as total FROM mascotas');
        const [solicitudes] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_adopcion WHERE estado = "pendiente"');
        const [clientes] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
        const [aprobadas] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_adopcion WHERE estado = "aprobada"');

        // Accedemos a [0].total porque el resultado de pool.query es un array de filas
        res.json({
            totalMascotas: mascotas[0].total,
            solicitudesPendientes: solicitudes[0].total,
            totalClientes: clientes[0].total,
            adopcionesExitosas: aprobadas[0].total
        });
        
    } catch (error) {
        console.error("ERROR DETALLADO:", error);
        res.status(500).json({ error: error.message });
    }
};