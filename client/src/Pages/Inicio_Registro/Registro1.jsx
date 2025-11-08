import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import styles from "./inicio_registro.module.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Images/RegiMedical-logo.png";
import Wallpaper from "../../Images/wallpaper.png";

function Registro1() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    signup(values);
  });

  return (
    <div className={styles["login-page"]}>
      <div className={styles["login-left"]}>
        <div className={styles["login-left-content"]}>
          <img
            className={styles.logo}
            src={logo}
            alt="Logo RegiMedical"
          />
          <div className={styles["login-form-box"]}>
            <h3>Registro - RegiMedical</h3>

            {/* Mostrar errores globales del proceso de registro */}
            {registerErrors.length > 0 && (
              <div className="alert alert-danger">
                {registerErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {/* Formulario de registro */}
            <form onSubmit={onSubmit}>
              {/* Nombre y Apellido en una línea */}
              <div className={styles["row"]}>
                <div className={styles["col"]}>
                  <label htmlFor="name">Nombre</label>
                  <input
                    id="name"
                    type="text"
                    {...register("name", { required: "El nombre es obligatorio" })}
                    placeholder="name"
                  />
                  {errors.name && <p>{errors.name.message}</p>}
                </div>
                <div className={styles["col"]}>
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    type="text"
                    {...register("apellido", { required: "El apellido es obligatorio" })}
                    placeholder="Apellido"
                  />
                  {errors.apellido && <p>{errors.apellido.message}</p>}
                </div>
              </div>

              {/* Correo en una línea sola */}
              <label htmlFor="correo">Correo</label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "El email es obligatorio" })}
                placeholder="Correo"
              />
              {errors.email && <p>{errors.email.message}</p>}

              {/* Compañía y Celular en una línea */}
              <div className={styles["row"]}>
                <div className={styles["col"]}>
                  <label htmlFor="compania">Compañía</label>
                  <input
                    id="compania"
                    type="text"
                    {...register("compania", { required: "La compañía es obligatoria" })}
                    placeholder="Compañía"
                  />
                  {errors.compania && <p>{errors.compania.message}</p>}
                </div>
                <div className={styles["col"]}>
                  <label htmlFor="celular">Celular</label>
                  <input
                    id="celular"
                    type="text"
                    {...register("celular", { required: "El celular es obligatorio" })}
                    placeholder="Celular"
                  />
                  {errors.celular && <p>{errors.celular.message}</p>}
                </div>
              </div>

              {/* Rol en una línea sola */}
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                {...register("rol", { required: "El rol es obligatorio" })}
                defaultValue=""
              >
                <option value="" disabled>Selecciona un rol</option>
                <option value="Empleado">Empleado</option>
                <option value="Dueño">Dueño</option>
              </select>
              {errors.rol && <p>{errors.rol.message}</p>}

              {/* Contraseña en una línea sola */}
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "La contraseña es obligatoria" })}
                placeholder="Contraseña"
              />
              {errors.password && <p>{errors.password.message}</p>}

              <button className="boton-Agregar" type="submit">
                Iniciar Sesión
              </button>
            </form>

            <p className={styles["signup-link"]}>
              ¿Tienes cuenta?{" "}
              <Link to="/">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className={styles["login-right"]}>
        <img
          src={Wallpaper}
          alt="Promo"
          className={styles["promo-img"]}
        />
      </div>
    </div>
  );
}

export default Registro1;