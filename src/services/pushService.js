
import { conmysql as pool } from '../db.js';

export const enviarNotificacion = async (usuario_id, titulo, cuerpo) => {
    try {
        // Buscamos el token del usuario en la tabla usuarios
        const [rows] = await pool.query("SELECT token_push FROM usuarios WHERE id = ?", [usuario_id]);
        
        // Verificamos si el usuario existe y tiene un token
        if (rows.length > 0 && rows[0].token_push) {
            const message = {
                token: rows[0].token_push,
                notification: { 
                    title: titulo, 
                    body: cuerpo 
                },
                // OPCIONAL: Esto ayuda a que Android despierte la app si está en segundo plano
                android: { priority: 'high' } 
            };

            await messaging.send(message);
            console.log(`Notificación enviada con éxito al usuario: ${usuario_id}`);
        } else {
            console.log(`El usuario ${usuario_id} no tiene un token de notificación registrado.`);
        }
    } catch (error) {
        // Manejo de errores específico por si el token es inválido
        console.error("Error al enviar la notificación a Firebase:", error.message);
        
        // Si el error es porque el token ya no existe (unregistered), podrías borrarlo de tu BD aquí
        if (error.code === 'messaging/registration-token-not-registered') {
            await pool.query("UPDATE usuarios SET token_push = NULL WHERE id = ?", [usuario_id]);
        }
    }
};