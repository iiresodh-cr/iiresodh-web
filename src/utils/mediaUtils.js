// src/utils/mediaUtils.js

/**
 * Detecta y extrae información sobre un recurso multimedia (video o imagen).
 * Soporta YouTube, Vimeo, archivos directos de video (mp4, webm, mov, ogg) y Firebase Storage.
 */
export const obtenerInfoVideo = (url = "") => {
  if (!url) return { esVideo: false };
  const str = String(url).trim();

  // YouTube
  const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      esVideo: true,
      tipoVideo: "youtube",
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1`,
      miniatura: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Vimeo
  const vimeoMatch = str.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      esVideo: true,
      tipoVideo: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
      miniatura: null
    };
  }

  // Archivo directo de video o Firebase Storage video
  const esArchivoVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(str) ||
    str.includes("/videos%2F") ||
    str.includes("/videos/");
  if (esArchivoVideo) {
    return {
      esVideo: true,
      tipoVideo: "directo",
      url: str,
      miniatura: null
    };
  }

  return { esVideo: false };
};
