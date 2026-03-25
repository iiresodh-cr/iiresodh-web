// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1D3557] font-bold">Cargando...</div>;
  
  // Doble capa de seguridad: Debe haber usuario y debe ser el autorizado
  if (!user || user.email !== "webmaster@iiresodh.org") {
    
    // Si alguien logró loguearse pero no es el correo autorizado, lo forzamos a salir
    if (user) {
      signOut(auth).catch(console.error);
    }
    
    return <Navigate to="/login" replace />;
  }

  return children;
}