import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

// Usamos el puerto de las variables de entorno o el 3000 por defecto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Servidor ejecutándose en el puerto', PORT);
});