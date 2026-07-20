import { conmysql as pool } from '../db.js';

// 1. CREAR MASCOTA
export const registrarMascota = async (req, res) => {
    const { nombre, especie, raza, edad_estimada, descripcion, estado_salud, estado } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            "INSERT INTO mascotas (nombre, especie, raza, edad_estimada, descripcion, estado_salud, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nombre, especie, raza, edad_estimada, descripcion, estado_salud, estado || 'disponible']
        );
        const mascotaId = result.insertId;
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                await connection.query(
                    "INSERT INTO imagenes_mascota (mascota_id, ruta_imagen, es_principal) VALUES (?, ?, ?)",
                    [mascotaId, req.files[i].path, (i === 0 ? 1 : 0)]
                );
            }
        }
        await connection.commit();
        res.status(201).json({ message: "Mascota registrada", id: mascotaId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// 2. ACTUALIZAR DATOS DE UNA MASCOTA
export const actualizarMascota = async (req, res) => {
    const { id } = req.params;
    const { nombre, especie, raza, edad_estimada, descripcion, estado_salud, estado } = req.body;
    try {
        const [result] = await pool.query(
            "UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad_estimada = ?, descripcion = ?, estado_salud = ?, estado = ?, actualizado_en = NOW() WHERE id = ?",
            [nombre, especie, raza, edad_estimada, descripcion, estado_salud, estado, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Mascota no encontrada" });
        res.json({ message: "Mascota actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. CAMBIAR SOLO EL ESTADO
export const cambiarEstadoMascota = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const [result] = await pool.query(
            "UPDATE mascotas SET estado = ?, actualizado_en = NOW() WHERE id = ?",
            [estado, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Mascota no encontrada" });
        res.json({ message: `Estado de la mascota actualizado a '${estado}'` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR REGISTRO DE MASCOTA
export const eliminarMascota = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM mascotas WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Mascota no encontrada" });
        res.json({ message: "Mascota eliminada del sistema correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. OBTENER CATÁLOGO COMPLETO
export const obtenerCatálogo = async (req, res) => {
    try {
        const [mascotas] = await pool.query(`
            SELECT m.*, 
            GROUP_CONCAT(i.ruta_imagen) AS todas_imagenes
            FROM mascotas m
            LEFT JOIN imagenes_mascota i ON m.id = i.mascota_id
            GROUP BY m.id
            ORDER BY m.creado_en DESC
        `);
        const resultado = mascotas.map(m => ({
            ...m,
            imagenes: m.todas_imagenes ? m.todas_imagenes.split(',') : []
        }));
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. OBTENER DETALLE DE UNA MASCOTA
export const obtenerDetalleMascota = async (req, res) => {
    const { id } = req.params;
    try {
        const [mascota] = await pool.query("SELECT * FROM mascotas WHERE id = ?", [id]);
        if (mascota.length === 0) return res.status(404).json({ message: "Mascota no encontrada" });

        const [imagenes] = await pool.query("SELECT * FROM imagenes_mascota WHERE mascota_id = ?", [id]);

        res.json({
            ...mascota[0],
            imagenes: imagenes // Devuelve el objeto completo (con ID y ruta) para poder editar después
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. ACTUALIZAR IMAGEN ESPECÍFICA (Cloudinary)
export const actualizarImagenMascota = async (req, res) => {
    const { id_imagen } = req.params; // ID de la fila en 'imagenes_mascota'
    const { nueva_ruta } = req.body;  // Nueva URL de Cloudinary

    try {
        const [result] = await pool.query(
            "UPDATE imagenes_mascota SET ruta_imagen = ? WHERE id = ?",
            [nueva_ruta, id_imagen]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }

        res.json({ message: "Imagen de Cloudinary actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};