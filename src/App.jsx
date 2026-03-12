// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Componentes Globales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Home from "./pages/Home";
import Noticias from "./pages/Noticias";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import QuienesSomos from "./pages/QuienesSomos"; // <-- NUEVA PÁGINA
import AdminPanel from "./pages/AdminPanel";

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
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
          <Route path="/quienes-somos" element={<QuienesSomos />} /> {/* <-- NUEVA RUTA */}
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;