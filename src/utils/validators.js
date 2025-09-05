export const isValidTimeRange = (open, close) => {
  if (!open || !close) return false;
  return open < close; 
};
