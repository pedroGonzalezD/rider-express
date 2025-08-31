import {NavLink} from "react-router-dom"
import {useTranslation} from "react-i18next"
import styles from "./AdminNav.module.scss"

const AdminNav = () => {
  const {t} = useTranslation()

  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <NavLink to="business" className={({ isActive }) => isActive ? `${styles.isActive} ${styles.a}` : styles.a}>
            {t("common.business")}
            </NavLink>
            </li>
        <li className={styles.li}>
          <NavLink to="categories" className={({ isActive }) => isActive ? `${styles.isActive} ${styles.a}` : styles.a}>
            {t("common.categories")}
            </NavLink>
            </li>
        <li className={styles.li}>
          <NavLink to="discounts" className={({ isActive }) => isActive ? `${styles.isActive} ${styles.a}` : styles.a} >
            {t("common.discounts")
            }</NavLink>
            </li>
      </ul>
    </nav>
  )
}

export default AdminNav