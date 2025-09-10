import { useState } from "react";
import styles from "./BusinessCard.module.scss";
import { buildWhatsAppLink } from "../../utils/formatters";
import { useTranslation } from "react-i18next";
import { getOptimizedImageUrl } from "../../utils/cloudinary";
import { useBusiness } from "../../context/BusinessContext";

const MAX_DESCRIPTION = 120;
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function formatDays(days) {
  if (!days || days.length === 0) return null;
  if (days.length === 7) return "Todos los días";

  const indices = days.map((d) => DAYS.indexOf(d)).sort((a, b) => a - b);
  let ranges = [];
  let start = indices[0];
  let prev = indices[0];

  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== prev + 1) {
      ranges.push([start, prev]);
      start = indices[i];
    }
    prev = indices[i];
  }
  ranges.push([start, prev]);

  return ranges
    .map(([s, e]) => (s === e ? DAYS[s] : `${DAYS[s]} - ${DAYS[e]}`))
    .join(", ");
}

function getBusinessStatus(hours) {
  if (!hours?.open || !hours?.close) return null;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const open = openH * 60 + openM;
  const close = closeH * 60 + closeM;

  if (current >= open && current < close) {
    if (close - current <= 30) return "Pronto a cerrar";
    return "Abierto";
  } else {
    if (open - current > 0 && open - current <= 30) return "Pronto a abrir";
    return "Cerrado";
  }
}

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

export default function BusinessCard({ business }) {
  const { name, address, contact, hours, description, days, hasWhatsApp, photoOriginalUrl, photoCroppedUrl, isFeatured } = business;
  const {categories} = useBusiness()
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const formattedDays = formatDays(days);
  const status = getBusinessStatus(hours);
  const mobile = isMobile();

  const photoUrl = photoCroppedUrl || photoOriginalUrl || null;

  const showNumberInCard = mobile || (hasWhatsApp && !mobile);

  const handleButtonClick = () => {
    if (hasWhatsApp) {
      window.open(buildWhatsAppLink(contact), "_blank");
    } else if (mobile) {
      window.location.href = `tel:${contact}`;
    } else {
      navigator.clipboard.writeText(contact).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  let buttonText = "";
  if (hasWhatsApp) {
    buttonText = "📱 WhatsApp";
  } else if (mobile) {
    buttonText = "📞 Llamar";
  } else {
    buttonText = copied ? "✅ Copiado" : contact;
  }

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        {photoUrl && (
          <img src={getOptimizedImageUrl(photoUrl, 500)} alt={`Portada de ${name}`} />
        )}
      </div>
      {isFeatured && (
        <span className={styles.featured}>⭐ Destacado</span>
      )}
      <div className={styles.info}>
        <h3 className={styles.title}>{name}</h3>
        {!!categories.length && (
  <div className={styles.categories}>
    {categories.map((cat) => {
      if (business.categories.includes(cat.id)) {
        return (
          <span key={cat.id} className={styles.category}>
            {cat.icon} {cat.name}
          </span>
        );
      }
      return null;
    })}
  </div>
)}
        {address && (
          <p className={styles.address}>
            <span className={styles.span}>{t("common.address")}: </span>
            {address}
          </p>
        )}

        {hours?.open && hours?.close && (
          <p>
            <span className={styles.span}>{t("common.schedule")}:</span> {hours.open} - {hours.close}{" "}
            {status && (
              <span
                className={`${styles.status} ${
                  styles[status?.toLowerCase().replace(/\s/g, "")]
                }`}
              >
                {status}
              </span>
            )}
          </p>
        )}

        {description && (
          <p className={styles.description}>
            {description.length > MAX_DESCRIPTION
              ? description.substring(0, MAX_DESCRIPTION) + "..."
              : description}
          </p>
        )}

        {formattedDays && <p>{formattedDays}</p>}

        {contact && showNumberInCard && <p className={styles.phone}>📞 {contact}</p>}

        {contact && (
          <button className={styles.contactBtn} onClick={handleButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </article>
  );
}
