import React, { createContext, useContext, useEffect, useState } from "react";
import { obtenerNotificacionesRequest, marcarNotificacionLeidaRequest } from "../api/notificaciones.js";

const NotificacionesContext = createContext();

export const useNotificaciones = () => useContext(NotificacionesContext);

export const NotificacionesProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = async () => {
    try {
      const res = await obtenerNotificacionesRequest();
      setNotificaciones(res.data);
    } catch (error) {
      console.error("Error al obtener notificaciones", error);
    }
  };

  const marcarComoLeida = async (id) => {
    await marcarNotificacionLeidaRequest(id);
    cargarNotificaciones();
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 60000); // actualiza cada minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificacionesContext.Provider value={{ notificaciones, marcarComoLeida }}>
      {children}
    </NotificacionesContext.Provider>
  );
};
