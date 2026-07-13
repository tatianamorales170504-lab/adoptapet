import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Usamos getApps() directamente en lugar de admin.apps
if (getApps().length === 0) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no está configurada en Render.");
    }

    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n')
    );
    
    initializeApp({
        credential: cert(serviceAccount)
    });
}

// Exportamos la instancia de mensajería para usarla en tus controladores
export const messaging = getMessaging();