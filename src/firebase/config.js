// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBPacnZAdGJeCr-z-dQkin9AqQy59bs1eo",
  authDomain: "iiresodh-web.firebaseapp.com",
  projectId: "iiresodh-web",
  storageBucket: "iiresodh-web.firebasestorage.app",
  messagingSenderId: "943078828913",
  appId: "1:943078828913:web:e430d4c2b369ce060ee4d0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios (Auth, Storage, Functions se mantienen igual)
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Inicializar Firestore con Caché Persistente habilitado para múltiples pestañas
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});