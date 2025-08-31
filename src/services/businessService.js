// services/businessService.js
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadImg } from "../utils/cloudinary";

export async function listBusinesses() {
  const snap = await getDocs(collection(db, "businesses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBusiness(data) {
  let photoUrl = null;

  if (data.photo instanceof File) {
    photoUrl = await uploadImg(data.photo);
  }

  const businessData = {
    ...data,
    photo: photoUrl || null,
  };

  const refDoc = await addDoc(collection(db, "businesses"), businessData);
  return { id: refDoc.id, ...businessData };
}

export async function updateBusiness(id, patch) {
  if (patch.photo instanceof File) {
    patch.photo = await uploadImg(patch.photo);
  }

  await updateDoc(doc(db, "businesses", id), patch);
}

export async function removeBusiness(id) {
  await deleteDoc(doc(db, "businesses", id));
}
