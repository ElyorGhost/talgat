import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAGxhGk9Hx-Ysw-Hv1JWU7s92rxif9QLEQ",
  authDomain: "talgat-instagram.firebaseapp.com",
  projectId: "talgat-instagram",
  storageBucket: "talgat-instagram.appspot.com",
  messagingSenderId: "566869379784",
  appId: "1:566869379784:web:d5854ecc63f1cc0397b3fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
export { firestore, auth, storage, analytics };