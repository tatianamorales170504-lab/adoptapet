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
// 1. Obtener todos los pedidos (con datos del cliente)
export const obtenerPedidos = async (req, res) => {
    try {
        const [rows] = await conmysql.query(`
            SELECT p.*, c.cli_nombre 
            FROM pedidos p 
            INNER JOIN clientes c ON p.cli_id = c.cli_id 
            ORDER BY p.ped_fecha DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener la lista de pedidos" });
    }
};

// 2. Obtener un pedido por ID con su detalle y productos
export const obtenerPedidoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el pedido
        const [pedido] = await conmysql.query("SELECT * FROM pedidos WHERE ped_id = ?", [id]);
        
        if (pedido.length === 0) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }

        // Consultar el detalle del pedido junto con el nombre del producto
        const [detalles] = await conmysql.query(`
            SELECT pd.*, pr.prod_nombre 
            FROM pedidos_detalle pd
            INNER JOIN productos pr ON pd.prod_id = pr.prod_id
            WHERE pd.ped_id = ?
        `, [id]);

        res.json({
            pedido: pedido[0],
            detalles: detalles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle del pedido" });
    }
};
};