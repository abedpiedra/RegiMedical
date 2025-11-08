// Importación del modelo de usuario y utilidades necesarias
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; // Para el hash de contraseñas
import { createAccessToken } from "../libs/jwt.js"; // Función para crear tokens JWT

// Registro de nuevos usuarios
export const register = async (req, res) => {
  const { name, apellido, email, compania, celular, rol, password } = req.body;

  try {
    // Verifica si el correo ya está registrado
    const userFound = await User.findOne({ email });

    if (userFound)
      return res.status(400).json(["the email is already in use"]);

    // Hashea la contraseña con un salt de 10 rondas
    const passwordhash = await bcrypt.hash(password, 10);

    // Crea una nueva instancia de usuario
    const newUser = new User({
      name,
      apellido,
      email,
      compania,
      celular,
      rol,
      password: passwordhash,
    });

    // Guarda el usuario en la base de datos
    const userSaved = await newUser.save();

    // Genera un token JWT usando el ID del usuario
    const token = await createAccessToken({ id: userSaved._id });

    // Guarda el token en una cookie
    res.cookie("token", token);

    // Devuelve la información del usuario (sin la contraseña)
    res.json({
      id: userSaved._id,
      name: userSaved.name,
      apellido: userSaved.apellido,
      email: userSaved.email,
      compania: userSaved.compania,
      celular: userSaved.celular,
      rol: userSaved.rol,
      creatdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (error) {
    // Manejo de errores generales
    res.status(500).json({ message: error.message });
  }
};

// Inicio de sesión de usuarios registrados
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca el usuario por email
    const userFound = await User.findOne({ email });

    // Si no existe el usuario
    if (!userFound)
      return res.status(400).json({ message: "User not found" });

    // Compara la contraseña ingresada con el hash guardado
    const isMatch = await bcrypt.compare(password, userFound.password);

    // Si las contraseñas no coinciden
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // Genera un token JWT para el usuario autenticado
    const token = await createAccessToken({ id: userFound._id });

    // Guarda el token en una cookie
    res.cookie("token", token);

    // Devuelve los datos del usuario
    res.json({
      id: userFound._id,
      name: userFound.name,
      apellido: userFound.apellido,
      email: userFound.email,
      compania: userFound.compania,
      celular: userFound.celular,
      rol: userFound.rol,
      creatdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    // Manejo de errores generales
    res.status(500).json({ message: error.message });
  }
};

// Cierre de sesión (logout)
export const logout = (req, res) => {
  // Limpia la cookie del token (la expira de inmediato)
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200); // OK sin contenido
};

// Perfil del usuario autenticado
export const profile = async (req, res) => {
  // Busca el usuario a partir del ID decodificado del token
  const userFound = await User.findById(req.user.id);

  // Si no se encuentra el usuario
  if (!userFound)
    return res.status(400).json({ message: "User not Found" });

  // Retorna la información del perfil
  return res.json({
    id: userFound._id,
    name: userFound.name,
    apellido: userFound.apellido,
    email: userFound.email,
    compania: userFound.compania,
    celular: userFound.celular,
    rol: userFound.rol,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};
 