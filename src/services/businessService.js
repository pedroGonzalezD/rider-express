// services/businessService.js
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { uploadImg } from "../utils/cloudinary.js";

export async function listBusinesses() {
  const snap = await getDocs(collection(db, "businesses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBusiness(data) {
  // Permitimos que vengan Files o URLs ya existentes
  let photoOriginalUrl = data.photoOriginalUrl || data.photoOriginal || null;
  let photoCroppedUrl = data.photoCroppedUrl || data.photoCropped || null;

  if (data.photoOriginal instanceof File) {
    photoOriginalUrl = await uploadImg(data.photoOriginal);
  }
  if (data.photoCropped instanceof File) {
    photoCroppedUrl = await uploadImg(data.photoCropped);
  }

  // Limpiamos campos temporales
  const { photoOriginal, photoCropped, ...rest } = data;

  const businessData = {
    ...rest,
    photoOriginalUrl: photoOriginalUrl || null,
    photoCroppedUrl: photoCroppedUrl || null,
  };

  const refDoc = await addDoc(collection(db, "businesses"), businessData);
  return { id: refDoc.id, ...businessData };
}

export async function updateBusiness(id, patch) {
  const updatedPatch = { ...patch };

  if (patch.photoOriginal instanceof File) {
    updatedPatch.photoOriginalUrl = await uploadImg(patch.photoOriginal);
  }
  if (patch.photoCropped instanceof File) {
    updatedPatch.photoCroppedUrl = await uploadImg(patch.photoCropped);
  }

  // No guardar los File crudos
  delete updatedPatch.photoOriginal;
  delete updatedPatch.photoCropped;

  await updateDoc(doc(db, "businesses", id), updatedPatch);
}

export async function removeBusiness(id) {
  await deleteDoc(doc(db, "businesses", id));
}
