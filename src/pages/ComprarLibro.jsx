// src/pages/ComprarLibro.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db, functions } from "../firebase/config";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
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
      const { data } = await crearIntento({ libroId });

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
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Datos de la Tarjeta
        </label>
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

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        Pagos seguros cifrados y procesados por Stripe
      </div>
    </form>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function ComprarLibro() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchLibro = async () => {
      // 🛡️ REDIRECCIÓN: Si no hay slug en la URL, enviamos al usuario al catálogo de artículos
      if (!slug) {
        navigate("/articulos-academicos");
        return;
      }

      try {
        const q = query(collection(db, "libros"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setLibro({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          navigate("/articulos-academicos");
        }
      } catch (e) {
        console.error("Error cargando libro:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLibro();
  }, [slug, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-main-blue uppercase tracking-widest">Cargando publicación...</div>;
  if (!libro) return null;

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <PageHeader 
        titulo="Tienda Editorial" 
        subtitulo="Adquiere nuestras publicaciones y apoya la defensa de los derechos humanos." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-12 md:pt-16 px-6 md:px-8 z-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            
            <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center border-r border-gray-100">
              <div className="w-64 h-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {libro.imagenPrincipalUrl ? (
                  <img src={libro.imagenPrincipalUrl} alt={libro.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-main-blue font-bold text-center p-4">
                    {libro.titulo}
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-xs font-black text-main-red uppercase tracking-widest mb-2 block">
                Publicación Digital
              </span>
              <h2 className="text-2xl font-extrabold text-main-blue mb-6 leading-tight">
                {libro.titulo}
              </h2>
              
              <Elements stripe={stripePromise}>
                <FormularioPago 
                  libroId={libro.id} 
                  precio={libro.precio} 
                  titulo={libro.titulo} 
                />
              </Elements>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}