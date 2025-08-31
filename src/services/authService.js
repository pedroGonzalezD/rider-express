import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";

function getErrorMessage(error, t) {
  console.log(error.code);
  switch (error.code) {
    case "auth/invalid-credential":
      return t("error.invalidCredential");
    case "auth/user-not-found":
      return t("error.userNotFound");
    case "auth/missing-email":
      return t("error.missingEmail");
    case "auth/missing-password":
      return t("error.missingPassword");
    case "auth/too-many-requests":
      return t("error.tooManyRequests");
    default:
      return t("error.authError");
  }
}

export async function signIn({ email, password, t }) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getErrorMessage(error, t) };
  }
}

export async function signOut(t) {
  try {
    await fbSignOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, t) };
  }
}

export async function getSession() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve({ user: user || null });
    });
  });
}
