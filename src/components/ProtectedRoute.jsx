// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
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
  
  // AQUÍ ESTÁ EL CAMBIO: Asegúrate de que tenga el "/" antes de login y la palabra "replace"
  if (!user) return <Navigate to="/login" replace />;

  return children;
}