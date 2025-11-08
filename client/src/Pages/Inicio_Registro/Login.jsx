import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import styles from "./inicio_registro.module.css";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import  logo from "../../Images/RegiMedical-logo.png";
import  wallpaper from "../../Images/wallpaper.png";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signin, isAuthenticated, errors: signinErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit((data) => {
    signin(data);
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
            {/* Mostrar errores de inicio de sesión si existen */}
            {signinErrors.map((error, i) => (
              <div key={i} className="alert alert-danger">
                {error}
              </div>
            ))}

            <h3>Bienvenido a RegiMedical</h3>

            {/* Formulario */}
            <form onSubmit={onSubmit}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "El correo es obligatorio" })}
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-danger">{errors.email.message}</p>
              )}

              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "La contraseña es obligatoria" })}
                placeholder="Contraseña"
              />
              {errors.password && (
                <p className="text-danger">{errors.password.message}</p>
              )}

              <button className="boton-Agregar" type="submit">
                Iniciar Sesión
              </button>

              <p className={styles["signup-link"]}>
                ¿No tienes cuenta? <Link to="/Registro1">Regístrate aquí</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <div className={styles["login-right"]}>
        <img
          src={wallpaper}
          alt="Promo"
          className={styles["promo-img"]}
        />
      </div>
    </div>
  );
}

export default Login;