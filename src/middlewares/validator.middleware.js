export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);  // Valida que req.body cumpla con el schema
    next();                 // Si es válido, continúa con la siguiente función
  } catch (error) {
    return res
      .status(400)          // Si hay error de validación, responde con 400
      .json(error.errors.map((error) => error.message)); // Manda solo los mensajes de error
  }
};
