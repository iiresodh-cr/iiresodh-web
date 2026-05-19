// src/pages/Tienda.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db, functions } from "../firebase/config";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI y Wrappers
import AdminTextField from "../components/ui/AdminTextField";
import { Button, Checkbox, FormControlLabel, Alert, Paper } from "@mui/material";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

const stripePromise = loadStripe("pk_test_51TG3Ix2cAGUeJe5mZ8VfsyNf1qmd7EYcncADyttNU7oZPLxpgi8VfjCWTVjOdluNcgeiyleaPgWmR1FQtZbwLj9E00RTW4N4Qs");

const FormularioPago = ({ libroId, precio, moneda, titulo }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loadingPago, setLoadingPago] = useState(false);
  const [loadingDescuento, setLoadingDescuento] = useState(false);
  const [error, setError] = useState(null);
  const [errorDescuento, setErrorDescuento] = useState(null);
  const [exito, setExito] = useState(false);
  
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);
  const [aceptarTerminos, setAceptarTerminos] = useState(false);

  const aplicarDescuento = async () => {
      if (!codigoDescuento.trim()) return;
      
      if (!email.trim()) {
          setErrorDescuento(t('tienda.error_correo_cupon', "Por favor, ingresa tu correo electrónico para validar este cupón."));
          return;
      }
      
      setLoadingDescuento(true);
      setErrorDescuento(null);
      setError(null);

      try {
          const validarCupon = httpsCallable(functions, 'validarCuponStripe');
          const { data } = await validarCupon({ 
              codigo: codigoDescuento.trim(),
              emailUsuario: email.trim() 
          });

          if (data.valido) {
              setDescuentoAplicado({ 
                  codigo: codigoDescuento.trim(), 
                  porcentaje: data.porcentaje,
                  montoFijo: data.montoFijo,
                  moneda: data.moneda
              });
              setErrorDescuento(null);
          } else {
              setDescuentoAplicado(null);
              setErrorDescuento(data.mensaje || t('tienda.error_cupon_invalido', "El código no es válido o ha expirado."));
          }
      } catch (err) {
          console.error(err);
          setDescuentoAplicado(null);
          setErrorDescuento(t('tienda.error_conexion_cupon', "Error de conexión al validar el cupón."));
      } finally {
          setLoadingDescuento(false);
      }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (!aceptarTerminos) {
        setError(t('tienda.error_terminos', "Debes aceptar los términos de uso y la política de privacidad para continuar."));
        return;
    }

    setLoadingPago(true);
    setError(null);

    try {
      const crearIntento = httpsCallable(functions, 'crearIntentoPago');
      
      const { data } = await crearIntento({ 
          libroId, 
          emailUsuario: email, 
          moneda,
          codigoDescuento: descuentoAplicado ? descuentoAplicado.codigo : null,
          terminosAceptados: true
      });

      const resultadoPago = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: nombre || 'Cliente Web',
            email: email,
          },
        },
        receipt_email: email,
      });

      if (resultadoPago.error) {
        setError(resultadoPago.error.message);
      } else if (resultadoPago.paymentIntent.status === 'succeeded') {
        setExito(true);
      }
    } catch (err) {
      console.error(err);
      setError(t('tienda.error_pago', "Ocurrió un error al procesar tu pago. Verifica tu conexión e intenta de nuevo."));
    } finally {
      setLoadingPago(false);
    }
  };

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        color: '#1D3557',
        fontFamily: '"Work Sans", sans-serif',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#B92F32' },
    },
  };

  let precioFinal = precio;
  if (descuentoAplicado) {
      if (descuentoAplicado.porcentaje) {
          precioFinal = precio * (1 - descuentoAplicado.porcentaje / 100);
      } else if (descuentoAplicado.montoFijo) {
          precioFinal = precio - (descuentoAplicado.montoFijo / 100);
      }
  }
  if (precioFinal < 0) precioFinal = 0;

  const esMexico = moneda === "MXN";
  const urlPrivacidad = esMexico ? "/privacidad?tab=mexico" : "/privacidad?tab=general";
  const textoPrivacidad = esMexico ? t('tienda.aviso_privacidad', "Aviso de Privacidad") : t('tienda.politica_privacidad', "Política de Privacidad");
  const articuloPrivacidad = esMexico ? t('tienda.el', "el ") : t('tienda.la', "la ");

  if (exito) {
    return (
      <Alert 
        severity="success" 
        variant="filled"
        sx={{ 
          borderRadius: '16px', 
          p: 4, 
          animation: 'fade-in-up 0.5s ease-out',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{t('tienda.pago_exitoso', "¡Pago Exitoso!")}</h3>
        <p className="text-base font-medium text-green-50 leading-relaxed">
          {t('tienda.gracias_adquirir', "Gracias por adquirir")} <strong>{titulo}</strong>. {t('tienda.correo_enviado', "Te hemos enviado un correo a")} <strong>{email}</strong> {t('tienda.enlace_descarga', "con tu enlace de descarga segura.")}
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="flex flex-col gap-6">
        <AdminTextField 
          label={t('tienda.label_nombre', "Nombre Completo")}
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={t('tienda.placeholder_nombre', "Ej. Juan Pérez")}
        />

        <AdminTextField 
          label={t('tienda.label_correo', "Correo Electrónico (Para envío del PDF)")}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
      </div>

      <div>
         <div className="flex gap-3 items-stretch">
             <div className="grow">
                 <AdminTextField 
                   label={t('tienda.label_cupon', "Código de Descuento (Opcional)")}
                   value={codigoDescuento}
                   onChange={(e) => {
                     setCodigoDescuento(e.target.value.toUpperCase());
                     if(errorDescuento) setErrorDescuento(null);
                   }}
                   placeholder={t('tienda.placeholder_cupon', "CÓDIGO")}
                 />
             </div>
             <Button 
                variant="contained"
                onClick={aplicarDescuento}
                disabled={!codigoDescuento.trim() || loadingDescuento}
                sx={{ 
                  borderRadius: '12px', 
                  px: { xs: 3, sm: 4 }, 
                  bgcolor: '#F3F4F6', 
                  color: '#374151',
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  border: '1px solid #E5E7EB',
                  '&:hover': { bgcolor: '#E5E7EB', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#F9FAFB', color: '#9CA3AF' }
                }}
             >
                 {loadingDescuento ? "..." : t('tienda.btn_aplicar', "Aplicar")}
             </Button>
         </div>
         {errorDescuento && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }} className="animate-fade-in-up">
              {errorDescuento}
            </Alert>
         )}
      </div>

      <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl text-left">
        <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">{t('tienda.datos_pago', "Datos de Pago Seguro")}</label>
        <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-inner">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <FormControlLabel
          control={
            <Checkbox
              checked={aceptarTerminos}
              onChange={(e) => setAceptarTerminos(e.target.checked)}
              sx={{
                color: '#D1D5DB',
                '&.Mui-checked': { color: 'primary.main' },
              }}
            />
          }
          label={
            <span className="text-sm font-medium text-gray-700 leading-snug">
              {t('tienda.he_leido', "He leído y acepto")} {articuloPrivacidad} <Link to={urlPrivacidad} target="_blank" className="text-main-blue font-bold hover:underline">{textoPrivacidad}</Link> {t('tienda.y_los', "y los")} <Link to="/privacidad?tab=terminos" target="_blank" className="text-main-blue font-bold hover:underline">{t('tienda.terminos_uso', "Términos de Uso")}</Link> {t('tienda.politica_antipirateria', "(incluyendo la política anti-piratería).")}
            </span>
          }
          sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: '2px' } }}
        />
      </div>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 'medium' }}>
          {error}
        </Alert>
      )}

      <div className="pt-2">
        {descuentoAplicado && (
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-200 mb-5 shadow-sm animate-fade-in-up">
            <span className="text-green-800 font-bold text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {t('tienda.descuento_aplicado', "Descuento aplicado:")}
            </span>
            <div className="text-right flex items-center gap-3">
              <span className="text-gray-400 line-through text-sm font-medium">${precio.toFixed(2)}</span>
              <span className="text-green-700 font-extrabold text-2xl">${precioFinal.toFixed(2)} <span className="text-sm font-bold">{moneda}</span></span>
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          variant="contained"
          disabled={!stripe || loadingPago || !aceptarTerminos}
          fullWidth
          sx={{
             py: 2,
             borderRadius: '12px',
             fontSize: '1rem',
             fontWeight: 'bold',
             letterSpacing: '0.1em',
             bgcolor: descuentoAplicado ? '#16a34a' : 'secondary.main', 
             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
             '&:hover': { 
               bgcolor: descuentoAplicado ? '#15803d' : '#9B2527',
               boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
             },
             '&.Mui-disabled': {
               bgcolor: '#E5E7EB',
               color: '#9CA3AF'
             }
          }}
        >
          {loadingPago ? t('tienda.procesando_pago', "Procesando pago seguro...") : `${t('tienda.pagar', "Pagar")} $${precioFinal.toFixed(2)} ${moneda}`}
        </Button>
      </div>
    </form>
  );
};

