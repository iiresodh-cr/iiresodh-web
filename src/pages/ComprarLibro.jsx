// src/pages/ComprarLibro.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db, functions } from "../firebase/config";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import PageHeader from "../components/PageHeader";

const stripePromise = loadStripe("pk_test_51TG3Ix2cAGUeJe5mZ8VfsyNf1qmd7EYcncADyttNU7oZPLxpgi8VfjCWTVjOdluNcgeiyleaPgWmR1FQtZbwLj9E00RTW4N4Qs");

const FormularioPago = ({ libroId, precio, moneda, titulo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  
  // Estados para descuento y términos
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);
  const [aceptarTerminos, setAceptarTerminos] = useState(false);

  // Función para validar visualmente el descuento
  const aplicarDescuento = () => {
      // Validación estricta en mayúsculas
      if(codigoDescuento.trim().toUpperCase() === "OFERTA10") {
          setDescuentoAplicado({ codigo: "OFERTA10", porcentaje: 10 });
          setError(null);
      } else {
          setDescuentoAplicado(null);
          setError("El código de descuento no es válido o ha expirado.");
      }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (!aceptarTerminos) {
        setError("Debes aceptar los términos de uso y la política de privacidad para continuar.");
        return;
    }

    setLoading(true);
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
      setError("Ocurrió un error al procesar tu pago. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
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

  // Cálculo matemático del precio visual (el backend hace su propia validación por seguridad)
  const precioFinal = descuentoAplicado ? precio * (1 - descuentoAplicado.porcentaje / 100) : precio;

  // Lógica dinámica para el enlace de privacidad según el país (moneda detectada)
  const esMexico = moneda === "MXN";
  const urlPrivacidad = esMexico ? "/privacidad?tab=mexico" : "/privacidad?tab=general";
  const textoPrivacidad = esMexico ? "Aviso de Privacidad" : "Política de Privacidad";
  const articuloPrivacidad = esMexico ? "el " : "la ";

  if (exito) {
    return (
      <div className="bg-green-50 text-green-700 p-8 rounded-xl text-center border border-green-200 animate-fade-in-up">
        <h3 className="text-2xl font-bold mb-3">¡Pago Exitoso!</h3>
        <p className="text-lg">Gracias por adquirir <strong>{titulo}</strong>. Te hemos enviado un correo a <strong>{email}</strong> con tu enlace de descarga segura.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo</label>
        <input 
          type="text" 
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Juan Pérez"
          className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico (Para envío del PDF)</label>
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all"
        />
      </div>

      {/* SECCIÓN: CÓDIGO DE DESCUENTO */}
      <div>
         <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código de Descuento (Opcional)</label>
         <div className="flex gap-2">
             <input 
               type="text" 
               value={codigoDescuento}
               onChange={(e) => setCodigoDescuento(e.target.value)}
               placeholder="Ej. OFERTA10"
               className="flex-grow bg-gray-50 border border-gray-200 p-3.5 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all uppercase placeholder:normal-case"
             />
             <button 
                type="button" 
                onClick={aplicarDescuento}
                disabled={!codigoDescuento.trim() || loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 Aplicar
             </button>
         </div>
      </div>

      {/* SECCIÓN: DATOS DE LA TARJETA */}
      <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mt-4 text-left">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Datos de la Tarjeta</label>
        <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-sm">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* SECCIÓN: CHECKBOX LEGAL DE TÉRMINOS CON LÓGICA POR PAÍS */}
      <div className="flex items-start mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="terminos"
            type="checkbox"
            checked={aceptarTerminos}
            onChange={(e) => setAceptarTerminos(e.target.checked)}
            className="w-5 h-5 text-main-blue bg-white border-gray-300 rounded focus:ring-main-blue focus:ring-2 cursor-pointer"
          />
        </div>
        <label htmlFor="terminos" className="ml-3 text-sm font-medium text-gray-700 leading-snug cursor-pointer">
          He leído y acepto {articuloPrivacidad} <Link to={urlPrivacidad} target="_blank" className="text-main-blue font-bold hover:underline">{textoPrivacidad}</Link> y los <Link to="/privacidad?tab=terminos" target="_blank" className="text-main-blue font-bold hover:underline">Términos de Uso</Link> (incluyendo la política anti-piratería).
        </label>
      </div>

      {error && <div className="bg-red-50 text-main-red p-4 rounded-lg text-sm border border-red-200 font-medium">{error}</div>}

      {/* SECCIÓN: BOTÓN DE PAGO Y RESUMEN DE DESCUENTO */}
      <div className="mt-6">
        {descuentoAplicado && (
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-200 mb-4 shadow-sm animate-fade-in-up">
            <span className="text-green-800 font-bold text-sm uppercase tracking-widest">Descuento aplicado:</span>
            <div className="text-right flex items-center gap-3">
              <span className="text-gray-400 line-through text-sm font-medium">${precio.toFixed(2)}</span>
              <span className="text-green-700 font-extrabold text-2xl">${precioFinal.toFixed(2)} <span className="text-sm font-bold">{moneda}</span></span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!stripe || loading || !aceptarTerminos}
          className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest cursor-pointer text-base ${descuentoAplicado ? 'bg-green-600 hover:bg-green-700' : 'bg-main-red hover:bg-red-700'}`}
        >
          {loading ? "Procesando pago seguro..." : `Pagar $${precioFinal.toFixed(2)} ${moneda}`}
        </button>
      </div>
    </form>
  );
};

export default function ComprarLibro() {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-main-blue uppercase tracking-widest">Cargando Tienda...</div>;

  if (!slug) {
    return (
      <main className="bg-white min-h-screen flex flex-col font-sans">
        <PageHeader titulo="Tienda Editorial" subtitulo="Adquiere nuestras publicaciones académicas oficiales." />
        
        <div className="relative overflow-hidden grow pb-20">
          <div className="bg-watermark" aria-hidden="true"></div>
          
          <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
            <div className="max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl shadow-sm border border-gray-100">
              <div className="px-6 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
                  {listaLibros.map((l) => {
                    const esMXN = moneda === "MXN" && l.precioMXN;
                    const precioMostrar = esMXN ? l.precioMXN : l.precio;
                    const monedaMostrar = esMXN ? "MXN" : "USD";

                    return (
                      <div key={l.id} className="flex flex-col group h-full">
                        <Link to={`/comprar-libro/${l.slug}`} className="w-full aspect-4/5 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 mb-6 relative">
                          {l.imagenPrincipalUrl ? (
                            <img 
                              src={l.imagenPrincipalUrl} 
                              alt={l.titulo} 
                              className="max-h-full max-w-full object-contain p-4 rounded-md shadow-sm" 
                            />
                          ) : (
                            <div className="text-gray-300 font-bold text-center uppercase tracking-tighter p-4">Sin Portada</div>
                          )}
                        </Link>

                        <div className="flex flex-col grow">
                          <span className="text-[10px] font-black text-main-red uppercase tracking-widest mb-2 block">Copia Digital (PDF)</span>
                          <Link to={`/comprar-libro/${l.slug}`}>
                            <h3 className="text-xl md:text-2xl font-extrabold text-main-blue mb-2 leading-tight uppercase group-hover:text-light-blue transition-colors">{l.titulo}</h3>
                          </Link>
                          {l.autor && <p className="text-sm font-bold text-gray-700 mb-4">Por: {l.autor}</p>}
                          {l.resumen && <p className="text-sm text-gray-600 mb-6 leading-relaxed font-light italic">{l.resumen}</p>}
                          <div className="mt-auto pt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                            <span className="text-2xl font-black text-main-blue">${precioMostrar} <span className="text-sm font-medium text-gray-500">{monedaMostrar}</span></span>
                            <Link to={`/comprar-libro/${l.slug}`} className="bg-main-blue hover:bg-light-blue text-white font-bold py-3 px-8 rounded-xl text-sm uppercase tracking-widest transition-colors shadow-sm">Comprar</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {listaLibros.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-xl text-gray-400 font-medium">No hay libros disponibles en este momento.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!libro) return <div className="min-h-screen flex items-center justify-center font-bold text-main-red uppercase">Publicación no encontrada</div>;

  const esMXNLibro = moneda === "MXN" && libro.precioMXN;
  const precioFinal = esMXNLibro ? libro.precioMXN : libro.precio;
  const monedaFinal = esMXNLibro ? "MXN" : "USD";

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <PageHeader titulo="Finalizar Compra" subtitulo="Estás adquiriendo una publicación oficial de IIRESODH." />
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl shadow-sm border border-gray-100">
            <div className="px-8 pt-8 md:px-12 lg:px-16 md:pt-12 pb-6 border-b border-gray-50">
              <Link to="/comprar-libro" className="inline-flex items-center gap-2 text-xs font-bold text-main-red uppercase tracking-widest hover:text-main-blue transition-colors">
                <span className="text-lg leading-none">&larr;</span> Volver a la Tienda
              </Link>
            </div>
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up">
              <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start text-center md:text-left">
                <div className="w-full md:w-5/12 flex justify-center shrink-0">
                  {libro.imagenPrincipalUrl ? (
                    <img 
                      src={libro.imagenPrincipalUrl} 
                      alt={libro.titulo} 
                      className="max-w-full w-auto object-contain shadow-2xl rounded-xl p-10 bg-gray-50" 
                      style={{ maxHeight: "500px" }} 
                    />
                  ) : (
                    <div className="w-64 h-80 bg-gray-50 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-main-blue font-bold p-10 text-center text-sm uppercase leading-tight">{libro.titulo}</div>
                  )}
                </div>
                <div className="w-full md:w-7/12 flex flex-col grow">
                  <span className="text-xs font-black text-main-red uppercase tracking-widest mb-3 block">Confirmación de Pedido</span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-main-blue mb-4 leading-tight uppercase">{libro.titulo}</h2>
                  {libro.autor && <p className="text-gray-500 font-medium mb-10 italic text-base md:text-lg">Escrito por: <span className="font-bold text-gray-800">{libro.autor}</span></p>}
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