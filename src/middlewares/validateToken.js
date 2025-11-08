import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  const { token } = req.cookies; // Obtiene el token JWT de las cookies

  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" }); 
    // Si no hay token, responde con error 401 (no autorizado)

  // Verifica que el token sea válido y esté firmado con TOKEN_SECRET
  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" }); 
    // Si el token no es válido o expiró, responde 403 (prohibido)

    req.user = user; // Si todo bien, guarda los datos decodificados en req.user
    next();          // Continúa al siguiente middleware o ruta protegida
  });
};
