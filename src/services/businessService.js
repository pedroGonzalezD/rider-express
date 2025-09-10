import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { uploadImg } from "../utils/cloudinary.js";
import { generateKeywords } from "../utils/keywords.js";
import { normalizeText } from "../utils/keywords.js";

export const PAGE_SIZE = 12;

export async function listBusinesses(lastDoc = null) {
  const constraints = [];
  constraints.push(orderBy("isFeatured", "desc"));
  constraints.push(orderBy("name"));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  constraints.push(limit(PAGE_SIZE));

  const qRef = query(collection(db, "businesses"), ...constraints);
  const snap = await getDocs(qRef);

  return {
    data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

export async function searchByTextOnly(q, lastDoc = null) {
  const qLower = normalizeText(q);

  const constraints = [
    where("keywords", "array-contains", qLower),
    orderBy("isFeatured", "desc"),
    orderBy("name"),
  ];

  if (lastDoc) constraints.push(startAfter(lastDoc));
  constraints.push(limit(PAGE_SIZE));

  const qRef = query(collection(db, "businesses"), ...constraints);
  const snap = await getDocs(qRef);

  return {
    data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

export async function getBusinessesByCategories(categories, lastDoc = null) {
  const constraints = [
    where("categories", "array-contains-any", categories),
    orderBy("isFeatured", "desc"),
    orderBy("name"),
  ];

  if (lastDoc) constraints.push(startAfter(lastDoc));
  constraints.push(limit(PAGE_SIZE));

  const qRef = query(collection(db, "businesses"), ...constraints);
  const snap = await getDocs(qRef);

  return {
    data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

// 🔹 Crear negocio
export async function createBusiness(data) {
  let photoOriginalUrl = data.photoOriginalUrl || data.photoOriginal || null;
  let photoCroppedUrl = data.photoCroppedUrl || data.photoCropped || null;

  if (data.photoOriginal instanceof File) {
    photoOriginalUrl = await uploadImg(data.photoOriginal);
  }
  if (data.photoCropped instanceof File) {
    photoCroppedUrl = await uploadImg(data.photoCropped);
  }

  const businessData = {
    ...data,
    photoOriginalUrl,
    photoCroppedUrl,
    keywords: generateKeywords(data.name),
    createdAt: new Date().toISOString(),
  };

  delete businessData.photoOriginal;
  delete businessData.photoCropped;

  const refDoc = await addDoc(collection(db, "businesses"), businessData);
  return { id: refDoc.id, ...businessData };
}

// 🔹 Actualizar negocio
export async function updateBusiness(id, patch) {
  const updatedPatch = { ...patch };

  if (patch.photoOriginal instanceof File) {
    updatedPatch.photoOriginalUrl = await uploadImg(patch.photoOriginal);
  }
  if (patch.photoCropped instanceof File) {
    updatedPatch.photoCroppedUrl = await uploadImg(patch.photoCropped);
  }

  if (patch.name) {
    updatedPatch.keywords = generateKeywords(patch.name); // <--- actualizar keywords si cambia el nombre
  }

  delete updatedPatch.photoOriginal;
  delete updatedPatch.photoCropped;
  updatedPatch.updatedAt = new Date().toISOString();

  await updateDoc(doc(db, "businesses", id), updatedPatch);
  return updatedPatch;
}

// 🔹 Eliminar negocio
export async function removeBusiness(id) {
  await deleteDoc(doc(db, "businesses", id));
}
