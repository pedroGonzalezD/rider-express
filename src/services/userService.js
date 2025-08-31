import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function setUserRole(uid, role) {
  try {
    if (!uid || typeof uid !== "string" || !uid.trim()) {
      return { user: null, error: "UID inválido." };
    }
    if (!role || typeof role !== "string" || !role.trim()) {
      return { user: null, error: "Rol inválido." };
    }

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return { user: null, error: "Usuario no encontrado." };
    }

    await setDoc(userRef, { role }, { merge: true });
    const updatedSnap = await getDoc(userRef);
    return { user: updatedSnap.data(), error: null };
  } catch {
    return { user: null, error: "Error al actualizar el rol." };
  }
}

export async function getUser(uid) {
  try {
    if (!uid || typeof uid !== "string" || !uid.trim()) {
      return { user: null, error: "UID inválido." };
    }

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return { user: null, error: "Usuario no encontrado." };
    }

    return { user: snap.data(), error: null };
  } catch {
    return { user: null, error: "Error al obtener usuario." };
  }
}
