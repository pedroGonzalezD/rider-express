export function generateKeywords(name) {
  if (!name) return [];

  const normalized = name
    .normalize("NFD") // descompone acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .toLowerCase()
    .trim();

  const words = normalized.split(/\s+/);
  const keywordsSet = new Set();

  // Prefijos de cada palabra individual
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) {
      keywordsSet.add(word.slice(0, i));
    }
  }

  // Prefijos de la concatenación de todas las palabras
  const concatenated = words.join("");
  for (let i = 1; i <= concatenated.length; i++) {
    keywordsSet.add(concatenated.slice(0, i));
  }

  return Array.from(keywordsSet);
}

export function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function filterBusinessesByText(businesses, searchText) {
  if (!searchText) return businesses;

  const qLower = normalizeText(searchText);

  return businesses.filter((business) => {
    const nameNormalized = normalizeText(business.name || "");
    const addressNormalized = normalizeText(business.address || "");
    const hasKeyword =
      Array.isArray(business.keywords) && business.keywords.includes(qLower);
    const matchesText =
      nameNormalized.includes(qLower) || addressNormalized.includes(qLower);

    return hasKeyword || matchesText;
  });
}

export const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((val) => b.includes(val)) && b.every((val) => a.includes(val));
};
