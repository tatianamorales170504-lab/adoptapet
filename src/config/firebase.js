import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

if (getApps().length === 0) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no está configurada.");
    }

    // Decodificamos el Base64 a string y luego a JSON
    const base64Value = process.env.FIREBASE_SERVICE_ACCOUNT;
    const jsonString = Buffer.from(base64Value, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(jsonString);
    
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export const messaging = getMessaging();