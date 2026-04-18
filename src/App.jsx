// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Componentes Globales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PidaChat from "./components/PidaChat";

// Páginas Actuales
import Home from "./pages/Home";
import QuienesSomos from "./pages/QuienesSomos";
import LitigioEstrategico from "./pages/LitigioEstrategico";
import Noticias from "./pages/Noticias";
import Donaciones from "./pages/Donaciones";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import ResultadosBusqueda from "./pages/ResultadosBusqueda";
import Privacidad from "./pages/Privacidad";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound"; 
import InformesAnuales from "./pages/InformesAnuales";

// Nuevas Páginas y Componente Dinámico
import PaginaPais from "./pages/PaginaPais";
import ImpactoInternacional from "./pages/ImpactoInternacional";
import Cursos from "./pages/Cursos";
import Equipo from "./pages/Equipo";
import ArticulosAcademicos from "./pages/ArticulosAcademicos";
import ArticuloDetalle from "./pages/ArticuloDetalle";
import Tienda from "./pages/Tienda";
import Incidencia from "./pages/Incidencia";

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div className="grow">
        <Outlet />
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
          <Route path="/impacto-internacional" element={<ImpactoInternacional />} />
          
          {/* RUTAS DINÁMICAS POR PAÍS */}
          <Route path="/canada" element={<PaginaPais paisKey="canada" />} />
          <Route path="/mexico" element={<PaginaPais paisKey="mexico" />} />
          <Route path="/guatemala" element={<PaginaPais paisKey="guatemala" />} />
          <Route path="/costa-rica" element={<PaginaPais paisKey="costa-rica" />} />
          <Route path="/colombia" element={<PaginaPais paisKey="colombia" />} />
          
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
          <Route path="/buscar" element={<ResultadosBusqueda />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/articulos-academicos" element={<ArticulosAcademicos />} />
          <Route path="/articulos-academicos/:slug" element={<ArticuloDetalle />} />
          <Route path="/incidencia" element={<Incidencia />} />
          
          {/* TIENDA */}
          <Route path="/tienda/:slug?" element={<Tienda />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* RUTAS SIN LAYOUT (Sin Navbar ni Footer) */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTAS PRIVADAS (Panel Administrativo) */}
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;