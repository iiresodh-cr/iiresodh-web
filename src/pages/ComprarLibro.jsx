// src/pages/ComprarLibro.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db, functions } from "../firebase/config";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import PageHeader from "../components/PageHeader";

// 🔴 TU CLAVE PÚBLICA DE STRIPE
const stripePromise = loadStripe("pk_test_51TG3Ix2cAGUeJe5mZ8VfsyNf1qmd7EYcncADyttNU7oZPLxpgi8VfjCWTVjOdluNcgeiyleaPgWmR1FQtZbwLj9E00RTW4N4Qs");

// --- COMPONENTE DEL FORMULARIO DE PAGO ---
const FormularioPago = ({ libroId, precio, moneda, titulo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const crearIntento = httpsCallable(functions, 'crearIntentoPago');
      const { data } = await crearIntento({ libroId, emailUsuario: email, moneda });

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
      setError("Ocurrió un error al procesar tu pago. Intenta de nuevo.");
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

  if (exito) {
    return (
      <div className="bg-green-50 text-green-700 p-8 rounded-xl text-center border border-green-200 animate-fade-in-up">
        <h3 className="text-2xl font-bold mb-3">¡Pago Exitoso!</h3>
        <p className="text-lg">Gracias por adquirir <strong>{titulo}</strong>. Te hemos enviado un correo a <strong>{email}</strong> con el archivo.</p>
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

      <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mt-4 text-left">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Datos de la Tarjeta</label>
        <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-sm">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="bg-red-50 text-main-red p-4 rounded-lg text-sm border border-red-200 font-medium">{error}</div>}

      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-main-red hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-6 cursor-pointer text-base"
      >
        {loading ? "Procesando pago..." : `Pagar $${precio} ${moneda}`}
      </button>
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
        <div className="max-w-7xl mx-auto px-6 py-16 w-full grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {listaLibros.map((l) => {
              const esMXN = moneda === "MXN" && l.precioMXN;
              const precioMostrar = esMXN ? l.precioMXN : l.precio;
              const monedaMostrar = esMXN ? "MXN" : "USD";

              return (
                <div key={l.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col hover:border-main-blue/20">
                  <div className="aspect-4/5 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-50">
                    {l.imagenPrincipalUrl ? (
                      <img src={l.imagenPrincipalUrl} alt={l.titulo} className="h-full w-full object-cover rounded-lg shadow-md" />
                    ) : (
                      <div className="text-gray-300 font-bold text-center uppercase tracking-tighter">Sin Portada</div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col grow">
                    <span className="text-[10px] font-black text-main-red uppercase tracking-widest mb-2 block">Copia Digital (PDF)</span>
                    <h3 className="text-lg font-extrabold text-main-blue mb-1 uppercase leading-tight">{l.titulo}</h3>
                    
                    {l.autor && <p className="text-xs text-gray-500 mb-3 italic font-medium">Por: {l.autor}</p>}
                    
                    {l.resumen && (
                      <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                          {l.resumen}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-2xl font-black text-main-blue">${precioMostrar} <span className="text-xs font-medium text-gray-400">{monedaMostrar}</span></span>
                      <Link to={`/comprar-libro/${l.slug}`} className="bg-main-blue hover:bg-light-blue text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-sm">Comprar</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {listaLibros.length === 0 && <p className="text-center text-gray-400 font-medium">No hay libros disponibles en este momento.</p>}
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

        {/* ESTRUCTURA IDÉNTICA AL EJEMPLO QUE ENVIASTE */}
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            <div className="px-8 md:px-12 lg:px-16 pb-12 md:pb-16 animate-fade-in-up">
              
              <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start text-center md:text-left">
                
                {/* LADO IZQUIERDO: PORTADA GRANDE Y SIN CAJAS GRISES */}
                <div className="w-full md:w-5/12 flex justify-center shrink-0">
                  {libro.imagenPrincipalUrl ? (
                    <img 
                      src={libro.imagenPrincipalUrl} 
                      alt={libro.titulo} 
                      className="max-w-full w-auto object-contain shadow-2xl rounded-xl" 
                      style={{ maxHeight: "600px" }} 
                    />
                  ) : (
                    <div className="w-64 h-80 bg-gray-50 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-main-blue font-bold p-4 text-center text-sm uppercase leading-tight">
                      {libro.titulo}
                    </div>
                  )}
                </div>

                {/* LADO DERECHO: TEXTO Y FORMULARIO */}
                <div className="w-full md:w-7/12 flex flex-col grow">
                  <span className="text-xs font-black text-main-red uppercase tracking-widest mb-3 block">Confirmación de Pedido</span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-main-blue mb-4 leading-tight uppercase">{libro.titulo}</h2>
                  
                  {libro.autor && (
                    <p className="text-gray-500 font-medium mb-10 italic text-base md:text-lg">
                      Escrito por: <span className="font-bold text-gray-800">{libro.autor}</span>
                    </p>
                  )}

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