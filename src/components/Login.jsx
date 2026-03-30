// src/components/Login.jsx
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Usamos el isotipo a color para la pantalla de login
import isotipo from "../assets/Isotipo-color-512.png";

// Importaciones de MUI
import { Button, Alert } from "@mui/material";

export default function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // FORZAMOS a Google a mostrar el selector de cuentas siempre
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      
      // VALIDACIÓN ESTRICTA DEL CORREO
      if (result.user.email === "webmaster@iiresodh.org") {
        navigate("/admin"); 
      } else {
        // Bloqueo agresivo: Destruimos la sesión generada por Google inmediatamente
        await signOut(auth);
        setError(`Acceso denegado: El correo ${result.user.email} no tiene permisos de administración.`);
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      // Solo mostramos error si el usuario no cerró el popup a propósito
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Hubo un problema al autenticar con Google.");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 z-0 bg-watermark opacity-10 pointer-events-none" aria-hidden="true"></div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full relative z-10 border border-gray-100">
        
        {/* Logo Institucional */}
        <div className="flex justify-center mb-6">
          <img 
            src={isotipo} 
            alt="Isotipo IIRESODH" 
            className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-sm"
          />
        </div>

        {/* Textos y Contexto */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-main-blue mb-3 tracking-tight">
            Acceso Administrativo
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed px-2">
            Para acceder al panel, por favor ingresa exclusivamente con tu cuenta institucional <strong className="text-main-blue font-semibold">@iiresodh.org</strong>
          </p>
        </div>

        {/* Alerta de Error Mejorada con MUI */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 4, borderRadius: '12px', fontWeight: 500 }} 
            className="animate-fade-in-up"
          >
            {error}
          </Alert>
        )}

        {/* Botón de Google Estilo Corporativo con MUI */}
        <Button
          onClick={handleGoogleLogin}
          variant="outlined"
          fullWidth
          aria-label="Ingresar al sistema con cuenta institucional de Google"
          startIcon={
            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: '12px',
            textTransform: 'none',
            color: '#374151',
            borderColor: '#D1D5DB',
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: '"Work Sans", sans-serif',
            '&:hover': {
              backgroundColor: '#F9FAFB',
              borderColor: '#D1D5DB',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          Ingresar con cuenta @iiresodh.org
        </Button>

        {/* Pie de página pequeño */}
        <div className="mt-8 text-center text-xs text-gray-400 font-light">
          <p>Sitio protegido. Todo intento de acceso</p>
          <p>no autorizado será registrado.</p>
        </div>
      </div>
    </main>
  );
}