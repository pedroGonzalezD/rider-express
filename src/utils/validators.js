export const isValidTimeRange = (open, close) => {
  if (!open || !close) return false;
  return open < close; // simple; si necesitas ranges cruzando medianoche, se mejora luego
};
