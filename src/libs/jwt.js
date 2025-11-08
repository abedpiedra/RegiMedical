import { TOKEN_SECRET } from "../config.js";
import jwt from 'jsonwebtoken'

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,           // Datos que quieres incluir en el token (payload)
      TOKEN_SECRET,      // Clave secreta para firmar el token (de config)
      {
        expiresIn: "1d", // Tiempo de expiración del token: 1 día
      },
      (err, token) => {  // Callback que recibe error o el token generado
        if (err) reject(err);   // Si hay error, rechaza la promesa
        else resolve(token);    // Si no, resuelve con el token generado
      }
    );
  });
}
