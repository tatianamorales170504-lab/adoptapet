import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

if (getApps().length === 0) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no está configurada.");
    }

    // Limpiamos los saltos de línea para que JSON.parse no falle
    const rawValue = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccount = JSON.parse(rawValue.replace(/\\n/g, '\n'));
    
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export const messaging = getMessaging();