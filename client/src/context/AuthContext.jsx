import { createContext, useState, useContext } from "react";
import { registerRequest, loginRequest } from "../api/auth.js";

export const AuthContext = createContext();

// Hook personalizado para usar el contexto Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);

  // Registro de usuario
  const signup = async (user) => {
    try {
      const res = await registerRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]); // Limpiar errores si el registro es exitoso
    } catch (error) {
      console.error("Detalles del error:", error.response);

      // Validar que exista error.response y data para evitar errores inesperados
      if (Array.isArray(error.response?.data)) {
        setErrors(error.response.data);
      } else {
        setErrors(["Error desconocido"]);
      }
    }
  };

  // Inicio de sesión
  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      if (res.status === 200) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Verifica que exista error.response.data y sea array, sino muestra mensaje genérico
      if (Array.isArray(error.response?.data)) {
        setErrors(error.response.data);
      } else {
        setErrors([
          error.response?.data?.message || "Error en el inicio de sesión",
        ]);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        user,
        isAuthenticated,
        errors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
