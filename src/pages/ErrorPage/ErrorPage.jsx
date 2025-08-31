import { useRouteError, Link } from "react-router-dom";
import styles from "./ErrorPage.module.scss";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className={styles.errorPage}>
      <h1>¡Ups! Algo salió mal</h1>
      {error?.status && <p>Status: {error.status}</p>}
      {error?.statusText && <p>{error.statusText}</p>}
      {error?.message && <p>{error.message}</p>}

      <Link to="/" className={styles.homeLink}>
        Volver al inicio
      </Link>
    </div>
  );
}
