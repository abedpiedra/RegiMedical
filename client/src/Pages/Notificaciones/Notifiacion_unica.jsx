import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Notificaciones.module.css";

const NotificacionUnica = () => {
  const { id } = useParams(); // obtiene el id desde la URL
  const [notificacion, setNotificacion] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // === CARGAR NOTIFICACIÓN ===
  const fetchNotificacion = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/notificaciones/${id}`
      );
      setNotificacion(data);

      // marcar como leída automáticamente
      await axios.put(`http://localhost:4000/api/notificaciones/${id}/leida`);
    } catch (error) {
      console.error("Error al cargar notificación:", error);
      setError("No se pudo cargar la notificación.");
    }
  };

  useEffect(() => {
    fetchNotificacion();
  }, [id]);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!notificacion) return <p>Cargando notificación...</p>;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container-a mt-4">
      <div className={styles.botonera}>
        <h1>📰 Detalle de Notificación</h1>
      </div>

      <div className={styles.detalleNoti}>
        <p>
          <strong>ID:</strong> {notificacion._id}
        </p>
        <p>
          <strong>Mensaje:</strong> {notificacion.mensaje}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          {notificacion.leida ? "✅ Leída" : "📩 No leída"}
        </p>
        <p>
          <strong>Fecha de creación:</strong>{" "}
          {formatDate(notificacion.createdAt)}
        </p>
        {notificacion.updatedAt && (
          <p>
            <strong>Última actualización:</strong>{" "}
            {formatDate(notificacion.updatedAt)}
          </p>
        )}
        <div className={styles.btnGroup}>
          <button
            className="boton-Agregar"
            onClick={() => navigate("/notificaciones")}
          >
            ← Volver al historial
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificacionUnica;
