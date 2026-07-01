import { conmysql } from '../db.js';
export const guardarPedido = async (req, res) => {
    const conexion = await conmysql.getConnection();

    try {
        await conexion.beginTransaction();
        const {
            cli_id,
            cli_identificacion,
            cli_nombre,
            cli_telefono,
            cli_correo,
            cli_direccion,
            cli_pais,
            cli_ciudad,
            ped_fecha,
            usr_id,
            ped_estado,
            detalle
        } = req.body;
        // Validaciones
        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }
        let idCliente = Number(cli_id);
        // Cliente nuevo
        if (idCliente === 0) {

            const [cliente] = await conexion.query(
                `INSERT INTO clientes
                (
                    cli_identificacion,
                    cli_nombre,
                    cli_telefono,
                    cli_correo,
                    cli_direccion,
                    cli_pais,
                    cli_ciudad
                )
                VALUES (?,?,?,?,?,?,?)`,
                [
                    cli_identificacion,
                    cli_nombre,
                    cli_telefono,
                    cli_correo,
                    cli_direccion,
                    cli_pais,
                    cli_ciudad
                ]
            );

            idCliente = cliente.insertId;
        }
        // Pedido
        const [pedido] = await conexion.query(
            `INSERT INTO pedidos
            (
                cli_id,
                ped_fecha,
                usr_id,
                ped_estado
            )
            VALUES (?,?,?,?)`,
            [
                idCliente,
                ped_fecha,
                usr_id,
                ped_estado
            ]
        );
        const ped_id = pedido.insertId;
        // Detalle
        for (const item of detalle) {
            if (Number(item.det_cantidad) <= 0) {
                throw new Error(`Cantidad inválida del producto ${item.prod_id}`);
            }
            if (Number(item.det_precio) <= 0) {
                throw new Error(`Precio inválido del producto ${item.prod_id}`);
            }
            // Verificar existencia del producto
            const [producto] = await conexion.query(
                "SELECT prod_id FROM productos WHERE prod_id=?",
                [item.prod_id]
            );
            if (producto.length === 0) {
                throw new Error(`El producto ${item.prod_id} no existe.`);
            }
            await conexion.query(
                `INSERT INTO pedidos_detalle
                (
                    prod_id,
                    ped_id,
                    det_cantidad,
                    det_precio
                )
                VALUES (?,?,?,?)`,
                [
                    item.prod_id,
                    ped_id,
                    item.det_cantidad,
                    item.det_precio
                ]
            );
        }
        await conexion.commit();
        res.status(201).json({
            ok: true,
            mensaje: "Pedido registrado correctamente.",
            ped_id,
            cli_id: idCliente
        });

    } catch (error) {
        await conexion.rollback();
        console.error(error);
        res.status(500).json({
            ok: false,
            mensaje: error.message
        });

    } finally {
        conexion.release();
    }

};
export const getPedidos = async (req, res) => {
    try {
        // Consulta principal: une pedidos con clientes y usuarios
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.cli_id,
                c.cli_nombre,
                p.ped_fecha,
                p.usr_id,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            ORDER BY p.ped_fecha DESC
        `);

        // Obtener los detalles de todos los pedidos
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.prod_id,
                pr.prod_nombre,
                  pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
        `);

        // Unir los detalles a cada pedido
        const pedidosConDetalles = pedidos.map(pedido => {
            const detallesPedido = detalles.filter(d => d.ped_id === pedido.ped_id);
            return { ...pedido, detalles: detallesPedido };
        });

        res.json(pedidosConDetalles);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return res.status(500).json({ message: 'Error al obtener los pedidos.' });
    }
};

export const getPedidoxId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que venga el ID
        if (!id) {
            return res.status(400).json({ message: 'El ID del pedido es obligatorio.' });
        }

        // Consulta principal: datos del pedido y cliente
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.cli_id,
                c.cli_nombre,
                p.ped_fecha,
                p.usr_id,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            WHERE p.ped_id = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const pedido = pedidos[0];

        // Obtener detalles del pedido
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.prod_id,
                pr.prod_nombre,
                 pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?
        `, [id]);

        pedido.detalles = detalles;

        res.json(pedido);

    } catch (error) {
        console.error('Error al obtener el pedido por ID:', error);
        return res.status(500).json({ message: 'Error al obtener el pedido.' });
    }
};