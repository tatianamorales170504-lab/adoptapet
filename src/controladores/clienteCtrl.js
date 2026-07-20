import { conmysql as pool } from '../db.js';

// 1. OBTENER CLIENTES ACTIVOS (Mediante JOIN con usuarios)
export const obtenerClientes = async (req, res) => {
    const { busqueda } = req.query;

    try {
        // Consultamos clientes vinculados a usuarios activos (u.activo = 1)
        let sql = `
            SELECT c.* 
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE u.activo = 1
        `;
        let params = [];

        if (busqueda) {
            sql += " AND (c.nombre LIKE ? OR c.apellido LIKE ? OR c.identificacion LIKE ?)";
            const termino = `%${busqueda}%`;
            params = [termino, termino, termino];
        }

        const [clientes] = await pool.query(sql, params);
        res.json(clientes);
    } catch (error) {
        console.error("Error en obtenerClientes:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. OBTENER UN CLIENTE POR ID
export const obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [cliente] = await pool.query(
            "SELECT c.* FROM clientes c JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ? AND u.activo = 1", 
            [id]
        );
        if (cliente.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado o usuario inactivo" });
        }
        res.json(cliente[0]);
    } catch (error) {
        console.error("Error en obtenerClientePorId:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. ACTUALIZAR DATOS
export const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { telefono, direccion } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE clientes SET telefono = ?, direccion = ?, actualizado_en = NOW() WHERE id = ?",
            [telefono, direccion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.json({ message: "Datos del cliente actualizados correctamente." });
    } catch (error) {
        console.error("Error en actualizarCliente:", error);
        res.status(500).json({ error: error.message });
    }
};

// 4. INACTIVAR CLIENTE (Cambia estado en tabla usuarios)
export const inactivarCliente = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        // Actualizamos el estado en la tabla usuarios
        const [result] = await pool.query(
            "UPDATE usuarios SET activo = 0 WHERE id = ?",
            [usuario_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Cliente inactivado correctamente." });
    } catch (error) {
        console.error("Error en inactivarCliente:", error);
        res.status(500).json({ error: error.message });
    }
};

// 5. OBTENER CLIENTE POR USUARIO_ID
export const obtenerClientePorUsuarioId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [cliente] = await pool.query(
            "SELECT c.* FROM clientes c JOIN usuarios u ON c.usuario_id = u.id WHERE c.usuario_id = ? AND u.activo = 1", 
            [usuario_id]
        );
        
        if (cliente.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado o usuario inactivo" });
        }
        res.json(cliente[0]);
    } catch (error) {
        console.error("Error en obtenerClientePorUsuarioId:", error);
        res.status(500).json({ error: error.message });
    }
};