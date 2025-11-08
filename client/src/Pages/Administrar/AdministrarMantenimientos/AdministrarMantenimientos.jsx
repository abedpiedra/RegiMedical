import React, { useEffect, useState, useRef } from "react";
import styles from "./AdministrarMantenimientos.module.css";
import { mantenimientosRequest } from "../../../api/mantenimientos.js";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import * as XLSX from "xlsx";

// === CONVERTIR FECHA ===
const excelDateToDMY = (v) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      const dd = String(d.d).padStart(2, "0");
      const mm = String(d.m).padStart(2, "0");
      const yyyy = String(d.y);
      return `${dd}-${mm}-${yyyy}`;
    }
  }
  if (typeof v === "string") {
    const s = v.trim();
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      const dd = String(m[1]).padStart(2, "0");
      const mm = String(m[2]).padStart(2, "0");
      const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${dd}-${mm}-${yyyy}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
  }
  const d = new Date(v);
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  return "";
};

const AdministrarMantenimientos = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    tipo: "",
    responsable: "",
    estado: "",
    search: "",
  });

  const navigate = useNavigate();

  // === PAGINACIÓN ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  // === CARGAR DATOS ===
  const fetchMantenimientos = async () => {
    try {
      const { data } = await mantenimientosRequest();
      const ordenados = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setMantenimientos(ordenados);
      setFiltered(ordenados);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  // === FILTROS ===
  useEffect(() => {
    const result = mantenimientos.filter((m) => {
      return (
        (filters.tipo === "" || m.tipo === filters.tipo) &&
        (filters.responsable === "" || m.responsable === filters.responsable) &&
        (filters.estado === "" || m.estado === filters.estado) &&
        (filters.search === "" ||
          Object.values(m)
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    });
    setFiltered(result);
    setCurrentPage(1);
  }, [filters, mantenimientos]);

  // === CLICK FUERA DEL FILTRO ===
  const filtroRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === ORDEN ===
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
    setFiltered((prev) =>
      [...prev].sort((a, b) =>
        direction === "asc"
          ? String(a[key]).localeCompare(String(b[key]))
          : String(b[key]).localeCompare(String(a[key]))
      )
    );
  };

  // === OTROS ===
  const handleAgregarClick = () => navigate("/CrearMantenimientos");
  const limpiarFiltros = () =>
    setFilters({ tipo: "", responsable: "", estado: "", search: "" });

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="container-a mt-4">
      <div className={styles.botonera}>
        {/* BOTÓN FILTRO */}
        <div className={styles.filtroWrapper} ref={filtroRef}>
          <button
            className="boton-Agregar"
            onClick={() => setShowFilter((v) => !v)}
            title="Filtrar"
            style={{ width: "50px", height: "50px", padding: "0" }}
          >
            🔍
          </button>

          {showFilter && (
            <div className={styles.buttomFiltro}>
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
              />

              <label>Tipo:</label>
              <select
                value={filters.tipo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tipo: e.target.value }))
                }
              >
                <option value="">Todos</option>
                {[
                  ...new Set(mantenimientos.map((m) => m.tipo).filter(Boolean)),
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <label>Técnico:</label>
              <select
                value={filters.responsable}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, responsable: e.target.value }))
                }
              >
                <option value="">Todos</option>
                {[
                  ...new Set(
                    mantenimientos.map((m) => m.responsable).filter(Boolean)
                  ),
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <label>Estado:</label>
              <select
                value={filters.estado}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="">Todos</option>
                {[
                  ...new Set(
                    mantenimientos.map((m) => m.estado).filter(Boolean)
                  ),
                ].map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>

              <button className="boton-Eliminar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
        {/* BOTÓN AGREGAR */}
        <button
          className="boton-Agregar"
          onClick={handleAgregarClick}
          style={{
            flex: 1, // 🔹 ocupa el espacio sobrante en el flex container
            minWidth: "120px", // 🔹 evita que se haga demasiado pequeño
          }}
        >
          Agregar
        </button>
      </div>

      {/* TABLA */}
      <div style={{ overflowX: "auto", marginTop: "10px" }}>
        <table className="table-interior">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")}>Fecha</th>
              <th onClick={() => handleSort("serie")}>Serie</th>
              <th onClick={() => handleSort("lugar")}>Lugar</th>
              <th onClick={() => handleSort("tipo")}>Tipo</th>
              <th onClick={() => handleSort("responsable")}>Técnico</th>
              <th onClick={() => handleSort("estado")}>Estado</th>
              <th>Observaciones</th>
              <th>Archivo</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((m, i) => (
              <tr key={m._id || i}>
                <td>
                  <Link to={`/Mantenimientos/${m._id}`} className="link-serie">
                    {excelDateToDMY(m.fecha)}
                  </Link>
                </td>
                <td>{m.serie}</td>
                <td>{m.lugar}</td>
                <td>{m.tipo}</td>
                <td>{m.responsable}</td>
                <td>{m.estado}</td>
                <td>{m.observaciones}</td>
                <td>
                  {m.archivo ? (
                    <a
                      href={`http://localhost:4000/uploads/${m.archivo}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "15px",
            gap: "8px",
          }}
        >
          <button
            className="boton-Agregar"
            onClick={prevPage}
            disabled={currentPage === 1}
            style={{
              width: "35px",
              height: "35px",
              fontSize: "16px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ◀
          </button>

          <span style={{ fontSize: "16px", fontWeight: "500" }}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            className="boton-Agregar"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            style={{
              width: "35px",
              height: "35px",
              fontSize: "16px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarMantenimientos;
