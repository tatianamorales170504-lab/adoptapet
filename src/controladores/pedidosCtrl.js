import { conmysql } from '../db.js';

export const crearPedido = async (req, res) => {
    const { cli_id, usr_id, ped_estado, detalle } = req.body;
    let connection;

    try {
        // 1. Obtenemos una conexión individual del pool
        connection = await conmysql.getConnection();
        
        // 2. Iniciamos la transacción
        await connection.beginTransaction();

        // 3. Insertar el pedido
        const [result] = await connection.query(
            'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, ?)',
            [cli_id, usr_id, ped_estado ? 1 : 0]
        );
        const ped_id = result.insertId;

        // 4. Insertar el detalle del pedido
        for (const item of detalle) {
            await connection.query(
                'INSERT INTO pedidos_detalle (ped_id, prod_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)',
                [ped_id, item.prod_id, item.det_cantidad, item.det_precio]
            );
        }

        // 5. Confirmar transacción
        await connection.commit();
        res.status(201).json({ message: 'Pedido registrado con éxito', ped_id });
        
    } catch (error) {
        // 6. Rollback seguro: solo si la conexión existe
        if (connection) {
            await connection.rollback();
        }
        console.error("Error al registrar pedido:", error);
        res.status(500).json({ message: "Error al registrar pedido: " + error.message });
        
    } finally {
        // 7. Liberar la conexión al pool para que otros puedan usarla
        if (connection) {
            connection.release();
        }
    }
};