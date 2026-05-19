// src/App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Importaciones de MUI para el estado de carga
import { CircularProgress } from "@mui/material";

// Componentes Globales (Estos NO se hacen lazy porque se necesitan inmediatamente en la pantalla)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PidaChat from "./components/PidaChat";

// ==========================================
// CODE SPLITTING (Carga Perezosa de Páginas)
// ==========================================
const Login = lazy(() => import("./components/Login"));
const Home = lazy(() => import("./pages/Home"));
const QuienesSomos = lazy(() => import("./pages/QuienesSomos"));
const LitigioEstrategico = lazy(() => import("./pages/LitigioEstrategico"));
const Noticias = lazy(() => import("./pages/Noticias"));
const Donaciones = lazy(() => import("./pages/Donaciones"));
const NoticiaDetalle = lazy(() => import("./pages/NoticiaDetalle"));
const ResultadosBusqueda = lazy(() => import("./pages/ResultadosBusqueda"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NotFound = lazy(() => import("./pages/NotFound")); 
const InformesAnuales = lazy(() => import("./pages/InformesAnuales"));
const PaginaPais = lazy(() => import("./pages/PaginaPais"));
const Cursos = lazy(() => import("./pages/Cursos"));
const Equipo = lazy(() => import("./pages/Equipo"));
const ArticulosAcademicos = lazy(() => import("./pages/ArticulosAcademicos"));
const ArticuloDetalle = lazy(() => import("./pages/ArticuloDetalle"));
const Tienda = lazy(() => import("./pages/Tienda"));
const Incidencia = lazy(() => import("./pages/Incidencia"));

// ==========================================
// PANTALLA DE CARGA GENÉRICA
// ==========================================
const FallbackLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white gap-4">
    <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
    <span className="text-main-blue font-bold text-xs uppercase tracking-widest animate-pulse">
      Cargando...
    </span>
  </div>
);

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div className="grow">
        {/* El Suspense envuelve solo el contenido para no desaparecer el Navbar */}
        <Suspense fallback={<FallbackLoader />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      
      {/* PidaChat visible solo en la interfaz pública */}
      <PidaChat />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS (Con Navbar, Footer y PidaChat) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/informes-anuales" element={<InformesAnuales />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/litigio-estrategico" element={<LitigioEstrategico />} />
          
          {/* RUTAS DINÁMICAS POR PAÍS */}
          <Route path="/incidencia-internacional/canada" element={<PaginaPais paisKey="canada" />} />
          <Route path="/incidencia-internacional/mexico" element={<PaginaPais paisKey="mexico" />} />
          <Route path="/incidencia-internacional/guatemala" element={<PaginaPais paisKey="guatemala" />} />
          <Route path="/incidencia-internacional/costa-rica" element={<PaginaPais paisKey="costa-rica" />} />
          <Route path="/incidencia-internacional/colombia" element={<PaginaPais paisKey="colombia" />} />
          
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
          <Route path="/buscar" element={<ResultadosBusqueda />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/articulos-academicos" element={<ArticulosAcademicos />} />
          <Route path="/articulos-academicos/:slug" element={<ArticuloDetalle />} />
          <Route path="/incidencia-internacional" element={<Incidencia />} />
          
          {/* TIENDA */}
          <Route path="/tienda/:slug?" element={<Tienda />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* RUTAS SIN LAYOUT (Sin Navbar ni Footer) */}
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<FallbackLoader />}>
              <Login />
            </Suspense>
          } 
        />
        
        {/* RUTAS PRIVADAS (Panel Administrativo) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<FallbackLoader />}>
                <AdminPanel />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;