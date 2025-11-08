import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerProveedorPorId } from "../../../api/proveedores.js"; // Importar función para obtener proveedor
import { useForm } from "react-hook-form";
import axios from "axios";
import styles from "./AdministrarProveedores.module.css";

function EditarProveedores() {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el ID del proveedor a editar
  const [proveedorData, setProveedorData] = useState(null);
  const [registerErrors, setRegisterErrors] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    // Cargar datos del proveedor al montar el componente
    obtenerProveedorPorId(id)
      .then((response) => {
        setProveedorData(response.data);
        // Seteamos los valores obtenidos en el formulario
        setValue("nombre_empresa", response.data.nombre_empresa);
        setValue("email", response.data.email);
      })
      .catch((error) => {
        console.error("Error al cargar los datos del Proveedor", error);
        setRegisterErrors(["No se pudo cargar la información del Proveedor."]);
      });
  }, [id, setValue]);

  const onSubmit = async (values) => {
    try {
      // Enviar datos actualizados al backend
      const response = await axios.put(
        `http://localhost:4000/api/proveedors/${id}`,
        values
      );
      console.log("Datos actualizados:", response.data);
      setRegisterErrors(["¡Datos actualizados correctamente!"]);
      navigate("/AdministrarProveedores"); // Navegar de vuelta a la lista
    } catch (error) {
      console.error("Error al actualizar el proveedor", error);
      setRegisterErrors([
        "No se pudo actualizar el proveedor. Intenta nuevamente.",
      ]);
    }
  };

  // Mostrar mensaje de carga mientras no se tengan datos
  if (!proveedorData) {
    return <p>Cargando datos del proveedor...</p>;
  }

  return (
    <div className={`container-a mt-4`}>
      {/* Mostrar mensajes de error o éxito */}
      {registerErrors.map((error, i) => (
        <div key={i} className="alert alert-danger">
          {error}
        </div>
      ))}

      <h3>Editar Proveedor</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="nombre_empresa">Nombre Empresa</label>
        <input
          id="nombre_empresa"
          type="text"
          {...register("nombre_empresa", { required: "Este campo es requerido" })}
          placeholder=""
        />
        {errors.nombre_empresa && (
          <p className="text-danger">{errors.nombre_empresa.message}</p>
        )}

        <label htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          {...register("email", { required: "Este campo es requerido" })}
          placeholder="Ej: xxx@xxx.com"
        />
        {/* Corrección: el error debe revisarse en errors.email, no errors.Correo */}
        {errors.email && (
          <p className="text-danger">{errors.email.message}</p>
        )}

        <button type="submit" className="boton-Agregar">
          Guardar Cambios
        </button>
      </form>

      <p className="mt-3">
        <button
          className="boton-Eliminar"
          onClick={() => navigate("/AdministrarProveedores")}
        >
          Volver a Administrar Proveedores
        </button>
      </p>
    </div>
  );
}

export default EditarProveedores;
