// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // DOBLE FILTRO: Validamos el correo ANTES de aprobar el acceso a la ruta
        if (currentUser.email !== "webmaster@iiresodh.org") {
          await signOut(auth); // Lo expulsamos del sistema localmente
          setUser(null);
        } else {
          setUser(currentUser); // Es el administrador, lo dejamos pasar
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-main-blue font-bold tracking-widest uppercase">Verificando Credenciales...</div>;
  
  // Si no hay usuario (o si fue expulsado arriba), redirige de inmediato
  if (!user) return <Navigate to="/login" replace />;

  return children;
}