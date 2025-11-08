import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalleEquipos.module.css";

const API_BASE =
  import.meta?.env?.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

function DetalleEquipos() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipo, setEquipo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");

  // ===== Helpers de rutas públicas/estáticas =====
  const isAbs = (s) =>
    /^https?:\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s);

  // BASE_URL de Vite (por si usas basename en prod)
  const PUBLIC_BASE = (import.meta?.env?.BASE_URL || "/").replace(/\/+$/, "");

  // Mapea a URL pública servida desde client/public
  const toPublicUrl = (p) => {
    if (!p) return null;
    const clean = String(p).replace(/^\/+/, ""); // quita "/" iniciales
    return `${PUBLIC_BASE}/${clean}`.replace(/\/{2,}/g, "/");
  };

  // Normaliza cualquier origen a URL final de imagen
  const toImgUrl = (src) => {
    if (!src) return null;
    if (isAbs(src)) return src;

    // Quita "/" iniciales para poder chequear prefijos
    const s = String(src).replace(/^\/+/, "");

    // Si ya apunta al folder público
    if (s.startsWith("Equipos_Fotos/")) return toPublicUrl(s);

    // Si es solo un nombre o subcarpeta (relativo), lo mapeamos a public/Equipos_Fotos
    return toPublicUrl(`Equipos_Fotos/${s}`);
  };

  // Obtiene posibles fuentes de imagen desde distintos campos del equipo
  const getImageSources = (e) => {
    if (!e) return [];
    const raw = [];

    // URLs completas o rutas absolutas
    if (e.foto_path) raw.push(String(e.foto_path));
    if (e.imagen_url) raw.push(String(e.imagen_url));

    // Campos que suelen venir como nombres/relativas
    if (e.imagen) raw.push(String(e.imagen));
    if (e.foto) raw.push(String(e.foto));

    if (Array.isArray(e.imagenes)) {
      e.imagenes.forEach((it) => {
        if (!it) return;
        raw.push(String(it));
      });
    }

    // Normaliza, filtra y quita duplicados
    const urls = raw
      .filter(Boolean)
      .map(toImgUrl)
      .filter(Boolean);

    return Array.from(new Set(urls));
  };

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/equipos/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el equipo");
        const data = await res.json();
        setEquipo(data);

        if (data.serie) {
          const mantRes = await fetch(
            `${API_BASE}/api/mantenimientos/serie/${data.serie}`
          );
          if (mantRes.ok) {
            const mantData = await mantRes.json();
            setMantenimientos(mantData);
          } else {
            // Si no hay mantenciones o 404, lo dejamos como []
            setMantenimientos([]);
          }
        }
      } catch (err) {
        setError("Error al obtener los datos del equipo.");
      }
    };
    fetchEquipo();
  }, [id]);

  if (error)
    return (
      <div className="container-a mt-4">
        <div className={styles.alerta}>{error}</div>
        <button className="boton-Eliminar mt-3" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );

  if (!equipo) return <p className={styles.mensaje}>Cargando información...</p>;

  const imagenes = getImageSources(equipo);
  const FALLBACK_IMG = toPublicUrl("Equipos_Fotos/_placeholder.png"); // crea este archivo en public

  return (
    <div className={`container-a ${styles.container}`}>
      {/* === PANEL IZQUIERDO === */}
      <div className={styles.panelIzquierdo}>
        <h3 className={styles.titulo}>Detalles del Equipo</h3>
        <div className={styles.card}>
          <p>
            <strong>Serie:</strong> {equipo.serie}
          </p>
          <p>
            <strong>Modelo:</strong> {equipo.modelo}
          </p>
          <p>
            <strong>Marca:</strong> {equipo.marca}
          </p>
          <p>
            <strong>Área:</strong> {equipo.area}
          </p>
          <p>
            <strong>Estado:</strong> {equipo.estado}
          </p>
          <p>
            <strong>Proveedor:</strong> {equipo.proveedor}
          </p>
          <p>
            <strong>Última Mantención:</strong> {equipo.umantencion || "-"}
          </p>
          <p>
            <strong>Próxima Mantención:</strong> {equipo.pmantencion || "-"}
          </p>

          <h5 className={styles.subtitulo}>Atributos Técnicos</h5>
          {equipo.atributos_tecnicos &&
          Object.keys(equipo.atributos_tecnicos).length > 0 ? (
            <ul>
              {Object.entries(equipo.atributos_tecnicos).map(([key, val]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(val)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay atributos técnicos registrados.</p>
          )}

          {/* === Imágenes del equipo === */}
          <h5 className={styles.subtitulo}>Imágenes del equipo</h5>
          {imagenes.length > 0 ? (
            <div className={styles.galeria}>
              {imagenes.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Equipo ${equipo.serie} - ${i + 1}`}
                  className={styles.foto}
                  loading="lazy"
                  onError={(e) => {
                    // Evita loops si también falla el placeholder
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              ))}
            </div>
          ) : (
            <p>No hay imágenes asociadas.</p>
          )}
        </div>

        <button
          className="boton-Agregar mt-3"
          onClick={() => navigate("/AdministrarEquipos")}
        >
          ← Volver
        </button>
      </div>

      {/* === PANEL DERECHO === */}
      <div className={styles.panelDerecho}>
        <h3 className={styles.titulo}>Historial de Mantenciones</h3>
        {mantenimientos.length > 0 ? (
          <table className="table-interior">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Técnico</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {mantenimientos.map((m) => (
                <tr key={m._id}>
                  <td>{new Date(m.fecha).toLocaleDateString("es-CL")}</td>
                  <td>{m.tipo}</td>
                  <td>{m.responsable}</td>
                  <td>{m.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay mantenciones registradas para este equipo.</p>
        )}
      </div>
    </div>
  );
}

export default DetalleEquipos;
