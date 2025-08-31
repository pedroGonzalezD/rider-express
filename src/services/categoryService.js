// services/categoryService.js
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export async function listCategories() {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCategory(name, icon) {
  const ref = await addDoc(collection(db, "categories"), { name, icon });
  return { id: ref.id, name, icon };
}

export async function removeCategory(id) {
  await deleteDoc(doc(db, "categories", id));
  return true;
}

export async function editCategory(id, patch) {
  await updateDoc(doc(db, "categories", id), patch);
  return true;
}
