import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdministrarProveedores.module.css"; // estilos específicos del componente
import { proveedoresRequest, deleteProveedor } from "../../../api/proveedores.js"; // funciones para API
import Swal from "sweetalert2"; // librería para alertas bonitas
import { toast } from "react-toastify"; // notificaciones toast

const AdministrarProveedores = () => {
  const [proveedores, setProveedores] = useState([]); // estado para almacenar lista de proveedores
  const [error, setError] = useState(""); // estado para errores
  const navigate = useNavigate(); // hook para navegar entre rutas

  // Función que navega a la página para crear un nuevo proveedor
  const handleAgregarClick = () => navigate("/CrearProveedores");

  // Función para eliminar un proveedor con confirmación
  const eliminar = async (_id, apellido, nombre) => {
    // Muestra ventana modal de confirmación
    const { isConfirmed } = await Swal.fire({
      title: "Confirmación",
      text: `¿Eliminar "${apellido} ${nombre}"?`, // mensaje personalizado
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4d68d5",
      cancelButtonColor: "#6d84a5",
      confirmButtonText: "Sí, eliminar",
    });

    if (isConfirmed) {
      try {
        // Llamada API para eliminar proveedor
        const { data } = await deleteProveedor(_id);
        if (data.status === "ok") {
          // Si fue exitoso, mostrar notificación y actualizar estado para remover el proveedor
          toast("Proveedor eliminado correctamente", { autoClose: 2000 });
          setProveedores((prevProveedores) =>
            prevProveedores.filter((proveedor) => proveedor._id !== _id)
          );
        } else {
          // Si hubo error en backend, mostrar error en toast
          toast.error("Error eliminando. Intenta de nuevo.");
        }
      } catch (error) {
        // Error en petición o red, setea mensaje de error para mostrar en UI
        setError("No se pudo eliminar al proveedor. Intenta de nuevo.");
      }
    }
  };

  // Efecto que se ejecuta una vez al montar el componente para cargar proveedores
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        // Llamada a API para obtener proveedores
        const { data } = await proveedoresRequest();
        setProveedores(data); // guarda los proveedores en estado
      } catch (error) {
        setError(error.message); // guarda error para mostrar
      }
    };
    fetchProveedores();
  }, []);

  return (
    <div className={`container-a mt-4`}>
      <div className="">
        {/* Botón para agregar nuevo proveedor */}
        <button className="boton-Agregar" onClick={handleAgregarClick}>
          Agregar
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="table-responsive mt-3">
        <table className="table-interior">
          <thead className="">
            <tr>
              <th>N</th>
              <th>Nombre de Empresa</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>
          <tbody>
            {/* Mapeo de proveedores para mostrar fila por fila */}
            {proveedores.map((proveedor, index) => (
              <tr key={proveedor._id || index}>
                <td>{index + 1}</td>
                <td>{proveedor.nombre_empresa}</td>
                <td>{proveedor.direccion}</td>
                <td>{proveedor.telefono}</td>
                <td>{proveedor.email}</td>
                <td>
                  {/* Botón para navegar a edición de proveedor */}
                  <button
                    className="boton-Agregar"
                    onClick={() => navigate(`/EditarProveedores/${proveedor._id}`)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  {/* Botón para eliminar proveedor con confirmación */}
                  <button
                    className="boton-Eliminar"
                    onClick={() =>
                      eliminar(proveedor._id, proveedor.nombre_empresa, proveedor.email)
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdministrarProveedores;
