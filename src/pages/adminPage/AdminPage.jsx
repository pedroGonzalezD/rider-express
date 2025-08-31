import styles from "./AdminPanel.module.scss";
import AdminNav from "../../components/adminNav/AdminNav";
import {useTranslation} from "react-i18next"
import {Outlet} from "react-router-dom"

export default function AdminPanel() {
  const {t} = useTranslation()

  return (
    <>
    <div className={styles.container}>
    <h2 className={styles.title}>{t("common.panel")}</h2> 
    <AdminNav/>
      <section className={styles.section}>
        <Outlet/>
      </section>
    </div>
  </>
  );
}