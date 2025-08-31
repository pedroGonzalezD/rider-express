import styles from "./Footer.module.scss";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      {/* <div className={styles.top}>
        <div className={styles.links}>
          <Link to="/">{t("common.home")}</Link>
          <Link to="/about">{t("common.about")}</Link>
          <Link to="/contact">{t("common.contact")}</Link>
        </div>
        <div className={styles.social}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div> */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} {t("common.companyName")}. {t("common.allRightsReserved")}</p>
      </div>
    </footer>
  );
}