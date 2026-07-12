import { getMessaging } from 'firebase-admin/messaging';

export const enviarNotificacion = async (
    token,
    titulo,
    mensaje,
    data = {}
) => {

    const message = {
        token,
        notification: {
            title: titulo,
            body: mensaje
        },
        data
    };

    return await getMessaging().send(message);
};