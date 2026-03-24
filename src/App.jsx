// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Componentes Globales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Actuales
import Home from "./pages/Home";
import QuienesSomos from "./pages/QuienesSomos";
import LitigioEstrategico from "./pages/LitigioEstrategico";
import Noticias from "./pages/Noticias";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import ResultadosBusqueda from "./pages/ResultadosBusqueda";
import Privacidad from "./pages/Privacidad";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound"; 
import InformesAnuales from "./pages/InformesAnuales";

// Nuevas Páginas
import CooperacionInternacional from "./pages/CooperacionInternacional";
import Colombia from "./pages/Colombia";
import CursosActivos from "./pages/CursosActivos";
import CursosPasados from "./pages/CursosPasados";
import LitigiosActivos from "./pages/LitigiosActivos";
import Equipo from "./pages/Equipo";

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/informes-anuales" element={<InformesAnuales />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/litigio-estrategico" element={<LitigioEstrategico />} />
          <Route path="/cooperacion-internacional" element={<CooperacionInternacional />} />
          <Route path="/colombia" element={<Colombia />} />
          <Route path="/cursos-activos" element={<CursosActivos />} />
          <Route path="/cursos-pasados" element={<CursosPasados />} />
          
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
          <Route path="/buscar" element={<ResultadosBusqueda />} />
          <Route path="/privacidad" element={<Privacidad />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* RUTAS SIN LAYOUT / LOGIN */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTAS PRIVADAS (Protegidas) */}
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        {/* Litigios Activos: Acceso privado a recursos de clientes */}
        <Route path="/litigios-activos" element={<ProtectedRoute><LitigiosActivos /></ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;