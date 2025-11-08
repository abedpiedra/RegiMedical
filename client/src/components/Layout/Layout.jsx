import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header.jsx'; // Verifica que la ruta sea correcta

const Layout = ({ children }) => {
  const location = useLocation();

  // Opciones para no mostrar el Header
  const noHeaderRoutes = ['/', '/Registro1'];

  // Comprueba si la ruta actual está en la lista
  const shouldShowHeader = !noHeaderRoutes.includes(location.pathname);

  return (
    <div>
      {/* Renderiza Header solo si la ruta actual no está en noHeaderRoutes */}
      {shouldShowHeader && <Header />}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
