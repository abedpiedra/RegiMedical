import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalleMantenimientos.module.css";
import { obtenerMantenimientoPorId } from "../../../api/mantenimientos.js";

function DetalleMantenimientos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState(null);
  const [error, setError] = useState("");

  // === Obtener mantenimiento por ID ===
  useEffect(() => {
    const fetchMantenimiento = async () => {
      try {
        const { data } = await obtenerMantenimientoPorId(id);
        setMantenimiento(data);
      } catch (err) {
        console.error("Error al obtener mantenimiento:", err);
        setError("No se pudo cargar la información del mantenimiento.");
      }
    };
    fetchMantenimiento();
  }, [id]);

  // === Si hay error ===
  if (error) {
    return (
      <div className="container-a mt-4">
        <div className={styles.alerta}>{error}</div>
        <button className="boton-Eliminar mt-3" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );
  }

  // === Cargando ===
  if (!mantenimiento) return <p className={styles.mensaje}>Cargando detalles...</p>;

  // === Render principal ===
  return (
    <div className={`container-a ${styles.container}`}>
      <h2 className={styles.tituloPrincipal}>Detalle del Mantenimiento</h2>

      <div className={styles.panelIzquierdo}>
        <div className={styles.card}>
          <table className="table-interior">
            <tbody>
              <tr>
                <th>Fecha</th>
                <td>{new Date(mantenimiento.fecha).toLocaleDateString("es-CL")}</td>
              </tr>
              <tr>
                <th>Serie</th>
                <td>{mantenimiento.serie}</td>
              </tr>
              <tr>
                <th>Lugar</th>
                <td>{mantenimiento.lugar}</td>
              </tr>
              <tr>
                <th>Tipo</th>
                <td>{mantenimiento.tipo}</td>
              </tr>
              <tr>
                <th>Técnico Responsable</th>
                <td>{mantenimiento.responsable}</td>
              </tr>
              <tr>
                <th>Estado del Equipo</th>
                <td>{mantenimiento.estado}</td>
              </tr>
              <tr>
                <th>Observaciones</th>
                <td>{mantenimiento.observaciones || "—"}</td>
              </tr>
              {mantenimiento.archivo && (
                <tr>
                  <th>Archivo PDF</th>
                  <td>
                    <a
                      href={`http://localhost:4000/uploads/${mantenimiento.archivo}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.linkArchivo}
                    >
                      Ver PDF
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h4 className={styles.subtitulo}>Parámetros Operacionales</h4>
          {mantenimiento.parametros_operacionales &&
          Object.keys(mantenimiento.parametros_operacionales).length > 0 ? (
            <table className="table-interior">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(mantenimiento.parametros_operacionales).map(
                  ([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <p className={styles.noParametros}>
              No se registraron parámetros operacionales.
            </p>
          )}
        </div>

        <button className="boton-Agregar" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    </div>
  );
}

export default DetalleMantenimientos;
