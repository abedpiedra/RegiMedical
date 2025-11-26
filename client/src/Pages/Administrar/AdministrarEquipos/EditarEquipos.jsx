import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import styles from "./AdministrarEquipos.module.css";
import { proveedoresRequest } from "../../../api/proveedores.js";
import { obtenerEquipoPorId } from "../../../api/equipos.js"; // ⚙️ tu endpoint GET
import { toast } from "react-toastify";

function EditarEquipo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [registerErrors, setRegisterErrors] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [equipoData, setEquipoData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // 🔹 Función para formatear fecha a "DD-MM-YY"
  const formatearFecha = (fecha) => {
    if (!fecha) return ""; // si viene null, undefined o vacío
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return ""; // si no es una fecha válida
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2); // Solo los últimos dos dígitos del año
    return `${dd}-${mm}-${yy}`;
  };

  // 🔹 Función para convertir el formato "DD-MM-YY" a "YYYY-MM-DD" para el backend
  const convertirFechaParaBackend = (fecha) => {
    if (!fecha) return "";
    const [dd, mm, yy] = fecha.split("-");
    return `20${yy}-${mm}-${dd}`; // Asume que el año es del tipo 20YY
  };

  // Cargar datos del equipo
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await obtenerEquipoPorId(id);
        const equipo = res.data;
        setEquipoData(equipo);

        // Prellenar valores en formulario
        Object.keys(equipo).forEach((key) => {
          if (equipo[key] !== undefined) {
            if (key === "umantencion" || key === "pmantencion") {
              // Verificamos si la fecha es válida y la formateamos correctamente
              const fecha = formatearFecha(equipo[key]);
              setValue(key, fecha || ""); // Si la fecha no es válida, dejamos un valor vacío
            } else if (key === "estado") {
              setValue(key, equipo[key] || "activo"); // Asignar valor por defecto si está vacío
            } else if (key === "atributos_tecnicos") {
              // Aquí tratamos los atributos técnicos
              const atributos = equipo[key] || {}; // Asegurarnos de que no sea nulo
              Object.keys(atributos).forEach((atributo) => {
                setValue(`atributos_tecnicos.${atributo}`, atributos[atributo]);
              });
            } else {
              setValue(key, equipo[key]);
            }
          }
        });
      } catch (error) {
        console.error("Error al cargar equipo:", error);
        setRegisterErrors(["No se pudo cargar la información del equipo."]);
      }
    };
    cargarDatos();
  }, [id, setValue]);

  // Cargar proveedores
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await proveedoresRequest();
        setProveedores(res.data);
      } catch (error) {
        setRegisterErrors(["Error al obtener los proveedores."]);
      }
    };
    fetchProveedores();
  }, []);

  // Guardar cambios
  const onSubmit = async (values) => {
    try {
      // Convertir fechas a formato "YYYY-MM-DD" antes de enviarlas al backend
      const valoresConvertidos = {
        ...values,
        umantencion: convertirFechaParaBackend(values.umantencion),
        pmantencion: convertirFechaParaBackend(values.pmantencion),
      };

      await axios.put(`http://localhost:4000/api/equipos/${id}`, valoresConvertidos);
      toast.success("Equipo actualizado correctamente");

      await axios.post("http://localhost:4000/api/notificaciones", {
        mensaje: `🛠️ El equipo "${values.marca} ${values.modelo}" (serie ${values.serie}) fue modificado el ${new Date().toLocaleDateString("es-CL")}.`,
        rutaDestino: `/equipos/${id}`,
        tipo: "general", // opcional
        alertKey: `edit:${id}:${Date.now()}`, // opcional (si no quieres dedupe aquí)
      });

      setTimeout(() => navigate("/AdministrarEquipos"), 1200);
    } catch (e) {
      console.error(e);
      toast.error("❌ Error al actualizar el equipo.");
    }
  };

  if (!equipoData) return <p>Cargando datos del equipo...</p>;

  return (
    <div className="container-a mt-4">
      {registerErrors.map((msg, i) => (
        <div key={i} className="alert alert-danger">
          {msg}
        </div>
      ))}

      <h3>Editar Equipo Médico</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
        {/* === Fila 1: Datos principales === */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label htmlFor="serie">Número de Serie (no editable)</label>
            <input id="serie" type="text" readOnly {...register("serie")} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="modelo">Modelo</label>
            <input
              id="modelo"
              type="text"
              {...register("modelo", { required: "Campo requerido" })}
            />
            {errors.modelo && (
              <p className="text-danger">{errors.modelo.message}</p>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="marca">Marca</label>
            <input
              id="marca"
              type="text"
              {...register("marca", { required: "Campo requerido" })}
            />
            {errors.marca && (
              <p className="text-danger">{errors.marca.message}</p>
            )}
          </div>
        </div>

        {/* === Fila 2: Estado, área y mantenciones === */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label htmlFor="area">Área</label>
            <select
              id="area"
              {...register("area", { required: "Campo requerido" })}
            >
              <option value="">Selecciona un área</option>
              <option value="Oftalmología">Oftalmología</option>
              <option value="Cirugía">Cirugía</option>
              <option value="Dermatología">Dermatología</option>
            </select>
            {errors.area && (
              <p className="text-danger">{errors.area.message}</p>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              {...register("estado", { required: "Campo requerido" })}
            >
              <option value="">Selecciona un estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="en reparacion">en reparacion</option>
            </select>
            {errors.estado && (
              <p className="text-danger">{errors.estado.message}</p>
            )}
          </div>
        </div>

        {/* === Fila 3: Proveedor === */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label htmlFor="proveedor">Proveedor</label>
            <select
              id="proveedor"
              {...register("proveedor", {
                required: "Selecciona un proveedor",
              })}
            >
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov._id} value={prov.nombre_empresa}>
                  {prov.nombre_empresa}
                </option>
              ))}
            </select>
            {errors.proveedor && (
              <p className="text-danger">{errors.proveedor.message}</p>
            )}
          </div>
        </div>

        {/* === Fila 4: Mantenciones === */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label htmlFor="umantencion">Última Mantención</label>
            <input
              id="umantencion"
              type="date"
              {...register("umantencion", { required: "Campo requerido" })}
            />
            {errors.umantencion && (
              <p className="text-danger">{errors.umantencion.message}</p>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="pmantencion">Próxima Mantención</label>
            <input
              id="pmantencion"
              type="date"
              {...register("pmantencion", { required: "Campo requerido" })}
            />
            {errors.pmantencion && (
              <p className="text-danger">{errors.pmantencion.message}</p>
            )}
          </div>
        </div>

        {/* === Atributos Técnicos (si existen) === */}
        {equipoData?.atributos_tecnicos &&
          Object.keys(equipoData.atributos_tecnicos).map((atributo, index) => (
            <div key={index} className={styles.formRow}>
              <div className={styles.formField}>
                <label htmlFor={`atributos_tecnicos.${atributo}`}>
                  {atributo.charAt(0).toUpperCase() + atributo.slice(1)}
                </label>
                <input
                  id={`atributos_tecnicos.${atributo}`}
                  type="text"
                  {...register(`atributos_tecnicos.${atributo}`)}
                />
              </div>
            </div>
          ))}

        {/* === Botones === */}
        <div className={styles.buttonGroup}>
          <button type="submit" className="boton-Agregar">
            Guardar Cambios
          </button>
          <button
            type="button"
            className="boton-Eliminar"
            onClick={() => navigate("/AdministrarEquipos")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarEquipo;
