import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styles from "./AdministrarMantenimientos.module.css";
import { equiposRequest } from "../../../api/equipos.js";
import { mantenimientoRequest } from "../../../api/mantenimientos.js";

function CrearMantenimiento() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const navigate = useNavigate();
  const [registerErrors, setRegisterErrors] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [resumiendo, setResumiendo] = useState(false);
  const [resumenError, setResumenError] = useState("");
  const [resumenExito, setResumenExito] = useState("");

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const dropdownRef = useRef(null);

  // === ESTADO para parámetros operacionales dinámicos ===
  const [parametros, setParametros] = useState([{ nombre: "", valor: "" }]);

  const handleAddParametro = () => {
    setParametros([...parametros, { nombre: "", valor: "" }]);
  };

  const handleChangeParametro = (index, field, value) => {
    const nuevos = [...parametros];
    nuevos[index][field] = value;
    setParametros(nuevos);
  };

  const handleRemoveParametro = (index) => {
    setParametros(parametros.filter((_, i) => i !== index));
  };

  // === Obtener equipos ===
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await equiposRequest();
        setEquipos(response.data);
        setEquiposFiltrados(response.data);
      } catch (error) {
        setRegisterErrors(["Error al obtener los equipos: " + error.message]);
      }
    };
    fetchEquipos();
  }, []);

  // === Cerrar lista al hacer clic fuera ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // === Analizar PDF con IA (Hugging Face) ===
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivoSeleccionado(file);
    setValue("archivo", e.target.files, { shouldValidate: true });

    setResumiendo(true);
    setResumenError("");
    setResumenExito("");

    try {
      const formData = new FormData();
      formData.append("archivo", file);

      const res = await fetch("http://localhost:4000/api/resumirPDF", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("🧠 Respuesta IA:", data);

      if (res.ok && data.resumen) {
        setValue("observaciones", data.resumen);
        setResumenExito("✅ Resumen generado automáticamente con IA (Hugging Face)");
      } else {
        const msg =
          data.message ||
          "⚠️ No se pudo generar un resumen. Verifique el archivo o el servicio de IA.";
        setResumenError(msg);
      }
    } catch (error) {
      console.error("💥 Error al resumir PDF:", error);
      setResumenError("Error de conexión con el servicio de IA.");
    } finally {
      setResumiendo(false);
    }
  };

  // === Enviar mantenimiento ===
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Agregar todos los campos normales
      Object.entries(data).forEach(([k, v]) => {
        if (k !== "archivo") formData.append(k, v || "");
      });

      // Convertir parámetros dinámicos a objeto JSON
      const parametros_operacionales = {};
      parametros.forEach((p) => {
        if (p.nombre && p.valor) parametros_operacionales[p.nombre] = p.valor;
      });

      formData.append(
        "parametros_operacionales",
        JSON.stringify(parametros_operacionales)
      );

      // Adjuntar el archivo (si existe)
      if (archivoSeleccionado) {
        formData.append("archivo", archivoSeleccionado);
      } else if (data.archivo?.[0]) {
        formData.append("archivo", data.archivo[0]);
      }

      console.log("📎 Archivo a enviar:", archivoSeleccionado || data.archivo?.[0]);

      await mantenimientoRequest(formData);
      reset();
      setArchivoSeleccionado(null);
      setParametros([{ nombre: "", valor: "" }]);
      navigate("/AdministrarMantenimientos");
    } catch (error) {
      console.error("Error al enviar mantenimiento:", error);
      const msg =
        error.response?.data?.message || "Error al registrar el mantenimiento";
      setRegisterErrors([msg]);
    }
  };

  return (
    <div className="container-a mt-4">
      {registerErrors.map((error, i) => (
        <div key={i} className="alert alert-danger">
          {error}
        </div>
      ))}

      <h3>Registrar Mantenimiento de Equipo Médico</h3>

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        {/* === FILA 1 === */}
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="fecha">Fecha de Mantenimiento</label>
            <input
              id="fecha"
              type="date"
              {...register("fecha", { required: "Campo obligatorio" })}
            />
            {errors.fecha && (
              <p className="text-danger">{errors.fecha.message}</p>
            )}
          </div>

          {/* === SERIE === */}
          <div
            className={`${styles.campo} ${styles.selectContainer}`}
            ref={dropdownRef}
          >
            <label htmlFor="serie">Equipo / Serie</label>
            <input
              id="serie"
              type="text"
              placeholder="Escribe o selecciona la serie..."
              value={busqueda}
              onChange={(e) => {
                const valor = e.target.value;
                setBusqueda(valor);
                setValue("serie", valor);
                setShowDropdown(true);
                const filtrados = equipos.filter(
                  (eq) =>
                    eq.serie.toLowerCase().includes(valor.toLowerCase()) ||
                    eq.modelo.toLowerCase().includes(valor.toLowerCase())
                );
                setEquiposFiltrados(filtrados);
              }}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            {showDropdown && equiposFiltrados.length > 0 && (
              <ul className={styles.dropdown}>
                {equiposFiltrados.map((eq) => (
                  <li
                    key={eq._id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setBusqueda(eq.serie);
                      setValue("serie", eq.serie);
                      setShowDropdown(false);
                    }}
                  >
                    <strong>{eq.serie}</strong> – {eq.modelo}
                  </li>
                ))}
              </ul>
            )}
            {errors.serie && (
              <p className="text-danger">{errors.serie.message}</p>
            )}
          </div>

          {/* === LUGAR === */}
          <div className={styles.campo}>
            <label htmlFor="lugar">Lugar</label>
            <input
              id="lugar"
              type="text"
              placeholder="Ej: Laboratorio, UCI..."
              {...register("lugar", { required: "Campo obligatorio" })}
            />
            {errors.lugar && (
              <p className="text-danger">{errors.lugar.message}</p>
            )}
          </div>
        </div>

        {/* === FILA 2 === */}
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="tipo">Tipo de Mantenimiento</label>
            <select
              id="tipo"
              {...register("tipo", { required: "Campo obligatorio" })}
            >
              <option value="">Selecciona tipo</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
              <option value="Evaluación">Evaluación</option>
            </select>
            {errors.tipo && (
              <p className="text-danger">{errors.tipo.message}</p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="responsable">Técnico Responsable</label>
            <input
              id="responsable"
              type="text"
              placeholder="Ej: Juan Pérez"
              {...register("responsable", { required: "Campo obligatorio" })}
            />
            {errors.responsable && (
              <p className="text-danger">{errors.responsable.message}</p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="estado">Estado del Equipo</label>
            <select id="estado" {...register("estado")}>
              <option value="Operativo">Operativo</option>
              <option value="En reparación">En reparación</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
          </div>
        </div>

        {/* === FILA 3 === */}
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="archivo">Archivo adjunto (informe PDF)</label>
            <input
              id="archivo"
              type="file"
              accept=".pdf"
              {...register("archivo")}
              onChange={handleFileChange}
            />
            {resumiendo && (
              <p style={{ color: "gray", animation: "pulse 1s infinite" }}>
                🧠 Analizando PDF con IA de Hugging Face...
              </p>
            )}
            {resumenExito && <p className="text-success">{resumenExito}</p>}
            {resumenError && <p className="text-danger">{resumenError}</p>}
          </div>

          <div className={`${styles.campo} ${styles.fullWidth}`}>
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              rows="3"
              placeholder="Se completará automáticamente si se adjunta un PDF..."
              {...register("observaciones")}
            ></textarea>
          </div>
        </div>

        {/* === FILA 4: Parámetros Operacionales === */}
        <div className={styles.fila}>
          <h5 className="mt-3">Parámetros Operacionales (Opcionales)</h5>
          {parametros.map((param, index) => (
            <div key={index} className={styles.campo}>
              <input
                type="text"
                placeholder="Nombre (ej: temperatura)"
                value={param.nombre}
                onChange={(e) =>
                  handleChangeParametro(index, "nombre", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Valor (ej: 37°C)"
                value={param.valor}
                onChange={(e) =>
                  handleChangeParametro(index, "valor", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveParametro(index)}
              >
                ❌
              </button>
            </div>
          ))}
          <button
            type="button"
            className="boton-Agregar mt-2"
            onClick={handleAddParametro}
          >
            + Agregar Parámetro
          </button>
        </div>

        {/* === BOTONES === */}
        <div className={styles.btnGroup}>
          <button type="submit" className="boton-Agregar">
            Registrar Mantenimiento
          </button>
          <button
            type="button"
            className="boton-Eliminar"
            onClick={() => navigate("/AdministrarMantenimientos")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrearMantenimiento;
