// src/pages/ArticuloDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Importaciones de MUI
import { CircularProgress, Button, Alert, Snackbar } from "@mui/material";

// IMPORTACIONES PARA i18n Y TRADUCCIÓN DINÁMICA
import { useTranslation } from 'react-i18next';
import { obtenerTextoTraducido } from "../utils/traductorDinamico";

// MOTOR ESTRUCTURAL PURO
export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  
  // 1. Escapar < y > por seguridad, pero NO TOCAR el & para no romper URLs
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const linksGuardados = []; // Caja fuerte temporal

  // 2. Extraer Markdown: [Texto visible](URL)
  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    let visible = label;
    // Si la etiqueta visible es muy larga, la acortamos a 45 caracteres
    if (visible.length > 45) {
      visible = visible.substring(0, 42) + "...";
    }
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline break-all">${visible}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; // Dejamos marcador
  });

  // 3. Extraer URLs crudas pegadas directamente
  procesado = procesado.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    if (url.includes("__LINK_")) return match; // Evitar procesar los marcadores
    
    let visible = url;
    // Acortar visualmente la URL a 45 caracteres
    if (visible.length > 45) {
      visible = visible.substring(0, 42) + "...";
    }
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline break-all">${visible}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; // Dejamos marcador
  });

  // 4. Procesar Hashtags
  procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (match) => {
    const term = match.substring(1);
    return `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">${match}</a>`;
  });

  // 5. Restaurar Links desde la caja fuerte
  procesado = procesado.replace(/__LINK_(\d+)__/g, (match, i) => linksGuardados[i]);

  // 6. Convertir saltos de línea a párrafos
  const parrafos = procesado.split(/\n\s*\n/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
};

