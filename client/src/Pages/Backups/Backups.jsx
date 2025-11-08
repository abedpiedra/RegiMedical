import React, { useState } from "react";
import axios from "axios";

function BackupConfig() {
  // Estado para el intervalo de respaldo y el archivo seleccionado
  const [intervalo, setIntervalo] = useState(
    localStorage.getItem("backupInterval") || 40
  );
  const [file, setFile] = useState(null);

  // Funciones para manejar la configuración de respaldo
  const guardarConfiguracion = async () => {
    try {
      // Validar que el intervalo sea un número positivo
      await axios.post("http://localhost:4000/api/config", {
        intervalo: parseInt(intervalo),
      });
      // Guardar en localStorage
      localStorage.setItem("backupInterval", intervalo);
      alert("Configuración guardada correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al guardar configuración");
    }
  };
  // Función para respaldar ahora
  const respaldarAhora = () => {
    window.open("http://localhost:4000/api/backup");
  };

  // Función para cargar un backup
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Función para cargar el backup seleccionado
  const cargarBackup = async () => {
    if (!file) {
      alert("Selecciona un archivo de respaldo");
      return;
    }
    // Crear un FormData para enviar el archivo
    const formData = new FormData();
    formData.append("backup", file);
    // Enviar el archivo al servidor
    try {
      await axios.post("http://localhost:4000/api/restore", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Base de datos restaurada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al restaurar la base de datos");
    }
  };

  // Renderizar el componente
  return (
    <div className="container-a mt-3">
      <h2>Configuración de Respaldos</h2>
      <div className="mt-3">
        <label>Intervalo de respaldo automático (minutos):</label>
        <input
          type="number"
          value={intervalo}
          onChange={(e) => setIntervalo(e.target.value)}
        />
        <button className="boton-Agregar" onClick={guardarConfiguracion}>
          Guardar Configuración
        </button>
      </div>
      <div className="mt-3">
        <h4>Respaldar ahora:</h4>
        <button className="boton-Agregar" onClick={respaldarAhora}>
          Generar Respaldo
        </button>
      </div>
      <div className="mt-3">
        <h4>Cargar respaldo:</h4>
        <input
          type="file"
          className="form-control w-50"
          onChange={handleFileChange}
        />
        <button className="boton-Agregar" onClick={cargarBackup}>
          Cargar Base de Datos
        </button>
      </div>
    </div>
  );
}

export default BackupConfig;
