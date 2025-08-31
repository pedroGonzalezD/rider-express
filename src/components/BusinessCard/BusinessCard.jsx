import styles from './BusinessCard.module.scss';
import { buildWhatsAppLink } from '../../utils/formatters';
import {useTranslation} from "react-i18next"
import { getOptimizedImageUrl } from '../../utils/cloudinary';

export default function BusinessCard({ business }) {
  const { name, categories, address, contact, hours, photo } = business;
  const {t} = useTranslation()

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        {photo && 
          <img src={getOptimizedImageUrl(photo, 500)} alt={`Portada de ${name}`} />}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.categories}>{categories.join(", ")}</p>
        <p className={styles.address}><span className={styles.span}>{t("common.address")}: </span>{address}</p>
        <p><span className={styles.span}>{t("common.schedule")}:</span> {hours.open} - {hours.close}</p>
        {contact && (
          <a
            href={buildWhatsAppLink(contact)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsapp}
          >
           📱{t("common.whatsApp")}
          </a>
        )}
      </div>
    </article>
  );
}
