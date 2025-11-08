import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Notificaciones.module.css";
import axios from "axios";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  const fetchNotificaciones = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/notificaciones/todas");
      setNotificaciones(data);
    } catch (error) {
      setError("Error al cargar notificaciones");
      console.error("Error cargando notificaciones:", error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const totalPages = Math.ceil(notificaciones.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = notificaciones.slice(indexOfFirst, indexOfLast);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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
        <h1>📋 Historial de Notificaciones</h1>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tablaContainer}>
        <table className="table-interior">
          <thead>
            <tr>
              <th>#</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((n, index) => (
                <tr
                  key={n._id || index}
                  className={n.leida ? styles.leida : styles.noLeida}
                >
                  <td>{indexOfFirst + index + 1}</td>
                  <td>
                    <span
                      className={styles.mensajeLink}
                      onClick={() => navigate(`/notificacion/${n._id}`)}
                    >
                      {n.mensaje}
                    </span>
                  </td>
                  <td>{n.leida ? "Leída" : "No leída"}</td>
                  <td>{formatDate(n.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.vacio}>
                  No hay notificaciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={prevPage} disabled={currentPage === 1}>
              ◀
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;
