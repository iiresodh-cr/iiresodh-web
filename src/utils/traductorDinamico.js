// src/utils/traductorDinamico.js

/**
 * Función mágica para leer el campo correcto de Firebase según el idioma
 * @param {Object} documento - El objeto completo de Firebase (ej. la noticia)
 * @param {String} campoBase - El nombre del campo original (ej. 'titulo', 'contenido')
 * @param {String} idiomaActual - El idioma activo en i18next (ej. 'es', 'en', 'fr')
 * @returns {String} - El texto en el idioma correcto, o el original si no hay traducción
 */
export const obtenerTextoTraducido = (documento, campoBase, idiomaActual) => {
  // Si no hay documento o no existe el campo, devolvemos vacío
  if (!documento || !documento[campoBase]) return "";

  // Si el idioma es español (o no está definido), devolvemos el campo original
  if (!idiomaActual || idiomaActual === 'es') {
    return documento[campoBase];
  }

  // Si el idioma es inglés o francés, buscamos el campo traducido (ej. titulo_en)
  const campoTraducido = `${campoBase}_${idiomaActual}`;

  // Si la traducción existe, la devolvemos. Si no (tal vez no se ha traducido aún), 
  // devolvemos el campo original en español como "salvavidas".
  return documento[campoTraducido] || documento[campoBase];
};