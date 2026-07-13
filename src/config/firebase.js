import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

if (getApps().length === 0) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no está configurada.");
    }

    // Usamos el valor directamente sin decodificar nada
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export const messaging = getMessaging();