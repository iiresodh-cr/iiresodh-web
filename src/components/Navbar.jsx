// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Importamos el logo oficial recortado
import logo from "../assets/Logo_Oficiale_200w-trim.png"; 

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  
  // Estados para manejar el buscador y el menú móvil
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Cierra el menú móvil automáticamente al cambiar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Función que se ejecuta al enviar el formulario de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsMobileMenuOpen(false); // Cierra el menú si se busca desde el celular
    }
  };

  // Función para alternar los submenús en versión móvil
  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <header className="w-full shadow-sm relative z-50">
      {/* FRANJA SUPERIOR: Logo, Buscador, Redes y Botón Hamburguesa */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 md:gap-8">
          
          {/* LOGO (Izquierda) */}
          <Link to="/" className="shrink-0 flex items-center">
            <img src={logo} alt="IIRESODH Logo" className="h-14 md:h-20 w-auto object-contain" />
          </Link>

          {/* CONTENEDOR DERECHO EN MÓVIL (Hamburguesa + Redes ocultas en sm) */}
          <div className="flex items-center gap-4 md:gap-6 text-light-blue md:order-3 ml-auto md:ml-0">
            <div className="hidden sm:flex items-center gap-4 md:gap-6">
              <a href="https://www.facebook.com/iiresodhcostarica" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://www.instagram.com/iiresodh" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://x.com/IIRESODH1" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                <svg className="w-6 h-6 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://www.youtube.com/@iiresodh" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.658 2.658 0 00-1.874-1.886C18.053 3.846 12 3.846 12 3.846s-6.053 0-7.708.454a2.658 2.658 0 00-1.874 1.886C1.964 7.857 1.964 12 1.964 12s0 4.143.454 5.814a2.658 2.658 0 001.874 1.886C5.947 20.154 12 20.154 12 20.154s6.053 0 7.708-.454a2.658 2.658 0 001.874-1.886C22.036 16.143 22.036 12 22.036 12s0-4.143-.454-5.814zM9.965 15.485V8.515L15.918 12l-5.953 3.485z" /></svg>
              </a>
            </div>
            
            {/* BOTÓN HAMBURGUESA (Solo visible en móviles) */}
            <button 
              className="md:hidden p-2 text-main-blue hover:text-main-red transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú principal"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* BARRA DE BÚSQUEDA (Centro) - Cae a segunda línea en móviles */}
          <div className="w-full md:flex-1 max-w-md mx-auto md:order-2 mt-3 md:mt-0 order-last">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar noticias, áreas, información..."
                className="w-full bg-gray-50 border border-gray-200 text-main-blue text-sm rounded-full pl-5 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1 bottom-1 bg-light-blue hover:bg-main-blue text-white w-8 rounded-full flex items-center justify-center transition-colors shadow-sm"
                aria-label="Buscar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* FRANJA INFERIOR: Menú de navegación */}
      <div className="bg-white text-main-blue border-t border-gray-100 shadow-md md:sticky md:top-0 relative z-40">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className={`${isMobileMenuOpen ? 'flex flex-col pb-6' : 'hidden'} md:flex md:flex-row md:items-center justify-between min-h-15 py-2 md:py-0 gap-4 md:gap-0`}>
            
            {/* BOTÓN VOLVER */}
            <div className="w-full md:w-auto flex justify-start order-2 md:order-1 mt-4 md:mt-0">
              {!isHome ? (
                <Link to="/" className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase hover:text-light-blue transition-colors">
                  <span className="text-lg leading-none">&larr;</span> VOLVER
                </Link>
              ) : <span className="hidden md:block w-24"></span>}
            </div>

            {/* ENLACES PRINCIPALES */}
            <nav className="w-full md:w-auto flex flex-col md:flex-row justify-center md:items-center gap-1 md:gap-10 text-sm font-medium tracking-widest uppercase order-1 md:order-2">
              
              {/* DROPDOWN NOSOTROS */}
              <div className="relative group cursor-pointer w-full md:w-auto">
                <button 
                  className="flex items-center justify-between md:justify-center w-full gap-1.5 hover:text-light-blue transition-colors py-4 md:py-5 border-b border-gray-100 md:border-b-0"
                  onClick={() => toggleDropdown('nosotros')}
                >
                  NOSOTROS 
                  <svg className={`w-4 h-4 text-pale-blue transition-transform duration-300 ${activeDropdown === 'nosotros' ? 'rotate-180' : ''} md:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {/* Contenido Dropdown (Responsive) */}
                <div className={`
                  ${activeDropdown === 'nosotros' ? 'block' : 'hidden'} 
                  md:block md:absolute md:left-0 md:top-full md:w-56 md:bg-white md:shadow-xl md:rounded-b 
                  md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 
                  md:border-t-4 md:border-main-red w-full bg-gray-50 border-l-4 border-main-red md:border-l-0
                `}>
                  <ul className="py-2 flex flex-col">
                    <li><Link to="/quienes-somos" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 md:hover:bg-gray-50 transition-colors">¿Quiénes somos?</Link></li>
                    <li><Link to="/equipo" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 md:hover:bg-gray-50 transition-colors">Equipo de Trabajo</Link></li>
                    <li><Link to="/informes" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 md:hover:bg-gray-50 transition-colors">Informes Anuales</Link></li>
                  </ul>
                </div>
              </div>

              {/* DROPDOWN ÁREAS DE TRABAJO */}
              <div className="relative group cursor-pointer w-full md:w-auto">
                <button 
                  className="flex items-center justify-between md:justify-center w-full gap-1.5 hover:text-light-blue transition-colors py-4 md:py-5 border-b border-gray-100 md:border-b-0"
                  onClick={() => toggleDropdown('areas')}
                >
                  ÁREAS DE TRABAJO 
                  <svg className={`w-4 h-4 text-pale-blue transition-transform duration-300 ${activeDropdown === 'areas' ? 'rotate-180' : ''} md:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {/* Contenido Dropdown (Responsive) */}
                <div className={`
                  ${activeDropdown === 'areas' ? 'block' : 'hidden'} 
                  md:block md:absolute md:left-0 md:top-full md:w-64 md:bg-white md:shadow-xl md:rounded-b 
                  md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 
                  md:border-t-4 md:border-main-red w-full bg-gray-50 border-l-4 border-main-red md:border-l-0
                `}>
                  <ul className="py-2 flex flex-col">
                    <li><Link to="/" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 md:hover:bg-gray-50 transition-colors">Litigio Estratégico</Link></li>
                    <li><Link to="/" className="block w-full px-5 py-3 md:py-2 hover:bg-gray-100 md:hover:bg-gray-50 transition-colors">Cooperación Internacional</Link></li>
                  </ul>
                </div>
              </div>
              
              <Link to="/noticias" className="hover:text-light-blue py-4 md:py-5 transition-colors w-full md:w-auto block border-b border-gray-100 md:border-b-0">NOTICIAS</Link>

              {/* Redes Sociales (Solo visibles dentro del menú en Móviles) */}
              <div className="flex sm:hidden items-center justify-center gap-8 pt-8 pb-4 mt-2 text-light-blue">
                <a href="https://www.facebook.com/iiresodhcostarica" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.instagram.com/iiresodh" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://x.com/IIRESODH1" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://www.youtube.com/@iiresodh" target="_blank" rel="noreferrer" className="hover:text-main-red transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.658 2.658 0 00-1.874-1.886C18.053 3.846 12 3.846 12 3.846s-6.053 0-7.708.454a2.658 2.658 0 00-1.874 1.886C1.964 7.857 1.964 12 1.964 12s0 4.143.454 5.814a2.658 2.658 0 001.874 1.886C5.947 20.154 12 20.154 12 20.154s6.053 0 7.708-.454a2.658 2.658 0 001.874-1.886C22.036 16.143 22.036 12 22.036 12s0-4.143-.454-5.814zM9.965 15.485V8.515L15.918 12l-5.953 3.485z" /></svg>
              </a>
            </div>
            
            </nav>

            <div className="w-full md:w-auto flex justify-center md:justify-end order-3 mt-4 md:mt-0">
              <Link to="/" className="bg-main-red hover:bg-bright-red text-white px-8 py-3 md:py-2.5 rounded-full font-medium uppercase text-sm tracking-widest shadow-md transition-colors w-full md:w-auto text-center">
                DONACIONES
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
}