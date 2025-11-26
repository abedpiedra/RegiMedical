import React, { useState, useEffect, useRef } from "react";
import styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../Images/RegiMedical-logo.png";
import axios from "axios";

// === Hook para retrasar llamadas de búsqueda ===
const useDebounce = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const Header = () => {
  const navigate = useNavigate();

  // === BUSCADOR ===
  const [search, setSearch] = useState("");
  const debouncedQ = useDebounce(search, 300);
  const [sug, setSug] = useState({
    equipos: [],
    proveedores: [],
    mantenimientos: [],
  });
  const [showSug, setShowSug] = useState(false);
  const sugRef = useRef(null);

  // === NOTIFICACIONES ===
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNoti, setMostrarNoti] = useState(false);
  const [nuevas, setNuevas] = useState(0);
  const notiRef = useRef(null);

  // === CARGAR NOTIFICACIONES ===
  const cargarNotificaciones = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/notificaciones/todas"
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setNotificaciones(data.slice(0, 5));
      setNuevas(data.filter((n) => !n.leida).length);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  // === MARCAR UNA NOTIFICACIÓN COMO LEÍDA ===
  const marcarLeida = async (id) => {
    try {
      await axios.put(
        `http://localhost:4000/api/notificaciones/${id}/leida`,
        {
          leida: true,
        }
      );
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // === CLICK EN UNA NOTIFICACIÓN (SIEMPRE VA AL DETALLE DE LA NOTI) ===
  const handleClickNoti = async (n) => {
    try {
      await marcarLeida(n._id);
      await cargarNotificaciones();

      // Navegar SIEMPRE al detalle de la notificación
      navigate(`/notificacion/${n._id}`);

      setMostrarNoti(false);
    } catch (e) {
      console.error(e);
    }
  };

  // === CARGAR NOTIFICACIONES AUTOMÁTICAMENTE ===
  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 5000);
    return () => clearInterval(interval);
  }, []);

  // === CERRAR DROPDOWNS (noti + buscador) AL HACER CLICK FUERA ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target))
        setMostrarNoti(false);
      if (sugRef.current && !sugRef.current.contains(e.target))
        setShowSug(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === CLICK EN CAMPANITA ===
  const handleToggleNoti = () => setMostrarNoti((v) => !v);

  // === LOGOUT ===
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) navigate("/");
      else console.error("Logout failed");
    } catch (error) {
      console.error("Error durante logout:", error);
    }
  };

  // === BUSCADOR: obtener sugerencias desde backend ===
  useEffect(() => {
    const fn = async () => {
      const q = debouncedQ.trim();
      if (q.length < 2) {
        setSug({ equipos: [], proveedores: [], mantenimientos: [] });
        setShowSug(false);
        return;
      }
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/search",
          {
            params: { q, limit: 5 },
          }
        );
        setSug(data || { equipos: [], proveedores: [], mantenimientos: [] });
        setShowSug(true);
      } catch (e) {
        console.error("Error al buscar:", e);
      }
    };
    fn();
  }, [debouncedQ]);

  // === Enviar búsqueda completa (Enter o botón) ===
  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setShowSug(false);
    navigate(`/ResultadosBusqueda?q=${encodeURIComponent(q)}`);
  };

  // === Ir al detalle desde sugerencia ===
  const goToItem = (type, item) => {
    if (type === "equipos") navigate(`/equipos/${item._id}`);
    else if (type === "proveedores") navigate(`/proveedores/${item._id}`);
    else if (type === "mantenimientos")
      navigate(`/mantenimientos/${item._id}`);
    setShowSug(false);
  };

  return (
    <header>
      {/* === BUSCADOR === */}
      <div className={styles["header-search"]} ref={sugRef}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Buscar equipos, proveedores, mantenimientos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() =>
              debouncedQ.trim().length >= 2 && setShowSug(true)
            }
          />
          <button type="submit" title="Buscar">
            🔍
          </button>
        </form>

        {showSug &&
          (sug.equipos.length +
            sug.proveedores.length +
            sug.mantenimientos.length >
            0) && (
            <div className={styles["search-suggest"]}>
              {sug.equipos.length > 0 && (
                <>
                  <div className={styles["search-section"]}>Equipos</div>
                  <ul>
                    {sug.equipos.map((e) => (
                      <li key={e._id} onClick={() => goToItem("equipos", e)}>
                        <b>{e.serie}</b> — {e.marca} {e.modelo} ({e.area})
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {sug.proveedores.length > 0 && (
                <>
                  <div className={styles["search-section"]}>Proveedores</div>
                  <ul>
                    {sug.proveedores.map((p) => (
                      <li
                        key={p._id}
                        onClick={() => goToItem("proveedores", p)}
                      >
                        <b>{p.nombre_empresa}</b> — {p.rut || "sin RUT"}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {sug.mantenimientos.length > 0 && (
                <>
                  <div className={styles["search-section"]}>
                    Mantenimientos
                  </div>
                  <ul>
                    {sug.mantenimientos.map((m) => (
                      <li
                        key={m._id}
                        onClick={() => goToItem("mantenimientos", m)}
                      >
                        <b>{m.serie}</b> — {m.tipo} —{" "}
                        {new Date(m.fecha).toLocaleDateString("es-CL")}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                className={styles["search-see-all"]}
                onClick={() => {
                  setShowSug(false);
                  navigate(
                    `/ResultadosBusqueda?q=${encodeURIComponent(
                      search.trim()
                    )}`
                  );
                }}
              >
                Ver todos los resultados
              </button>
            </div>
          )}
      </div>

      {/* === MENÚ PRINCIPAL === */}
      <ul>
        <li>
          <Link to="/Home">
            <img src={Logo} alt="Logo RegiMedical" />
          </Link>
        </li>
        <li>
          <Link to="/AdministrarProveedores">Proveedores</Link>
        </li>
        <li>
          <Link to="/AdministrarEquipos">Lista de equipos</Link>
        </li>
        <li>
          <Link to="/AdministrarMantenimientos">Mantenimientos</Link>
        </li>

        {/* === CAMPANA DE NOTIFICACIONES === */}
        <li className={styles["noti-container"]} ref={notiRef}>
          <button
            type="button"
            className={styles["boton-noti"]}
            onClick={handleToggleNoti}
            title="Notificaciones"
            aria-haspopup="true"
            aria-expanded={mostrarNoti}
          >
            🔔
            {nuevas > 0 && (
              <span className={styles["noti-badge"]}>{nuevas}</span>
            )}
          </button>

          {mostrarNoti && (
            <div className={styles["noti-dropdown"]} role="menu">
              <h4>Notificaciones</h4>
              {notificaciones.length === 0 ? (
                <p className={styles["noti-vacio"]}>
                  No hay notificaciones
                </p>
              ) : (
                <ul>
                  {notificaciones.map((n) => (
                    <li
                      key={n._id}
                      className={styles["noti-item"]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickNoti(n);
                      }}
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleClickNoti(n)
                      }
                      style={{
                        cursor: "pointer",
                        background: n.leida ? "transparent" : "#eef6ff",
                      }}
                    >
                      <strong style={{ display: "block" }}>
                        {n.titulo || "Notificación"}
                      </strong>
                      <p>{n.mensaje || "Sin detalles"}</p>
                      <span className={styles["noti-fecha"]}>
                        {new Date(n.createdAt).toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                className={styles["ver-todo"]}
                onClick={() => {
                  setMostrarNoti(false);
                  navigate("/notificaciones");
                }}
              >
                Ver todo
              </button>
            </div>
          )}
        </li>

        {/* === BOTÓN LOGOUT === */}
        <button
          onClick={handleLogout}
          className={styles["boton-logout"]}
        >
          Logout
        </button>
      </ul>
    </header>
  );
};

export default Header;