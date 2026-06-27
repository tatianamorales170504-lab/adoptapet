import { conmysql } from '../db.js';

// Asegúrate de que tenga el 'export' aquí
export const crearPedido = async (req, res) => {
    const { cli_id, usr_id, ped_estado, detalle } = req.body;
    const connection = await conmysql;
    
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, ?)',
            [cli_id, usr_id, ped_estado ? 1 : 0]
        );
        const ped_id = result.insertId;

        for (const item of detalle) {
            await connection.query(
                'INSERT INTO pedidos_detalle (ped_id, prod_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)',
                [ped_id, item.prod_id, item.det_cantidad, item.det_precio]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Pedido registrado con éxito', ped_id });
        
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Error al registrar pedido: " + error.message });
    }
};