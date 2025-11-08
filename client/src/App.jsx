import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";

// Importación de componentes y páginas
// Banners y layout general
import Layout from "./components/Layout/Layout.jsx";
import Home from "./Pages/Home/Home.jsx";

// Páginas de inicio y registro
import Registro1 from "./Pages/Inicio_Registro/Registro1.jsx"; // Verifica ruta
import Login from "./Pages/Inicio_Registro/Login.jsx";

// Administración de proveedores y equipos
import AdministrarProveedores from "./Pages/Administrar/AdministrarProveedores/AdministrarProveedores.jsx";
import AdministrarEquipos from "./Pages/Administrar/AdministrarEquipos/AdministrarEquipos.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificacionesProvider } from "./context/NotificacionesContext.jsx";

import CrearProveedores from "./Pages/Administrar/AdministrarProveedores/CrearProveedores.jsx";
import CrearEquipos from "./Pages/Administrar/AdministrarEquipos/CrearEquipos.jsx";

// Edición de proveedores y equipos
import EditarProveedores from "./Pages/Administrar/AdministrarProveedores/EditarProveedores.jsx";
import EditarEquipos from "./Pages/Administrar/AdministrarEquipos/EditarEquipos.jsx";

// Respaldos
import Backups from "./Pages/Backups/Backups.jsx"; // Verifica ruta

// Detalle
import DetalleEquipos from "./Pages/Administrar/AdministrarEquipos/DetalleEquipos.jsx";
import DetalleMantenimientos from "./Pages/Administrar/AdministrarMantenimientos/DetalleMantenimientos.jsx";

//Notifcaciones
import Notificaciones from "./Pages/Notificaciones/notificaciones.jsx";
import NotificacionUnica from "./Pages/Notificaciones/notifiacion_unica.jsx";

//Mantenimientos
import AdministrarMantenimientos from "./Pages/Administrar/AdministrarMantenimientos/AdministrarMantenimientos.jsx";
import CrearMantenimientos from "./Pages/Administrar/AdministrarMantenimientos/CrearMantenimientos.jsx";

//Buscador
import ResultadosBusqueda from "./Pages/ResultadosBusqueda/ResultadosBusqueda.jsx";
function App() {
  return (
    // Contextos globales para autenticación y notificaciones
    <AuthProvider>
      <NotificacionesProvider>
        <div className="App">
          {/* Router principal */}
          <BrowserRouter>
            {/* Layout común para todas las páginas */}
            <Layout>
              {/* Definición de rutas */}
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/Registro1" element={<Registro1 />} />

                {/* Página principal / home */}
                <Route path="/home" element={<Home />} />

                {/* Administración */}
                <Route
                  path="/AdministrarProveedores"
                  element={<AdministrarProveedores />}
                />
                <Route
                  path="/AdministrarEquipos"
                  element={<AdministrarEquipos />}
                />

                {/* Crear */}
                <Route
                  path="/CrearProveedores"
                  element={<CrearProveedores />}
                />
                <Route path="/CrearEquipos" element={<CrearEquipos />} />

                {/* Detalles */}
                <Route path="/Equipos/:id" element={<DetalleEquipos />} />
                <Route
                  path="/Mantenimientos/:id"
                  element={<DetalleMantenimientos />}
                />

                {/* Editar */}
                <Route
                  path="/EditarProveedores/:id"
                  element={<EditarProveedores />}
                />
                <Route path="/EditarEquipo/:id" element={<EditarEquipos />} />
                {/* notificaciones */}
                <Route path="/Notificaciones" element={<Notificaciones />} />
                <Route
                  path="/Notificacion/:id"
                  element={<NotificacionUnica />}
                />
                {/* Mantenimientos */}
                <Route
                  path="/AdministrarMantenimientos"
                  element={<AdministrarMantenimientos />}
                />
                <Route
                  path="/CrearMantenimientos"
                  element={<CrearMantenimientos />}
                />
                {/* Busqueda */}
                <Route
                  path="/ResultadosBusqueda"
                  element={<ResultadosBusqueda />}
                />
                {/* Respaldos */}
                <Route path="/Backups" element={<Backups />} />
              </Routes>
            </Layout>
          </BrowserRouter>

          {/* Contenedor para mostrar notificaciones toast */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </NotificacionesProvider>
    </AuthProvider>
  );
}

// Exportar la app principal
export default App;
