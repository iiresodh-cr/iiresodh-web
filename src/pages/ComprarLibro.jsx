// src/pages/ComprarLibro.jsx
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";
import PageHeader from "../components/PageHeader";

// 🔴 REEMPLAZA CON TU CLAVE PÚBLICA DE STRIPE
const stripePromise = loadStripe("pk_test_TU_CLAVE_PUBLICA_AQUI");

// --- COMPONENTE DEL FORMULARIO DE PAGO ---
const FormularioPago = ({ libroId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Pedimos al backend el "clientSecret"
      const crearIntento = httpsCallable(functions, 'crearIntentoPago');
      const { data } = await crearIntento({ libroId });

      // 2. Confirmamos el pago directamente en el navegador con la tarjeta ingresada
      const resultadoPago = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // Aquí podrías agregar el nombre y correo si tienes inputs para ello
            name: 'Cliente Web',
          },
        },
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

  // Estilos personalizados para que el campo de tarjeta coincida con tu diseño
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1D3557', // Tu main-blue
        fontFamily: '"Work Sans", sans-serif',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#B92F32' }, // Tu main-red
    },
  };

  if (exito) {
    return (
      <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center border border-green-200">
        <h3 className="text-xl font-bold mb-2">¡Pago Exitoso!</h3>
        <p>Gracias por tu compra. Te hemos enviado un correo con los detalles para acceder a tu libro.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Datos de la Tarjeta
        </label>
        {/* Este es el campo seguro inyectado por Stripe */}
        <div className="bg-white p-3 rounded-lg border border-gray-300">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-main-red p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-main-red hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
      >
        {loading ? "Procesando pago..." : "Pagar $25.00 USD"}
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
  useEffect(() => { window.scrollTo(0, 0); }, []);

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
            
            {/* Columna Izquierda: Imagen del Libro */}
            <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center border-r border-gray-100">
              <div className="w-64 h-80 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-main-blue font-bold text-center p-4">
                Manual de Litigio Estratégico Internacional<br/><br/>(PDF)
              </div>
            </div>

            {/* Columna Derecha: Envoltorio de Stripe Elements */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-xs font-black text-main-red uppercase tracking-widest mb-2 block">
                Publicación Digital
              </span>
              <h2 className="text-2xl font-extrabold text-main-blue mb-6 leading-tight">
                Finalizar Compra
              </h2>
              
              {/* Aquí envolvemos el formulario con el provider de Stripe */}
              <Elements stripe={stripePromise}>
                <FormularioPago libroId="libro-derechos-humanos-01" />
              </Elements>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}