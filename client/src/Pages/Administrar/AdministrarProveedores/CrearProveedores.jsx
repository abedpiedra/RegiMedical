import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styles from "./AdministrarProveedores.module.css";

function CrearProveedores() {
  // Inicializamos react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate(); // para navegar programáticamente
  const [registerErrors, setRegisterErrors] = useState([]); // para errores al registrar

  // Función que se ejecuta al enviar el formulario
  const onSubmit = async (values) => {
    try {
      // Petición POST para crear nuevo proveedor
      const response = await fetch("http://localhost:4000/api/saveproveedors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        // Si hay error, parseamos respuesta
        const errorData = await response.json();

        // Manejo específico para error de duplicado MongoDB
        if (errorData.code === 11000) {
          setRegisterErrors([
            "El proveedor ya está registrado. Por favor, elige otro.",
          ]);
        } else {
          // Si errorData es arreglo, lo mostramos tal cual, si no, mostramos mensaje o genérico
          setRegisterErrors(
            Array.isArray(errorData)
              ? errorData
              : [errorData.message || "Error desconocido"]
          );
        }
        return; // salimos sin navegar
      }

      // Si todo salió bien, navegamos a lista de proveedores
      navigate("/AdministrarProveedores");
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setRegisterErrors(["Error de conexión con el servidor"]);
    }
  };

  return (
    <div className={`container-a mt-4`}>
      {/* Mostrar errores si existen */}
      {registerErrors.map((error, i) => (
        <div key={i} className="alert alert-danger">
          {error}
        </div>
      ))}

      <h3>Registrar Proveedor</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Nombre Empresa */}
        <label htmlFor="nombre_empresa">Nombre de Empresa</label>
        <input
          id="nombre_empresa"
          type="text"
          {...register("nombre_empresa", { required: "Este campo es requerido" })}
          autoComplete="nombre_empresa"
        />
        {errors.nombre_empresa && (
          <p className="text-danger">{errors.nombre_empresa.message}</p>
        )}

        {/* Dirección */}
        <label htmlFor="direccion">Dirección</label>
        <input
          id="direccion"
          type="text"
          {...register("direccion", { required: "Este campo es requerido" })}
          autoComplete="direccion"
        />
        {errors.direccion && (
          <p className="text-danger">{errors.direccion.message}</p>
        )}

        {/* Teléfono */}
        <label htmlFor="telefono">Teléfono</label>
        <input
          id="telefono"
          type="number"
          {...register("telefono", { required: "Este campo es requerido" })}
          autoComplete="tel"
        />
        {errors.telefono && (
          <p className="text-danger">{errors.telefono.message}</p>
        )}

        {/* Email */}
        <label htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          {...register("email", { required: "Este campo es requerido" })}
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-danger">{errors.email.message}</p>
        )}

        <button type="submit" className="boton-Agregar">
          Agregar
        </button>
      </form>

      <p className="mt-3">
        <button
          className="btn btn-danger"
          onClick={() => navigate("/AdministrarProveedores")}
        >
          Volver a Administrar Proveedores
        </button>
      </p>
    </div>
  );
}

export default CrearProveedores;