export default function ArticuloDetalle() {
  const { t, i18n } = useTranslation(); 
  const { slug } = useParams();
  const navigate = useNavigate();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false); 
  const currentUrl = window.location.href; 

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchArticulo = async () => {
      try {
        const q = query(collection(db, "articulos_academicos"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setArticulo({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        } else {
          const docRef = doc(db, "articulos_academicos", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setArticulo({ id: docSnap.id, ...docSnap.data() });
          } else {
            setArticulo(null);
          }
        }
      } catch (error) {
        console.error("Error al cargar el artículo:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticulo();
    }
  }, [slug, navigate]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString(i18n.language || "es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => setCopiado(true))
      .catch((err) => console.error("Error al copiar el enlace: ", err));
  };

  // ==========================================
  // TRADUCCIÓN DINÁMICA DEL ARTÍCULO
  // ==========================================
  const tituloTraducido = obtenerTextoTraducido(articulo, 'titulo', i18n.language);
  const contenidoTraducido = obtenerTextoTraducido(articulo, 'contenido', i18n.language);

  // Actualizar el título de la pestaña del navegador
  useEffect(() => {
    if (tituloTraducido) {
      document.title = `${tituloTraducido} | IIRESODH`;
    }
  }, [tituloTraducido]);

  // ESTADO DE CARGA MEJORADO CON MUI
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          {t('articulo_detalle.cargando', 'Cargando artículo...')}
        </span>
      </div>
    );
  }

  // ESTADO DE ERROR MEJORADO CON MUI
  if (!articulo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" role="alert">
        <Alert severity="error" variant="filled" sx={{ borderRadius: '12px', px: 4, py: 2 }}>
          <span className="font-bold text-lg">{t('articulo_detalle.no_encontrada_titulo', 'Artículo no encontrado')}</span>
          <p className="text-sm mt-1 opacity-90">{t('articulo_detalle.no_encontrada_desc', 'Es posible que el enlace sea incorrecto o la publicación haya sido eliminada.')}</p>
        </Alert>
      </div>
    );
  }

  // ENLACES PARA REDES SOCIALES (usando el título traducido)
  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(tituloTraducido + " " + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(tituloTraducido)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  };

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* CABECERA AZUL */}
      <header className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
        <span className="text-xs font-black text-main-red uppercase tracking-widest mb-4 block">
          {formatearFecha(articulo.fechaPublicacion) || t('articulo_detalle.etiqueta_default', 'Artículo Académico')}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto leading-tight">
          {tituloTraducido}
        </h1>
        <div className="w-24 h-1.5 bg-main-red mx-auto rounded-full" aria-hidden="true"></div>
      </header>

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10">
          
          <article className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-6">
              <Button 
                component={Link} 
                to="/articulos-academicos" 
                startIcon={<span className="text-xl leading-none -mt-1" aria-hidden="true">&larr;</span>}
                sx={{ 
                  color: 'secondary.main', 
                  fontWeight: 'bold', 
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  '&:hover': { bgcolor: 'rgba(185, 47, 50, 0.04)', color: 'primary.main' } 
                }}
                aria-label="Regresar al repositorio de artículos"
              >
                {t('articulo_detalle.volver_repositorio', 'Volver al repositorio')}
              </Button>
            </div>

            <div className="px-6 md:px-12 lg:px-16 pb-12 animate-fade-in-up w-full">

              {articulo.imagenPrincipalUrl && (
                <div className="mb-12 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img 
                    src={articulo.imagenPrincipalUrl} 
                    alt={`${t('articulo_detalle.alt_imagen', 'Imagen ilustrativa del artículo:')} ${tituloTraducido}`} 
                    className="w-full max-h-150 object-contain block"
                  />
                </div>
              )}

              {/* CONTENIDO DEL ARTÍCULO TRADUCIDO ALINEADO A LA IZQUIERDA */}
              <div 
                className="noticia-content z-10 text-left [&>p]:text-left"
                dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(contenidoTraducido) }}
              />

              <footer className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center lg:text-left">
                  {t('articulo_detalle.compartir_articulo', 'Compartir este artículo')}
                </p>
                
                <nav className="flex flex-wrap justify-center lg:justify-start gap-3" aria-label="Redes sociales para compartir">
                  
                  {/* WhatsApp */}
                  <Button
                    component="a"
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    startIcon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>}
                    aria-label="Compartir en WhatsApp"
                    sx={{
                      borderRadius: 50,
                      px: 2.5,
                      py: 1,
                      color: '#6B7280',
                      bgcolor: '#F9FAFB',
                      borderColor: 'transparent',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#F0FDF4', 
                        color: '#16A34A', 
                        borderColor: '#BBF7D0', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    WhatsApp
                  </Button>

                  {/* Facebook */}
                  <Button
                    component="a"
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    startIcon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                    aria-label="Compartir en Facebook"
                    sx={{
                      borderRadius: 50,
                      px: 2.5,
                      py: 1,
                      color: '#6B7280',
                      bgcolor: '#F9FAFB',
                      borderColor: 'transparent',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#EFF6FF', 
                        color: '#1D4ED8', 
                        borderColor: '#BFDBFE', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    Facebook
                  </Button>

                  {/* X / Twitter */}
                  <Button
                    component="a"
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    startIcon={<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                    aria-label="Compartir en Twitter (X)"
                    sx={{
                      borderRadius: 50,
                      px: 2.5,
                      py: 1,
                      color: '#6B7280',
                      bgcolor: '#F9FAFB',
                      borderColor: 'transparent',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#000000', 
                        color: '#FFFFFF', 
                        borderColor: '#000000',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    X (Twitter)
                  </Button>

                  <Button
                    onClick={handleCopyLink}
                    variant="outlined"
                    startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>}
                    aria-label="Copiar enlace del artículo"
                    sx={{
                      borderRadius: 50,
                      px: 2.5,
                      py: 1,
                      color: '#6B7280',
                      bgcolor: '#F9FAFB',
                      borderColor: 'transparent',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#F3F4F6', 
                        color: '#374151', 
                        borderColor: '#E5E7EB',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    {t('articulo_detalle.copiar_enlace', 'Copiar Enlace')}
                  </Button>

                </nav>
              </footer>

            </div>
          </article>
        </section>
      </div>

      <Snackbar
        open={copiado}
        autoHideDuration={3000}
        onClose={() => setCopiado(false)}
        message={t('articulo_detalle.enlace_copiado', '¡Enlace copiado al portapapeles!')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </main>
  );
}