import { initializeApp, cert } from 'firebase-admin/app';
import serviceAccount from './config/firebase-service-account.json' with { type: 'json' };

const app = initializeApp({
    credential: cert(serviceAccount)
});

export default app;