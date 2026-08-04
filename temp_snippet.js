export default function Home() {
  const { t, i18n } = useTranslation(); 
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacto, setContacto] = useState({ nombre: "", correo: "", mensaje: "" });
  const [estadoEnvio, setEstadoEnvio] = useState("idle");
  const [tituloHome, setTituloHome] = useState({
    tituloPrincipal: "",
    tituloPrincipal_en: "",
    tituloPrincipal_fr: ""
  });

  useEffect(() => {
    const fetchConfiguracionVisual = async () => {
      try {
        const docRef = doc(db, "configuracion", "home_visual");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTituloHome(docSnap.data());
        }
      } catch (e) {
        console.error("Error fetching configuracion", e);
      }
    };

    const fetchNoticias = async () => {
      try {
        const qPersistentes = query(collection(db, "noticias"), where("persistente", "==", true));
        const snapPersistentes = await getDocs(qPersistentes);
        let noticiasFijas = snapPersistentes.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3);
        
        let noticiasRecientes = [];
        const faltantes = 3 - noticiasFijas.length;
        if (faltantes > 0) {
          const qRecientes = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(10));
          const snapRecientes = await getDocs(qRecientes);
          const idsFijas = noticiasFijas.map(n => n.id);
          noticiasRecientes = snapRecientes.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(n => !idsFijas.includes(n.id))
            .slice(0, faltantes);
        }
        setNoticias([...noticiasFijas, ...noticiasRecientes]);

        // Preload the first image (Hero image)
        const firstNews = noticiasFijas.length > 0 ? noticiasFijas[0] : noticiasRecientes[0];
        if (firstNews && firstNews.imagenPrincipalUrl) {
          const preloadLink = document.createElement("link");
          preloadLink.href = firstNews.imagenPrincipalUrl;
          preloadLink.rel = "preload";
          preloadLink.as = "image";
          preloadLink.fetchPriority = "high";
          document.head.appendChild(preloadLink);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchNoticias();
    fetchConfiguracionVisual();
  }, []);

  