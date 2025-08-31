import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaLock } from "react-icons/fa"
import styles from "./Login.module.scss"

export default function LoginForm() {
  const { signIn, userRole } = useAuth();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState('')
  const { t } = useTranslation();
  

  const navigate = useNavigate();

   const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      return t("error.emptyFields");
    }

    if(password.length < 6){
      return t("error.shortPassword");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t("error.invalidEmail");
    }
    return null; 
  };

  const handleSubmit = async (e) =>{
     e.preventDefault();
    setError("");

     const validationError = validateInputs();
  if (validationError) return setError(validationError);

    const result = await signIn({ email, password, t });
  if (result.error) return setError(result.error);
  };
  
  useEffect(()=>{
    if(userRole === "admin") navigate("/admin");
    else if(userRole === "user") navigate("/");
  }, [userRole, navigate]
)
  
  return (
    <div className={styles.loginContainer}>
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <div className={styles.iconContainer}>
          <FaLock className={styles.icon}/>
      </div>
      <h2 className={styles.loginTitle}>{t("common.logInTitle")}</h2>
      <p className={styles.credentialText}>{t("common.credential")}</p>
      <label htmlFor="email" className={styles.label}>
        {t("common.email")}
        <input
          type="email"
          id="email"
          placeholder={t("common.inputEmail")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
          />
      </label>
      <label htmlFor="password" className={styles.label}>{t("common.password")}
      <input
        type="password"
        id="password"
        placeholder={t("common.inputPassword")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={styles.input}
        />
      </label>
      <button type="submit" className={styles.submit}>{t("common.logIn")}</button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
    </div>
  )
}