import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDo3qtwgrqIx3uLSMBmphitKfFki2oos-s",
  authDomain: "monitoreoagricolaapp-26883.firebaseapp.com",
  projectId: "monitoreoagricolaapp-26883",
  storageBucket: "monitoreoagricolaapp-26883.firebasestorage.app",
  messagingSenderId: "910011248520",
  appId: "1:910011248520:web:41aaa15a5176133cbe943d",
  measurementId: "G-G1BW5T30QF"
};


// Inicializa Firebase
export const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás en la aplicación
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);