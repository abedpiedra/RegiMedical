import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdministrarEquipos.module.css";
import { equiposRequest, deleteEquipo } from "../../../api/equipos.js";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import excelLogo from "../../../Images/excel.png";
import axios from "axios";
import plantillaExcel from "../../../../public/Templates/equipos_a_importar.xlsx";

// URL base del backend (usa .env si está definida)
const API_BASE =
  import.meta?.env?.VITE_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:4000";

// === FUNCIONES FECHAS ===
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

const addMonthsDMY = (dateStr, months) => {
  if (!dateStr) return "";
  const [dd, mm, yyyy] = dateStr.split("-").map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  date.setMonth(date.getMonth() + months);
  const newDd = String(date.getDate()).padStart(2, "0");
  const newMm = String(date.getMonth() + 1).padStart(2, "0");
  const newYy = date.getFullYear();
  return `${newDd}-${newMm}-${newYy}`;
};

const AdministrarEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    area: "",
    modelo: "",
    marca: "",
    estado: "",
    search: "",
  });

  const navigate = useNavigate();

  // refs
  const fileInputRef = useRef(null);
  const filtroRef = useRef(null); // <-- FALTABA ESTA REF

  // descarga plantilla
  const handleDownloadPlantilla = () => {
    const a = document.createElement("a");
    a.href = plantillaExcel;
    a.download = "equipos_a_importar.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ventana con 2 opciones (importar/plantilla)
  const handleExcelClick = async () => {
    const result = await Swal.fire({
      title: "Excel",
      text: "¿Qué te gustaría hacer?",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Importar desde Excel",
      denyButtonText: "Descargar plantilla",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4d68d5",
      denyButtonColor: "#6d84a5",
    });

    if (result.isConfirmed) {
      fileInputRef.current?.click();
    } else if (result.isDenied) {
      handleDownloadPlantilla();
    }
  };

  // === PAGINACIÓN ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  // === CARGAR EQUIPOS ===
  const fetchEquipos = async () => {
    try {
      const { data } = await equiposRequest();
      const ordenados = [...data].reverse();
      setEquipos(ordenados);
      setFiltered(ordenados);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  // === FILTROS ===
  useEffect(() => {
    const result = equipos.filter((p) => {
      return (
        (filters.area === "" || p.area === filters.area) &&
        (filters.modelo === "" || p.modelo === filters.modelo) &&
        (filters.marca === "" || p.marca === filters.marca) &&
        (filters.estado === "" || p.estado === filters.estado) &&
        (filters.search === "" ||
          Object.values(p)
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    });
    setFiltered(result);
    setCurrentPage(1);
  }, [filters, equipos]);

  // === CLICK FUERA DEL FILTRO ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === ORDEN (si quieres usarlo en headers) ===
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

  // === ELIMINAR ===
  const eliminar = async (_id, serie) => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirmación",
      text: `¿Eliminar el equipo "${serie}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6d84a5ff",
      cancelButtonColor: "#4d68d5ff",
      confirmButtonText: "Sí, eliminar",
    });
    if (isConfirmed) {
      try {
        const { data } = await deleteEquipo(_id);
        if (data.message === "Equipo eliminado correctamente") {
          toast("Equipo eliminado correctamente", { autoClose: 2000 });
          setEquipos((prev) => prev.filter((equipo) => equipo._id !== _id));
          try {
            await axios.post(`${API_BASE}/api/notificaciones`, {
              mensaje: `Se eliminó el equipo "${serie}"`,
            });
            console.log("✅ Notificación registrada correctamente");
          } catch (error) {
            console.error("❌ Error al registrar notificación:", error);
          }
        } else {
          toast.error("Error eliminando. Intenta de nuevo.");
        }
      } catch (error) {
        setError("No se pudo eliminar el equipo. Intenta de nuevo.");
      }
    }
  };

  // === GUARDAR DESDE EXCEL ===
  const guardarEquiposEnBD = async (equiposExcel) => {
    try {
      await Promise.all(
        equiposExcel.map(async (equipo) => {
          await fetch(`${API_BASE}/api/saveequipos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(equipo),
          });
        })
      );
      await fetchEquipos();
      Swal.fire({
        icon: "success",
        title: "Equipos guardados y actualizados",
        text: `${equiposExcel.length} equipos guardados correctamente.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "No se pudo conectar con el servidor.",
      });
    }
  };

  // === IMPORTAR DESDE EXCEL ===
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headersEsperados = [
        "Serie",
        "Modelo",
        "Marca",
        "Área",
        "Estado",
        "Última Mantención",
        "Próxima Mantención",
        "Proveedor",
      ];
      const headers = jsonData[0];
      const headersOk = headersEsperados.every((h, i) => h === headers[i]);
      if (!headersOk) {
        Swal.fire({
          icon: "error",
          title: "Error en el formato del Excel",
          text:
            "Asegúrate de que las columnas sean exactamente: " +
            headersEsperados.join(", "),
        });
        return;
      }

      const filasValidas = jsonData
        .slice(1)
        .filter(
          (fila) =>
            fila &&
            fila.length > 0 &&
            fila.some(
              (celda) =>
                celda !== null &&
                celda !== undefined &&
                String(celda).trim() !== ""
            )
        );

      const nuevosEquipos = filasValidas.map((fila, i) => {
        const serie = fila[0] ? String(fila[0]).trim() : `SIN_SERIE_${i + 1}`;
        const modelo = fila[1] ? String(fila[1]).trim() : "Desconocido";
        const marca = fila[2] ? String(fila[2]).trim() : "Sin Marca";
        const area = fila[3] ? String(fila[3]).trim() : "General";
        const estado = fila[4] ? String(fila[4]).trim() : "activo";
        const umantencion =
          excelDateToDMY(fila[5]) || excelDateToDMY(new Date());
        const pmantencion =
          excelDateToDMY(fila[6]) || addMonthsDMY(umantencion, 6);
        const proveedor = fila[7]
          ? String(fila[7]).trim()
          : "Importado desde Excel";
        return {
          serie,
          modelo,
          marca,
          area,
          estado,
          umantencion,
          pmantencion,
          proveedor,
        };
      });

      setEquipos(nuevosEquipos);
      setFiltered(nuevosEquipos);
      guardarEquiposEnBD(nuevosEquipos);
    };
    reader.readAsArrayBuffer(file);
  };

  // ====== HELPERS EXPORTACIÓN ======
  const buildExportRows = (arr) => {
    if (!arr || arr.length === 0) return { rows: [], headers: [] };

    // Determinar llaves de atributos del conjunto a exportar
    const attrSet = new Set();
    arr.forEach((eq) => {
      const at = eq?.atributos_tecnicos;
      if (at && typeof at === "object") {
        Object.keys(at).forEach((k) => attrSet.add(k));
      }
    });
    const attrKeys = Array.from(attrSet).sort();

    // Construir filas planas
    const rows = arr.map((eq) => {
      const base = {
        ID: eq._id || "",
        Serie: eq.serie || "",
        Modelo: eq.modelo || "",
        Marca: eq.marca || "",
        Área: eq.area || "",
        Estado: eq.estado || "",
        "Última Mantención": eq.umantencion || "",
        "Próxima Mantención": eq.pmantencion || "",
        Proveedor: eq.proveedor || "",
        "Foto (URL)": eq.foto_path ? `${API_BASE}${eq.foto_path}` : "",
        "Foto MIME": eq.foto_mime || "",
        "Foto tamaño (bytes)": eq.foto_size || "",
        Creado: eq.createdAt
          ? new Date(eq.createdAt).toISOString().slice(0, 19).replace("T", " ")
          : "",
        Actualizado: eq.updatedAt
          ? new Date(eq.updatedAt).toISOString().slice(0, 19).replace("T", " ")
          : "",
      };

      const at = eq?.atributos_tecnicos || {};
      attrKeys.forEach((k) => {
        base[`AT:${k}`] = at?.[k] ?? "";
      });

      return base;
    });

    const headers = Object.keys(rows[0] || {});
    return { rows, headers };
  };

  // Trae mantenciones para un set de equipos (por serie)
  const fetchMantencionesFor = async (arr) => {
    const all = await Promise.all(
      arr.map(async (eq) => {
        try {
          const res = await fetch(
            `${API_BASE}/api/mantenimientos/serie/${encodeURIComponent(
              eq.serie
            )}`
          );
          if (!res.ok) return [];
          const js = await res.json();
          // Normaliza cada mantención a fila exportable
          return js.map((m) => ({
            Serie: eq.serie || "",
            Fecha: m.fecha ? new Date(m.fecha).toLocaleDateString() : "",
            Tipo: m.tipo || "",
            Responsable: m.responsable || "",
            Observaciones: m.observaciones || "",
            _id: m._id || "",
            Creado: m.createdAt
              ? new Date(m.createdAt)
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " ")
              : "",
            Actualizado: m.updatedAt
              ? new Date(m.updatedAt)
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " ")
              : "",
          }));
        } catch {
          return [];
        }
      })
    );
    return all.flat();
  };

  const exportWorkbook = (sheets, filenameBase = "equipos_export") => {
    const wb = XLSX.utils.book_new();

    sheets.forEach(({ name, rows }) => {
      if (!rows || rows.length === 0) return;
      const ws = XLSX.utils.json_to_sheet(rows);
      // anchos
      const header = Object.keys(rows[0]);
      const cols = header.map((h) => ({
        wch: Math.max(16, String(h).length + 2),
      }));
      ws["!cols"] = cols;
      XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const filename = `${filenameBase}_${yyyy}${mm}${dd}_${hh}${mi}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // === EXPORTAR: popup con dos opciones (filtrado vs completo)
  // + pregunta si incluir hoja de mantenciones
  const handleExportClick = async () => {
    if (
      (!filtered || filtered.length === 0) &&
      (!equipos || equipos.length === 0)
    ) {
      Swal.fire({
        icon: "info",
        title: "Sin datos",
        text: "No hay equipos para exportar.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Exportar",
      text: "¿Qué te gustaría exportar?",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Exportar con filtros",
      denyButtonText: "Exportar completo",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4d68d5",
      denyButtonColor: "#6d84a5",
    });

    let dataset = [];
    let sheetTag = "";

    if (result.isConfirmed) {
      if (!filtered || filtered.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin resultados",
          text: "No hay registros filtrados.",
        });
        return;
      }
      dataset = filtered;
      sheetTag = "Filtrados";
    } else if (result.isDenied) {
      if (!equipos || equipos.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin datos",
          text: "No hay equipos cargados.",
        });
        return;
      }
      dataset = equipos;
      sheetTag = "Todos";
    } else {
      return;
    }

    // ¿Incluir hoja de mantenciones?
    const inc = await Swal.fire({
      title: "¿Incluir hoja de mantenciones?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, incluir",
      cancelButtonText: "No, sólo equipos",
      confirmButtonColor: "#4d68d5",
    });

    const { rows } = buildExportRows(dataset);
    if (inc.isConfirmed) {
      const mantRows = await fetchMantencionesFor(dataset);
      exportWorkbook(
        [
          { name: `Equipos_${sheetTag}`, rows },
          { name: `Mantenciones_${sheetTag}`, rows: mantRows },
        ],
        `equipos_export_${sheetTag}`
      );
    } else {
      exportWorkbook(
        [{ name: `Equipos_${sheetTag}`, rows }],
        `equipos_export_${sheetTag}`
      );
    }
  };

  // === OTROS ===
  const handleAgregarClick = () => navigate("/CrearEquipos");
  const limpiarFiltros = () =>
    setFilters({ area: "", modelo: "", marca: "", estado: "", search: "" });

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // === RENDER ===
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

              <label>Área:</label>
              <select
                value={filters.area}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, area: e.target.value }))
                }
              >
                <option value="">Todas</option>
                {[...new Set(equipos.map((p) => p.area).filter(Boolean))].map(
                  (a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  )
                )}
              </select>

              <label>Modelo:</label>
              <select
                value={filters.modelo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, modelo: e.target.value }))
                }
              >
                <option value="">Todos</option>
                {[...new Set(equipos.map((p) => p.modelo).filter(Boolean))].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )
                )}
              </select>

              <label>Marca:</label>
              <select
                value={filters.marca}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, marca: e.target.value }))
                }
              >
                <option value="">Todas</option>
                {[...new Set(equipos.map((p) => p.marca).filter(Boolean))].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )
                )}
              </select>

              <label>Estado:</label>
              <select
                value={filters.estado}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="">Todos</option>
                {[...new Set(equipos.map((p) => p.estado).filter(Boolean))].map(
                  (e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  )
                )}
              </select>

              <button className="boton-Eliminar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN EXCEL (importar/plantilla) */}
        <button
          className="boton-Agregar"
          onClick={handleExcelClick}
          title="Importar o descargar plantilla Excel"
          style={{
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0",
            cursor: "pointer",
          }}
        >
          <img
            src={excelLogo}
            alt="Excel opciones"
            style={{ width: "26px", height: "26px" }}
          />
        </button>

        {/* INPUT OCULTO PARA IMPORTAR */}
        <input
          ref={fileInputRef}
          id="excelInput"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleImportExcel}
          style={{ display: "none" }}
        />

        {/* BOTÓN EXPORTAR (elige filtrados o completo y opcional mantenciones) */}
        <button
          className="boton-Agregar"
          onClick={handleExportClick}
          title="Exportar a Excel (filtrado o completo)"
          style={{
            width: "60px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Exportar
        </button>

        {/* BOTÓN AGREGAR */}
        <button className="boton-Agregar" onClick={handleAgregarClick}>
          Agregar
        </button>
      </div>

      {/* TABLA */}
      <div style={{ overflowX: "auto", marginTop: "10px" }}>
        <table className="table-interior">
          <thead>
            <tr>
              <th onClick={() => handleSort("serie")}>Serie</th>
              <th onClick={() => handleSort("modelo")}>Modelo</th>
              <th onClick={() => handleSort("marca")}>Marca</th>
              <th onClick={() => handleSort("area")}>Área</th>
              <th onClick={() => handleSort("estado")}>Estado</th>
              <th>Última Mantención</th>
              <th>Próxima Mantención</th>
              <th onClick={() => handleSort("proveedor")}>Proveedor</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((equipo, index) => (
              <tr key={equipo._id || index}>
                <td>
                  <span
                    onClick={() => navigate(`/equipos/${equipo._id}`)}
                    className="link-serie"
                    title="Ver detalles del equipo"
                  >
                    {equipo.serie}
                  </span>
                </td>
                <td>{equipo.modelo}</td>
                <td>{equipo.marca}</td>
                <td>{equipo.area}</td>
                <td>{equipo.estado}</td>
                <td>{equipo.umantencion}</td>
                <td>{equipo.pmantencion}</td>
                <td>{equipo.proveedor}</td>
                <td>
                  <button
                    className="boton-Agregar"
                    onClick={() => navigate(`/EditarEquipo/${equipo._id}`)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="boton-Eliminar"
                    onClick={() => eliminar(equipo._id, equipo.serie)}
                  >
                    Eliminar
                  </button>
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

export default AdministrarEquipos;
