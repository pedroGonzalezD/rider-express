import React from 'react'
import Nav from '../components/nav/Nav'
import { Outlet } from 'react-router-dom'
import styles from "./MainLayout.module.scss"
import Loader from '../components/Loader/Loader'
import { useLoader } from '../context/LoaderContext'
import Footer from '../components/Footer/Footer'

const MainLayout = () => {
  const {loading} = useLoader()
  return (
    <>
      {loading && <Loader />}
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Logo " />
          </div>
          <Nav/>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet/>
      </main>
      <Footer></Footer>
    </div>
    </>
  )
}

export default MainLayout