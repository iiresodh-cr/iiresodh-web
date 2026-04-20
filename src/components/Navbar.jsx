// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Logo Oficial_IIRESODH-224.webp"; 

// Importaciones de MUI para mejorar la UX
import { Paper, InputBase, IconButton, Tooltip } from '@mui/material';

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  
  // HOOK DE TRADUCCIÓN
  const { i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsMobileMenuOpen(false);
    }
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // Función para cambiar el idioma
  const cambiarIdioma = (lng) => {
    if(i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lng);
    }
  };

  // Saber qué idioma está activo actualmente
  const idiomaActual = i18n?.language?.substring(0, 2) || 'es';

  return (
    <header className="w-full shadow-sm relative z-50 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-stretch">
        
        {/* LOGO E INDICADOR MÓVIL */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 md:pr-8 bg-white relative z-20">
          <Link to="/" className="flex items-center" aria-label="Ir a la página de inicio de IIRESODH">
            <img src={logo} alt="Logotipo oficial de IIRESODH" className="h-14 md:h-24 lg:h-28 w-auto object-contain" />
          </Link>
          
          {/* Botón Hamburguesa oculto en md (768px) en adelante */}
          <IconButton 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            sx={{ 
              display: { xs: 'inline-flex', md: 'none' }, 
              p: 1, 
              color: '#1D3557', // main-blue
              '&:hover': { color: '#B92F32', bgcolor: 'rgba(185, 47, 50, 0.04)' } // main-red
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </IconButton>
        </div>

        {/* CONTENIDO DERECHA */}
        <div 
          id="mobile-menu"
          className={`flex-col grow ${isMobileMenuOpen ? 'flex absolute top-full left-0 w-full bg-white shadow-xl z-10' : 'hidden md:flex'}`}
        >
          
          {/* BUSCADOR, REDES Y SELECTOR DE IDIOMA */}
          <div className="bg-white px-6 py-4 flex flex-col md:flex-row justify-between md:justify-end items-center gap-6">
            
            {/* Buscador */}
            <div className="w-full md:w-auto md:flex-1 max-w-md md:mr-auto">
              <Paper
                component="form"
                onSubmit={handleSearch}
                elevation={0}
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  borderRadius: 50,
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  transition: 'all 0.2s ease-in-out',
                  '&:focus-within': {
                    backgroundColor: '#FFFFFF',
                    borderColor: '#457B9D',
                    boxShadow: '0 0 0 2px rgba(69, 123, 157, 0.2)',
                  }
                }}
              >
                <InputBase
                  sx={{ ml: 2, flex: 1, color: '#1D3557', fontSize: '0.875rem', fontFamily: '"Work Sans", sans-serif' }}
                  placeholder="Buscar noticias, áreas, información..."
                  inputProps={{ 'aria-label': 'Buscar noticias o información en el sitio' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IconButton 
                  type="submit" 
                  aria-label="Ejecutar búsqueda"
                  sx={{ 
                    p: '6px', 
                    bgcolor: '#457B9D', 
                    color: 'white', 
                    '&:hover': { bgcolor: '#1D3557' }, 
                    width: 32, 
                    height: 32,
                    mr: '2px'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </IconButton>
              </Paper>
            </div>

            {/* Contenedor Redes y Selector de Idioma */}
            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-end shrink-0">
              
              {/* Selector de Idiomas */}
              <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-inner">
                <button 
                  onClick={() => cambiarIdioma('es')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${idiomaActual === 'es' ? 'bg-white text-main-blue shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  aria-label="Cambiar a Español"
                >
                  ES
                </button>
                <button 
                  onClick={() => cambiarIdioma('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${idiomaActual === 'en' ? 'bg-white text-main-blue shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  aria-label="Switch to English"
                >
                  EN
                </button>
                <button 
                  onClick={() => cambiarIdioma('fr')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${idiomaActual === 'fr' ? 'bg-white text-main-blue shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  aria-label="Passer en Français"
                >
                  FR
                </button>
              </div>

            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <div className="bg-white px-6 py-2 flex flex-col md:flex-row md:items-center justify-between grow">
            
            <div className="w-full md:w-auto flex justify-start order-2 md:order-1 mt-4 md:mt-0 mb-4 md:mb-0">
              {!isHome ? (
                <Link to="/" className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-main-blue hover:text-light-blue transition-colors" aria-label="Regresar a la página principal">
                  <span className="text-lg leading-none" aria-hidden="true">&larr;</span> VOLVER
                </Link>
              ) : <span className="hidden md:block w-24"></span>}
            </div>

            <nav className="w-full md:w-auto flex flex-col md:flex-row justify-center md:items-center gap-2 md:gap-5 text-sm font-bold tracking-widest uppercase text-main-blue order-1 md:order-2" aria-label="Menú principal">
              
              {/* Dropdown Nosotros */}
              <div className="relative group w-full md:w-auto" onMouseLeave={() => setActiveDropdown(null)}>
                <button 
                  className="flex items-center justify-between md:justify-center w-full gap-1.5 hover:text-light-blue transition-colors py-3 md:py-2 cursor-pointer" 
                  onClick={() => toggleDropdown('nosotros')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'nosotros'}
                  aria-controls="dropdown-nosotros"
                >
                  NOSOTROS 
                  <svg className={`w-4 h-4 text-pale-blue transition-transform duration-300 ${activeDropdown === 'nosotros' ? 'rotate-180' : ''} md:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div 
                  id="dropdown-nosotros"
                  className={`${activeDropdown === 'nosotros' ? 'block' : 'hidden'} md:block md:absolute md:left-0 md:top-full md:w-56 md:bg-white md:shadow-xl md:rounded-b md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 md:border-t-4 md:border-main-red w-full bg-gray-50 border-l-4 border-main-red md:border-l-0 z-50`}
                >
                  <ul className="py-2 flex flex-col">
                    <li><Link to="/quienes-somos" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">¿Quiénes somos?</Link></li>
                    <li><Link to="/equipo" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">Nuestro Equipo</Link></li>
                    <li><Link to="/informes-anuales" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">Informes Anuales</Link></li>
                  </ul>
                </div>
              </div>

              {/* Dropdown Áreas */}
              <div className="relative group w-full md:w-auto" onMouseLeave={() => setActiveDropdown(null)}>
                <button 
                  className="flex items-center justify-between md:justify-center w-full gap-1.5 hover:text-light-blue transition-colors py-3 md:py-2 cursor-pointer" 
                  onClick={() => toggleDropdown('areas')}
                >
                  NUESTRO TRABAJO 
                  <svg className={`w-4 h-4 text-pale-blue transition-transform duration-300 ${activeDropdown === 'areas' ? 'rotate-180' : ''} md:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`${activeDropdown === 'areas' ? 'block' : 'hidden'} md:block md:absolute md:left-0 md:top-full md:w-80 md:bg-white md:shadow-xl md:rounded-b md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 md:border-t-4 md:border-main-red w-full bg-gray-50 border-l-4 border-main-red md:border-l-0 z-50`}>
                  <ul className="py-2 flex flex-col">
                    
                    {/* Elementos Principales al mismo nivel */}
                    <li><Link to="/litigio-estrategico" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">Litigio Estratégico</Link></li>
                    <li><Link to="/cursos" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors mt-1">Formación Especializada</Link></li>
                    
                    
                    {/* Sección Internacional Agrupada */}
                    <li className="flex flex-col">
                      <Link to="/incidencia-internacional" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">
                        Incidencia Internacional
                      </Link>
                      <div className="grid grid-cols-1 gap-0">
                        <Link to="/incidencia-internacional/canada" className="block w-full pl-10 pr-5 py-2 hover:bg-gray-100 text-gray-500 hover:text-main-red transition-all text-xs font-bold italic">└ Canadá</Link>
                        <Link to="/incidencia-internacional/colombia" className="block w-full pl-10 pr-5 py-2 hover:bg-gray-100 text-gray-500 hover:text-main-red transition-all text-xs font-bold italic">└ Colombia</Link>
                        <Link to="/incidencia-internacional/costa-rica" className="block w-full pl-10 pr-5 py-2 hover:bg-gray-100 text-gray-500 hover:text-main-red transition-all text-xs font-bold italic">└ Costa Rica (Sede)</Link>
                        <Link to="/incidencia-internacional/guatemala" className="block w-full pl-10 pr-5 py-2 hover:bg-gray-100 text-gray-500 hover:text-main-red transition-all text-xs font-bold italic">└ Guatemala</Link>
                        <Link to="/incidencia-internacional/mexico" className="block w-full pl-10 pr-5 py-2 hover:bg-gray-100 text-gray-500 hover:text-main-red transition-all text-xs font-bold italic">└ México</Link>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* DROPDOWN ACTUALIDAD */}
              <div className="relative group w-full md:w-auto" onMouseLeave={() => setActiveDropdown(null)}>
                <button 
                  className="flex items-center justify-between md:justify-center w-full gap-1.5 hover:text-light-blue transition-colors py-3 md:py-2 cursor-pointer whitespace-nowrap" 
                  onClick={() => toggleDropdown('actualidad')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'actualidad'}
                  aria-controls="dropdown-actualidad"
                >
                  ACTUALIDAD 
                  <svg className={`w-4 h-4 text-pale-blue transition-transform duration-300 ${activeDropdown === 'actualidad' ? 'rotate-180' : ''} md:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div 
                  id="dropdown-actualidad"
                  className={`${activeDropdown === 'actualidad' ? 'block' : 'hidden'} md:block md:absolute md:left-0 md:top-full md:w-56 md:bg-white md:shadow-xl md:rounded-b md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 md:border-t-4 md:border-main-red w-full bg-gray-50 border-l-4 border-main-red md:border-l-0 z-50`}
                >
                  <ul className="py-2 flex flex-col">
                    <li><Link to="/noticias" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">Noticias</Link></li>
                    <li><Link to="/articulos-academicos" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 transition-colors">Artículos</Link></li>
                  </ul>
                </div>
              </div>

              {/* ENLACE DIRECTO A TIENDA */}
              <Link to="/tienda" className="hover:text-light-blue py-3 md:py-2 transition-colors whitespace-nowrap">
                TIENDA
              </Link>

            </nav>
            
          </div>
        </div>

      </div>
    </header>
  );
}