export default function Tienda() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [libro, setLibro] = useState(null);
  const [listaLibros, setListaLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moneda, setMoneda] = useState("USD");

  useEffect(() => {
    const detectarMoneda = async () => {
      try {
        const resIp = await fetch("https://ipapi.co/json/");
        const dataIp = await resIp.json();
        if (dataIp.country_code === "MX") {
          setMoneda("MXN");
        }
      } catch (error) {
        console.error("Error detectando país:", error);
      }
    };
    detectarMoneda();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const q = query(collection(db, "libros"), where("slug", "==", slug), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setLibro({ id: snap.docs[0].id, ...snap.docs[0].data() });
          }
        } else {
          const q = query(collection(db, "libros"), orderBy("fechaPublicacion", "desc"));
          const snap = await getDocs(q);
          setListaLibros(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-main-blue uppercase tracking-widest">{t('tienda.cargando_tienda', "Cargando Tienda...")}</div>;

  if (!slug) {
    return (
      <main className="bg-white min-h-screen flex flex-col font-sans">
        <PageHeader titulo={t('tienda.header_titulo', "Tienda IIRESODH")} subtitulo={t('tienda.header_subtitulo', "Adquiere nuestras publicaciones y merchandising oficiales.")} />
        
        <div className="relative overflow-hidden grow pb-20">
          <div className="bg-watermark" aria-hidden="true"></div>
          
          <section className="relative pt-4 md:pt-6 px-0 z-10">
            <div className="max-w-7xl mx-auto bg-white overflow-hidden">
              <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-12 animate-fade-in-up w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-12 lg:gap-16 items-start">
                  {listaLibros.map((l) => {
                    const esMXN = moneda === "MXN" && l.precioMXN;
                    const precioMostrar = esMXN ? l.precioMXN : l.precio;
                    const monedaMostrar = esMXN ? "MXN" : "USD";

                    return (
                      <div key={l.id} className="flex flex-col group h-full">
                        <Link 
                          to={`/tienda/${l.slug}`} 
                          className="w-full aspect-4/5 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300"
                        >
                          {l.imagenPrincipalUrl ? (
                            <img 
                              src={l.imagenPrincipalUrl} 
                              alt={l.titulo} 
                              className="max-h-full max-w-full object-contain shadow-lg group-hover:shadow-2xl transition-shadow duration-300 rounded-sm" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-300 font-bold text-center uppercase tracking-tighter p-4">{t('tienda.sin_portada', "Sin Portada")}</div>
                          )}
                        </Link>

                        <div className="flex flex-col grow">
                          <span className="text-[10px] font-black text-main-red uppercase tracking-widest mb-2 block">{t('tienda.copia_digital', "Copia Digital (PDF)")}</span>
                          <Link to={`/tienda/${l.slug}`}>
                            <h3 className="text-xl md:text-2xl font-extrabold text-main-blue mb-2 leading-tight uppercase group-hover:text-light-blue transition-colors">{l.titulo}</h3>
                          </Link>
                          {l.autor && <p className="text-sm font-bold text-gray-700 mb-4">{t('tienda.por', "Por:")} {l.autor}</p>}
                          {l.resumen && <p className="text-sm text-gray-600 mb-6 leading-relaxed font-light italic">{l.resumen}</p>}
                          <div className="mt-auto pt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                            <span className="text-2xl font-black text-main-blue">${precioMostrar} <span className="text-sm font-medium text-gray-500">{monedaMostrar}</span></span>
                            <Link to={`/tienda/${l.slug}`} className="bg-main-blue hover:bg-light-blue text-white font-bold py-3 px-8 rounded-xl text-sm uppercase tracking-widest transition-colors shadow-sm">{t('tienda.comprar', "Comprar")}</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {listaLibros.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-xl text-gray-400 font-medium">{t('tienda.no_libros', "No hay libros disponibles en este momento.")}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!libro) return <div className="min-h-screen flex items-center justify-center font-bold text-main-red uppercase">{t('tienda.no_encontrada', "Publicación no encontrada")}</div>;

  const esMXNLibro = moneda === "MXN" && libro.precioMXN;
  const precioFinal = esMXNLibro ? libro.precioMXN : libro.precio;
  const monedaFinal = esMXNLibro ? "MXN" : "USD";

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <PageHeader titulo={t('tienda.header_compra_titulo', "Finalizar Compra")} subtitulo={t('tienda.header_compra_subtitulo', "Estás adquiriendo una publicación oficial de IIRESODH.")} />
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>
        <section className="relative pt-4 md:pt-6 px-0 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-6 border-b border-gray-50">
              <Link to="/tienda" className="inline-flex items-center gap-2 text-xs font-bold text-main-red uppercase tracking-widest hover:text-main-blue transition-colors">
                <span className="text-lg leading-none">&larr;</span> {t('tienda.volver_tienda', "Volver a la Tienda")}
              </Link>
            </div>
            <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12 animate-fade-in-up">
              <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start text-center md:text-left">
                
                <div className="w-full md:w-5/12 flex justify-center shrink-0">
                  {libro.imagenPrincipalUrl ? (
                    <img 
                      src={libro.imagenPrincipalUrl} 
                      alt={libro.titulo} 
                      className="max-w-full w-auto object-contain shadow-2xl rounded-sm" 
                      style={{ maxHeight: "480px" }} 
                    />
                  ) : (
                    <div className="w-64 h-80 bg-gray-50 rounded-sm shadow-sm border border-gray-200 flex items-center justify-center text-main-blue font-bold p-10 text-center text-sm uppercase leading-tight">{libro.titulo}</div>
                  )}
                </div>
                
                <div className="w-full md:w-7/12 flex flex-col grow">
                  <span className="text-xs font-black text-main-red uppercase tracking-widest mb-3 block">{t('tienda.confirmacion_pedido', "Confirmación de Pedido")}</span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-main-blue mb-4 leading-tight uppercase">{libro.titulo}</h2>
                  {libro.autor && <p className="text-gray-500 font-medium mb-10 italic text-base md:text-lg">{t('tienda.escrito_por', "Escrito por:")} <span className="font-bold text-gray-800">{libro.autor}</span></p>}
                  <div className="border-t border-gray-200 pt-8 mt-auto">
                    <Elements stripe={stripePromise}>
                      <FormularioPago libroId={libro.id} precio={precioFinal} moneda={monedaFinal} titulo={libro.titulo} />
                    </Elements>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}