// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Componentes Globales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Home from "./pages/Home";
import QuienesSomos from "./pages/QuienesSomos";
import LitigioEstrategico from "./pages/LitigioEstrategico";
import Noticias from "./pages/Noticias";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import ResultadosBusqueda from "./pages/ResultadosBusqueda";
import Privacidad from "./pages/Privacidad";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound"; 

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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
          <Route path="/buscar" element={<ResultadosBusqueda />} />
          <Route path="/privacidad" element={<Privacidad />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;