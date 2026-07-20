import {createPool} from "mysql2/promise";
import {BD_HOST, BD_USER, BD_PASSWORD, BD_DATABASE, BD_PORT} from './config.js'

console.log({
  host: BD_HOST,
  database: BD_DATABASE,
  user: BD_USER,
  passwordLength: BD_PASSWORD ? BD_PASSWORD.length : 0,
  port: BD_PORT
});

export const conmysql = createPool({
    host: BD_HOST,
    database: BD_DATABASE,
    user: BD_USER,
    password: BD_PASSWORD,
    port: BD_PORT,
    ssl: {
        rejectUnauthorized: false // Necesario para conexiones remotas en la nube
    }
});