import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from "./Nav.module.scss"
import { FaHome } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { IoLogInSharp, IoLogOutSharp } from "react-icons/io5";
import {useTranslation} from "react-i18next"


const Nav = () => {
  const { user, userRole, logout } = useAuth()
  const {t} = useTranslation()
  
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/" className={styles.a}>
          <FaHome className={styles.icon}/>
          {t("common.home")}
          </Link>
        </li>
        <li className={styles.navItem}> 
          {user && userRole === 'admin' && 
          <Link to="/admin" className={styles.a}>
            <RiAdminFill className={styles.icon}/>
            {t("common.admin")}</Link>}
            </li>
        <li className={styles.navItem}>
           {user ? <button onClick={()=>logout()} className={styles.a}>
            <IoLogOutSharp className={styles.icon}/>
            {t("common.logout")} </button> : <Link to="/login" className={styles.a}><IoLogInSharp className={styles.icon} />{t("common.login")}</Link>}</li>
      </ul>
    </nav>
  )
}

export default Nav