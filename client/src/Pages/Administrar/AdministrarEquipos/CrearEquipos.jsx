import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styles from "./AdministrarEquipos.module.css";
import { proveedoresRequest } from "../../../api/proveedores.js";

function CrearEquipo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();
  const [registerErrors, setRegisterErrors] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // === Estado para atributos técnicos dinámicos ===
  const [atributos, setAtributos] = useState([{ nombre: "", valor: "" }]);

  const handleAddAtributo = () => {
    setAtributos((prev) => [...prev, { nombre: "", valor: "" }]);
  };

  const handleChangeAtributo = (index, field, value) => {
    setAtributos((prev) => {
      const nuevos = [...prev];
      nuevos[index][field] = value;
      return nuevos;
    });
  };

  const handleRemoveAtributo = (index) => {
    setAtributos((prev) => prev.filter((_, i) => i !== index));
  };

  // === Foto ===
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const onFotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
    } else {
      setFotoPreview(null);
    }
  };

  const clearFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    // limpiar input file visualmente
    const input = document.getElementById("foto");
    if (input) input.value = "";
  };

  // === Obtener proveedores ===
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await proveedoresRequest();
        setProveedores(response.data || []);
      } catch (error) {
        setRegisterErrors([
          "Error al obtener los proveedores: " + (error?.message || "desconocido"),
        ]);
      }
    };
    fetchProveedores();
  }, []);

  // === Enviar datos al backend (multipart/form-data) ===
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setRegisterErrors([]);
    setSubmitting(true);

    try {
      // Convertir atributos dinámicos a objeto
      const atributos_tecnicos = {};
      atributos.forEach((a) => {
        if (a.nombre && a.valor) atributos_tecnicos[a.nombre] = a.valor;
      });

      const formData = new FormData();
      // Campos de texto del formulario
      Object.entries(values).forEach(([k, v]) => formData.append(k, v ?? ""));

      // Atributos técnicos como string JSON
      formData.append("atributos_tecnicos", JSON.stringify(atributos_tecnicos));

      // Foto opcional
      if (fotoFile) formData.append("foto", fotoFile);

      const response = await fetch("http://localhost:4000/api/saveequipos", {
        method: "POST",
        body: formData, // NO agregar Content-Type manualmente
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData?.code === 11000) {
          setRegisterErrors(["El número de serie ya está registrado."]);
        } else if (Array.isArray(errorData)) {
          setRegisterErrors(errorData);
        } else {
          setRegisterErrors([errorData?.message || "Error desconocido"]);
        }
        setSubmitting(false);
        return;
      }

      // Opcional: limpiar formulario después de crear
      reset();
      setAtributos([{ nombre: "", valor: "" }]);
      clearFoto();

      navigate("/AdministrarEquipos");
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setRegisterErrors(["Error de conexión con el servidor"]);
      setSubmitting(false);
    }
  };

  // === Render ===
  return (
    <div className="container-a mt-4">
      {registerErrors.map((error, i) => (
        <div key={i} className="alert alert-danger">
          {error}
        </div>
      ))}

      <h3>Registrar Equipo Médico</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* === FILA 1: Datos del equipo === */}
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="serie">Número de Serie</label>
            <input
              id="serie"
              type="text"
              {...register("serie", { required: "Este campo es requerido" })}
              placeholder="Ej: EQ-12345"
            />
            {errors.serie && (
              <p className="text-danger">{errors.serie.message}</p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="modelo">Modelo</label>
            <input
              id="modelo"
              type="text"
              {...register("modelo", { required: "Este campo es requerido" })}
              placeholder="Ej: Philips HeartStart XL"
            />
            {errors.modelo && (
              <p className="text-danger">{errors.modelo.message}</p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="marca">Marca</label>
            <input
              id="marca"
              type="text"
              {...register("marca", { required: "Este campo es requerido" })}
              placeholder="Ej: Philips"
            />
            {errors.marca && (
              <p className="text-danger">{errors.marca.message}</p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="area">Área</label>
            <select
              id="area"
              {...register("area", { required: "Este campo es requerido" })}
            >
              <option value="">Selecciona un área</option>
              <option value="Oftalmología">Oftalmología</option>
              <option value="Cirugía">Cirugía</option>
              <option value="Dermatología">Dermatología</option>
              <option value="Radiología">Radiología</option>
              <option value="Ultrasonido">Ultrasonido</option>
            </select>
            {errors.area && <p className="text-danger">{errors.area.message}</p>}
          </div>
        </div>

        {/* === FILA 2: Mantención y proveedor === */}
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              {...register("estado", { required: "Este campo es requerido" })}
            >
              <option value="">Selecciona un estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="en reparación">En reparación</option>
            </select>
            {errors.estado && (
              <p className="text-danger">{errors.estado.message}</p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="umantencion">Última Mantención</label>
            <input id="umantencion" type="date" {...register("umantencion")} />
          </div>

          <div className={styles.campo}>
            <label htmlFor="pmantencion">Próxima Mantención</label>
            <input id="pmantencion" type="date" {...register("pmantencion")} />
          </div>

          <div className={styles.campo}>
            <label htmlFor="proveedor">Proveedor</label>
            <select
              id="proveedor"
              {...register("proveedor", {
                required: "Este campo es requerido",
                validate: (value) => value !== "" || "Selecciona un proveedor",
              })}
            >
              <option value="">Selecciona un proveedor</option>
              {proveedores.length > 0 ? (
                proveedores.map((prov) => (
                  <option key={prov._id} value={prov.nombre_empresa}>
                    {prov.nombre_empresa}
                  </option>
                ))
              ) : (
                <option disabled>No hay proveedores disponibles</option>
              )}
            </select>
            {errors.proveedor && (
              <p className="text-danger">{errors.proveedor.message}</p>
            )}
          </div>
        </div>

        {/* === FILA 3: Foto del equipo (opcional) === */}
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="foto">Foto del equipo (opcional)</label>
            <input
              id="foto"
              type="file"
              accept="image/*"
              onChange={onFotoChange}
            />
            {fotoPreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  style={{ maxWidth: 220, height: "auto", borderRadius: 8 }}
                />
                <div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary mt-2"
                    onClick={clearFoto}
                  >
                    Quitar foto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === FILA 4: Atributos técnicos dinámicos === */}
        <div className={styles.fila}>
          <h5 className="mt-3">Atributos Técnicos (Opcionales)</h5>
          {atributos.map((attr, index) => (
            <div key={index} className={styles.campo}>
              <input
                type="text"
                placeholder="Nombre (ej: voltaje_nominal)"
                value={attr.nombre}
                onChange={(e) =>
                  handleChangeAtributo(index, "nombre", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Valor (ej: 220V)"
                value={attr.valor}
                onChange={(e) =>
                  handleChangeAtributo(index, "valor", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveAtributo(index)}
                title="Eliminar atributo"
              >
                ❌
              </button>
            </div>
          ))}
          <button
            type="button"
            className="boton-Agregar mt-2"
            onClick={handleAddAtributo}
          >
            + Agregar Atributo
          </button>
        </div>

        {/* === BOTONES === */}
        <div className={styles.btnGroup}>
          <button
            type="submit"
            className="boton-Agregar"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Agregar Equipo"}
          </button>
          <button
            type="button"
            className="boton-Eliminar"
            onClick={() => navigate("/AdministrarEquipos")}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrearEquipo;
