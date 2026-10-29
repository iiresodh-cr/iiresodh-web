// src/data/codigosPaisesTelefono.js

export const CODIGOS_PAISES_TELEFONO = [
  // --- AMÉRICA LATINA ---
  { id: "CR", pais: "Costa Rica", codigo: "+506", bandera: "🇨🇷", region: "latam", ejemplo: "8888 8888" },
  { id: "AR", pais: "Argentina", codigo: "+54", bandera: "🇦🇷", region: "latam", ejemplo: "9 11 2345 6789" },
  { id: "BO", pais: "Bolivia", codigo: "+591", bandera: "🇧🇴", region: "latam", ejemplo: "7123 4567" },
  { id: "BR", pais: "Brasil", codigo: "+55", bandera: "🇧🇷", region: "latam", ejemplo: "11 91234 5678" },
  { id: "CL", pais: "Chile", codigo: "+56", bandera: "🇨🇱", region: "latam", ejemplo: "9 1234 5678" },
  { id: "CO", pais: "Colombia", codigo: "+57", bandera: "🇨🇴", region: "latam", ejemplo: "300 123 4567" },
  { id: "CU", pais: "Cuba", codigo: "+53", bandera: "🇨🇺", region: "latam", ejemplo: "5 123 4567" },
  { id: "EC", pais: "Ecuador", codigo: "+593", bandera: "🇪🇨", region: "latam", ejemplo: "99 123 4567" },
  { id: "SV", pais: "El Salvador", codigo: "+503", bandera: "🇸🇻", region: "latam", ejemplo: "7012 3456" },
  { id: "GT", pais: "Guatemala", codigo: "+502", bandera: "🇬🇹", region: "latam", ejemplo: "5123 4567" },
  { id: "HN", pais: "Honduras", codigo: "+504", bandera: "🇭🇳", region: "latam", ejemplo: "9123 4567" },
  { id: "MX", pais: "México", codigo: "+52", bandera: "🇲🇽", region: "latam", ejemplo: "55 1234 5678" },
  { id: "NI", pais: "Nicaragua", codigo: "+505", bandera: "🇳🇮", region: "latam", ejemplo: "8123 4567" },
  { id: "PA", pais: "Panamá", codigo: "+507", bandera: "🇵🇦", region: "latam", ejemplo: "6123 4567" },
  { id: "PY", pais: "Paraguay", codigo: "+595", bandera: "🇵🇾", region: "latam", ejemplo: "981 123 456" },
  { id: "PE", pais: "Perú", codigo: "+51", bandera: "🇵🇪", region: "latam", ejemplo: "912 345 678" },
  { id: "PR", pais: "Puerto Rico", codigo: "+1", bandera: "🇵🇷", region: "latam", ejemplo: "787 123 4567" },
  { id: "DO", pais: "República Dominicana", codigo: "+1", bandera: "🇩🇴", region: "latam", ejemplo: "809 123 4567" },
  { id: "UY", pais: "Uruguay", codigo: "+598", bandera: "🇺🇾", region: "latam", ejemplo: "99 123 456" },
  { id: "VE", pais: "Venezuela", codigo: "+58", bandera: "🇻🇪", region: "latam", ejemplo: "412 123 4567" },

  // --- NORTEAMÉRICA ---
  { id: "US", pais: "Estados Unidos", codigo: "+1", bandera: "🇺🇸", region: "norteamerica", ejemplo: "202 555 0123" },
  { id: "CA", pais: "Canadá", codigo: "+1", bandera: "🇨🇦", region: "norteamerica", ejemplo: "416 123 4567" },

  // --- EUROPA ---
  { id: "IT", pais: "Italia", codigo: "+39", bandera: "🇮🇹", region: "europa", ejemplo: "312 345 6789" },
  { id: "ES", pais: "España", codigo: "+34", bandera: "🇪🇸", region: "europa", ejemplo: "612 345 678" },
  { id: "DE", pais: "Alemania", codigo: "+49", bandera: "🇩🇪", region: "europa", ejemplo: "151 2345 6789" },
  { id: "BE", pais: "Bélgica", codigo: "+32", bandera: "🇧🇪", region: "europa", ejemplo: "470 12 34 56" },
  { id: "FR", pais: "Francia", codigo: "+33", bandera: "🇫🇷", region: "europa", ejemplo: "6 12 34 56 78" },
  { id: "NL", pais: "Países Bajos", codigo: "+31", bandera: "🇳🇱", region: "europa", ejemplo: "6 1234 5678" },
  { id: "PT", pais: "Portugal", codigo: "+351", bandera: "🇵🇹", region: "europa", ejemplo: "912 345 678" },
  { id: "GB", pais: "Reino Unido", codigo: "+44", bandera: "🇬🇧", region: "europa", ejemplo: "7911 123456" },
  { id: "CH", pais: "Suiza", codigo: "+41", bandera: "🇨🇭", region: "europa", ejemplo: "79 123 45 67" },

  // --- OTROS ---
  { id: "OTRO", pais: "Otro país", codigo: "+", bandera: "🌐", region: "otro", ejemplo: "+código y número" }
];

export const GRUPOS_REGIONES = [
  { key: "latam", titulo: "América Latina" },
  { key: "norteamerica", titulo: "Norteamérica" },
  { key: "europa", titulo: "Europa" },
  { key: "otro", titulo: "Otros" }
];

/**
 * Busca el país por su identificador único (ej: "CR", "MX", "IT")
 */
export function buscarPaisPorId(id) {
  if (!id) return null;
  return CODIGOS_PAISES_TELEFONO.find((p) => p.id === id) || null;
}

/**
 * Detecta automáticamente si una cadena de texto contiene un código de país internacional al inicio
 * (ej: "+506 8888 8888" o "+393123456789") y devuelve el país coincidente y el número local.
 */
export function detectarPaisPorPrefijo(texto) {
  if (!texto || typeof texto !== "string") return null;
  const limpio = texto.trim();
  if (!limpio.startsWith("+")) return null;

  // Ordenar por longitud de código descendente para que +506 coincida antes que +5
  const candidatos = [...CODIGOS_PAISES_TELEFONO]
    .filter((p) => p.codigo !== "+")
    .sort((a, b) => b.codigo.length - a.codigo.length);

  for (const c of candidatos) {
    if (limpio.startsWith(c.codigo)) {
      const resto = limpio.slice(c.codigo.length).replace(/^[\s-]+/, "");
      return { pais: c, numeroRestante: resto };
    }
  }

  return null;
}
