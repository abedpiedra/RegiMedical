import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import styles from "./ResultadosBusqueda.module.css";
import axios from "axios";

export default function ResultadosBusqueda() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [data, setData] = useState({
    equipos: [],
    proveedores: [],
    mantenimientos: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fn = async () => {
      if (!q) return;
      setLoading(true);
      try {
        const { data } = await axios.get("http://localhost:4000/api/search", {
          params: { q, limit: 50 },
        });
        setData(data || { equipos: [], proveedores: [], mantenimientos: [] });
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [q]);

  if (!q)
    return (
      <div className={styles.mensaje}>
        Ingresa un término de búsqueda para comenzar.
      </div>
    );

  if (loading)
    return (
      <div className={styles.mensaje}>
        Buscando resultados para “{q}”...
      </div>
    );

  const { equipos, proveedores, mantenimientos } = data;

  return (
    <div className={`container-a ${styles.resultadosContainer}`}>
      <h2 className={styles.tituloPrincipal}>Resultados para “{q}”</h2>

      {/* ==== EQUIPOS ==== */}
      <section className={styles.section}>
        <h3 className={styles.tituloSeccion}>Equipos ({equipos.length})</h3>
        {equipos.length === 0 ? (
          <p className={styles.sinResultados}>Sin resultados</p>
        ) : (
          <div className={styles.tablaWrapper}>
            <table className="table-interior">
              <thead>
                <tr>
                  <th>Serie</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Área</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <Link
                        to={`/equipos/${e._id}`}
                        className="link-serie"
                        title="Ver detalles del equipo"
                      >
                        {e.serie}
                      </Link>
                    </td>
                    <td>{e.marca}</td>
                    <td>{e.modelo}</td>
                    <td>{e.area}</td>
                    <td>{e.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ==== PROVEEDORES ==== */}
      <section className={styles.section}>
        <h3 className={styles.tituloSeccion}>
          Proveedores ({proveedores.length})
        </h3>
        {proveedores.length === 0 ? (
          <p className={styles.sinResultados}>Sin resultados</p>
        ) : (
          <div className={styles.tablaWrapper}>
            <table className="table-interior">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <Link
                        to={`/proveedores/${p._id}`}
                        className="link-serie"
                      >
                        {p.nombre_empresa}
                      </Link>
                    </td>
                    <td>{p.rut || "Sin RUT"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ==== MANTENIMIENTOS ==== */}
      <section className={styles.section}>
        <h3 className={styles.tituloSeccion}>
          Mantenimientos ({mantenimientos.length})
        </h3>
        {mantenimientos.length === 0 ? (
          <p className={styles.sinResultados}>Sin resultados</p>
        ) : (
          <div className={styles.tablaWrapper}>
            <table className="table-interior">
              <thead>
                <tr>
                  <th>Serie</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientos.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <Link
                        to={`/mantenimientos/${m._id}`}
                        className="link-serie"
                      >
                        {m.serie}
                      </Link>
                    </td>
                    <td>{m.tipo}</td>
                    <td>
                      {new Date(m.fecha).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
