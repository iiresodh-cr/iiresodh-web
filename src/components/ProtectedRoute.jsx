// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config"; // Agregamos db
import { doc, getDoc } from "firebase/firestore"; // Agregamos utilidades de Firestore

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Sanitizamos el correo
          const userEmail = currentUser.email.toLowerCase().trim();
          
          // Consultamos a la base de datos
          const adminRef = doc(db, "admins", userEmail);
          
          // Retardo para asegurar la propagación del token de Auth hacia Firestore
          await new Promise(resolve => setTimeout(resolve, 600));

          const adminSnap = await getDoc(adminRef);

          if (!isMounted) return;

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
          if (!isMounted) return;
          // IMPORTANTE: No hacemos signOut(auth) aquí. Si falla por red o permisos temporales,
          // no queremos destruir la sesión del usuario.
          setIsAuthorized(false);
          setErrorMsg("No pudimos conectar con la base de datos para verificar tus credenciales. Verifica tu conexión a internet.");
        }
      } else {
        if (isMounted) setIsAuthorized(false);
      }
      
      if (isMounted) setLoading(false); // Terminó la verificación
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) return (
    <div 
      className="min-h-screen flex items-center justify-center text-main-blue font-bold tracking-widest uppercase"
      role="status"
    >
      Verificando Credenciales...
    </div>
  );
  
  if (errorMsg) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-main-red mb-4">Error de Conexión</h2>
        <p className="text-gray-600 mb-6">{errorMsg}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-main-blue hover:bg-light-blue text-white font-bold py-2 px-6 rounded-xl transition-colors w-full mb-3"
        >
          Reintentar
        </button>
        <button 
          onClick={() => { signOut(auth); window.location.href = '/login'; }} 
          className="text-sm text-gray-500 hover:text-main-blue underline"
        >
          Cerrar sesión y volver al login
        </button>
      </div>
    </div>
  );

  // Si no está autorizado (no hay sesión o no pasó el filtro de Firestore), redirige de inmediato
  if (!isAuthorized) return <Navigate to="/login" replace />;

  return children;
}