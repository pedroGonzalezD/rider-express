import styles from "./Modal.module.scss";
import { IoMdCloseCircle } from "react-icons/io";

export default function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button onClick={onClose} className={styles.close}><IoMdCloseCircle className={styles.icon}/>
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}