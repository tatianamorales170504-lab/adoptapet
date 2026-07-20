import { conmysql as pool } from '../db.js';

// 1. OBTENER FAVORITOS DEL CLIENTE
export const obtenerFavoritos = async (req, res) => {
    const { cliente_id } = req.params;
    try {
        const [results] = await pool.query(
            "SELECT mascota_id FROM favoritos WHERE cliente_id = ?", 
            [cliente_id]
        );
        // Devuelve un arreglo simple de IDs [1, 5, 8]
        const ids = results.map(row => row.mascota_id);
        res.json(ids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. AGREGAR A FAVORITOS
export const agregarFavorito = async (req, res) => {
    const { cliente_id, mascota_id } = req.body;
    try {
        await pool.query(
            "INSERT INTO favoritos (cliente_id, mascota_id, creado_en) VALUES (?, ?, NOW())",
            [cliente_id, mascota_id]
        );
        res.status(201).json({ message: "Añadido a favoritos" });
    } catch (error) {
        console.error("Error en BD:", error); // <-- MIRA ESTE ERROR EN LA TERMINAL
        res.status(500).json({ error: error.message });
    }
};
// 3. ELIMINAR DE FAVORITOS
export const eliminarFavorito = async (req, res) => {
    const { cliente_id, mascota_id } = req.params;
    try {
        const [result] = await pool.query(
            "DELETE FROM favoritos WHERE cliente_id = ? AND mascota_id = ?",
            [cliente_id, mascota_id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Relación no encontrada" });
        res.json({ message: "Eliminado de favoritos" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};