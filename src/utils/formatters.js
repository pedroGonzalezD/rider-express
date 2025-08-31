export const buildWhatsAppLink = (rawPhone, text = "") => {
  const digits = String(rawPhone).replace(/\D/g, "");
  const msg = encodeURIComponent(text);
  return `https://wa.me/${digits}${msg ? `?text=${msg}` : ""}`;
};
