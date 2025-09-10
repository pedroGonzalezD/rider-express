// BannerModal.jsx
import { useEffect } from "react";
import styles from "./AdBannerModal.module.scss";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

export default function AdBannerModal({ isOpen, onClose, banner, onClick }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !banner) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.bannerContainer} onClick={onClick}>
          <img
            src={getOptimizedImageUrl(banner.photoCroppedUrl, 800)}
            alt={banner.businessName}
            className={styles.image}
          />
          {banner.description && (
            <p className={styles.description}>{banner.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
