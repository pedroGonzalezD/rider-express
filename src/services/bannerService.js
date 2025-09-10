// services/bannerService.js
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { uploadImg } from "../utils/cloudinary.js";

export async function listBanners() {
  const snap = await getDocs(
    collection(db, "banners"),
    orderBy("createdAt", "desc")
  );

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createBanner(data) {
  let photoOriginalUrl = data.photoOriginalUrl || data.photoOriginal || null;
  let photoCroppedUrl = data.photoCroppedUrl || data.photoCropped || null;

  if (data.photoOriginal instanceof File) {
    photoOriginalUrl = await uploadImg(data.photoOriginal);
  }
  if (data.photoCropped instanceof File) {
    photoCroppedUrl = await uploadImg(data.photoCropped);
  }

  const bannerData = {
    title: data.title || "",
    photoOriginalUrl,
    photoCroppedUrl,
    expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
    createdAt: new Date().toISOString(),
  };

  delete bannerData.photoOriginal;
  delete bannerData.photoCropped;

  const ref = await addDoc(collection(db, "banners"), bannerData);
  return { id: ref.id, ...bannerData };
}

export async function updateBanner(id, patch) {
  const updatedPatch = { ...patch };

  if (patch.photoOriginal instanceof File) {
    updatedPatch.photoOriginalUrl = await uploadImg(patch.photoOriginal);
  }
  if (patch.photoCropped instanceof File) {
    updatedPatch.photoCroppedUrl = await uploadImg(patch.photoCropped);
  }

  delete updatedPatch.photoOriginal;
  delete updatedPatch.photoCropped;

  if (updatedPatch.expiresAt) {
    updatedPatch.expiresAt = new Date(updatedPatch.expiresAt).toISOString();
  }

  await updateDoc(doc(db, "banners", id), updatedPatch);
  return updatedPatch;
}

export async function removeBanner(id) {
  await deleteDoc(doc(db, "banners", id));
}
