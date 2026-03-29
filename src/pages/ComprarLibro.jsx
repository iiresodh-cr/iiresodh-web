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
const FormularioPago = ({ libroId, precio, titulo }) => {
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
      const { data } = await crearIntento({ libroId, emailUsuario: email });

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
      <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center border border-green-200 animate-fade-in-up">
        <h3 className="text-xl font-bold mb-2">¡Pago Exitoso!</h3>
        <p>Gracias por adquirir <strong>{titulo}</strong>. Te hemos enviado un correo a <strong>{email}</strong> con el archivo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Nombre Completo</label>
        <input 
          type="text" 
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Juan Pérez"
          className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Correo Electrónico (Para envío del PDF)</label>
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all"
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mt-2 text-left">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Datos de la Tarjeta</label>
        <div className="bg-white p-3 rounded-lg border border-gray-300">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="bg-red-50 text-main-red p-3 rounded-lg text-sm border border-red-200">{error}</div>}

      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-main-red hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-4 cursor-pointer"
      >
        {loading ? "Procesando pago..." : `Pagar $${precio} USD`}
      </button>
    </form>
  );
};

export default function ComprarLibro() {
  const { slug } = useParams();
  const [libro, setLibro] = useState(null);
  const [listaLibros, setListaLibros] = useState([]);
  const [loading, setLoading] = useState(true);

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
            {listaLibros.map((l) => (
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
                  
                  {/* AUTOR EN EL CATÁLOGO */}
                  {l.autor && <p className="text-xs text-gray-500 mb-3 italic font-medium">Por: {l.autor}</p>}
                  
                  {/* RESUMEN IA COMPLETO EN EL CATÁLOGO (Eliminado line-clamp) */}
                  {l.resumen && (
                    <p className="text-xs text-gray-600 mb-8 leading-relaxed border-l-2 border-main-red/20 pl-3 italic">
                      {l.resumen}
                    </p>
                  )}

                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-2xl font-black text-main-blue">${l.precio} <span className="text-xs font-medium text-gray-400">USD</span></span>
                    <Link to={`/comprar-libro/${l.slug}`} className="bg-main-blue hover:bg-light-blue text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-sm">Comprar</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {listaLibros.length === 0 && <p className="text-center text-gray-400 font-medium">No hay libros disponibles en este momento.</p>}
        </div>
      </main>
    );
  }

  if (!libro) return <div className="min-h-screen flex items-center justify-center font-bold text-main-red uppercase">Publicación no encontrada</div>;

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans text-center md:text-left">
      <PageHeader titulo="Finalizar Compra" subtitulo="Estás adquiriendo una publicación oficial de IIRESODH." />
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>
        <section className="relative pt-12 px-6 md:px-8 z-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            
            {/* PORTADA MUCHO MÁS PEQUEÑA (Reducida a md:w-3/12 y max-w-40) */}
            <div className="md:w-3/12 bg-gray-50/50 p-8 flex flex-col items-center justify-center border-r border-gray-100 shrink-0">
              <div className="w-full max-w-40 flex items-center justify-center">
                {libro.imagenPrincipalUrl ? (
                  <img src={libro.imagenPrincipalUrl} alt={libro.titulo} className="max-w-full max-h-64 object-contain rounded-lg shadow-md" />
                ) : (
                  <div className="w-32 h-48 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-main-blue font-bold p-4 text-center text-xs uppercase leading-tight">{libro.titulo}</div>
                )}
              </div>
            </div>

            {/* INFORMACIÓN DEL LIBRO + RESUMEN IA */}
            <div className="md:w-9/12 p-8 md:p-12 flex flex-col grow">
              <span className="text-xs font-black text-main-red uppercase tracking-widest mb-2 block">Confirmación de Pedido</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-2 leading-tight uppercase">{libro.titulo}</h2>
              
              {libro.autor && (
                <p className="text-gray-500 font-medium mb-6 italic text-sm">Escrito por: {libro.autor}</p>
              )}

              {libro.resumen && (
                <div className="mb-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 relative shadow-inner">
                   <svg className="absolute -top-3 -left-3 w-8 h-8 text-main-blue/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V4H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.017 21L2.017 18C2.017 16.8954 2.91238 16 4.017 16H7.017C7.56928 16 8.017 15.5523 8.017 15V9C8.017 8.44772 7.56928 8 7.017 8H3.017C2.46472 8 2.017 8.44772 2.017 9V11C2.017 11.5523 1.56928 12 1.017 12H0.017V4H10.017V15C10.017 18.3137 7.33072 21 4.017 21H2.017Z" /></svg>
                   <p className="text-gray-700 text-sm md:text-base leading-relaxed font-light italic">
                     {libro.resumen}
                   </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6 mt-auto">
                <Elements stripe={stripePromise}><FormularioPago libroId={libro.id} precio={libro.precio} titulo={libro.titulo} /></Elements>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}