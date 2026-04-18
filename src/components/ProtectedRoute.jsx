// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config"; // Agregamos db
import { doc, getDoc } from "firebase/firestore"; // Agregamos utilidades de Firestore

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Sanitizamos el correo
          const userEmail = currentUser.email.toLowerCase().trim();
          
          // Consultamos a la base de datos (la misma verificación que en Login)
          const adminRef = doc(db, "admins", userEmail);
          const adminSnap = await getDoc(adminRef);

          if (adminSnap.exists()) {
            const adminData = adminSnap.data();
            
            // Verificamos si tiene el estatus 'activo'
            if (adminData.activo === true || adminData.active === true) {
              setIsAuthorized(true); // Es administrador y está activo, lo dejamos pasar
            } else {
              console.warn("ProtectedRoute: Usuario inactivo. Expulsando.");
              await signOut(auth);
              setIsAuthorized(false);
            }
          } else {
            console.warn("ProtectedRoute: Usuario no existe en colección admins. Expulsando.");
            await signOut(auth); // Lo expulsamos del sistema localmente
            setIsAuthorized(false);
          }
        } catch (error) {
          console.error("Error al verificar credenciales en la base de datos:", error);
          await signOut(auth);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
      
      setLoading(false); // Terminó la verificación
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div 
      className="min-h-screen flex items-center justify-center text-main-blue font-bold tracking-widest uppercase"
      role="status"
    >
      Verificando Credenciales...
    </div>
  );
  
  // Si no está autorizado (no hay sesión o no pasó el filtro de Firestore), redirige de inmediato
  if (!isAuthorized) return <Navigate to="/login" replace />;

  return children;
}