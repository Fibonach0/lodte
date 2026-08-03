/*
 * ============================================================
 *  LODTE — Datos de contenido del sitio
 * ============================================================
 *  
 *  Este archivo contiene TODOS los datos editables del sitio.
 *  Para agregar campañas, personajes, recetas, crónicas, etc.
 *  solo necesitás editar este archivo.
 *
 *  NO hace falta tocar index.html ni los archivos de CSS/JS.
 *
 *  Estructura:
 *    - SITE_CONFIG: datos generales del sitio
 *    - MEMBERS: integrantes de LODTE
 *    - CAMPAIGNS: campañas jugadas
 *    - TOOLS: herramientas y juegos
 *    - RECIPES: recetas de Banquetes y Leyendas
 *    - FORNHEIM_SECTIONS: secciones del mundo de Fornheim
 *    - COMMUNITY_LINES: líneas futuras del proyecto
 *    - CHRONICLES: crónicas de sesión (próximamente)
 *    - CHARACTERS: personajes (próximamente)
 *
 * ============================================================
 */

const SITE_DATA = {

  // ──────────────────────────────────────────
  // Configuración general
  // ──────────────────────────────────────────
  config: {
    siteName: "La Orden del Tabernero Errante",
    shortName: "LODTE",
    domain: "lodte.com.ar",
    contactEmail: "marcos.caro.92@gmail.com",
    instagram: "https://www.instagram.com/thedungeonarchives/",
    instagramHandle: "@thedungeonarchives",
    youtube: "https://www.youtube.com/@LODTE",
    youtubeHandle: "@LODTE",
    recipeDocUrl: "https://docs.google.com/document/d/1DWd6PNr9vd6UFSqKb1kaIE7KHNn_JTI0yVkCS3QATd8/edit",
    tagline: "Campañas, crónicas y mundos compartidos de Calabozos y Dragones.",
    description: "Un archivo vivo de aventuras nacidas entre dados, mapas, decisiones imposibles y fuego de taberna.",
  },

  // ──────────────────────────────────────────
  // Integrantes de LODTE
  // Para agregar un miembro, copiá un bloque y completá los campos.
  // ──────────────────────────────────────────
  // url: link al perfil externo del miembro (GitHub, Instagram, LinkedIn, etc.)
  //      Si no tiene, dejá "" y la card no será clickeable.
  members: [
    {
      name: "Marcos Caro",
      role: "DM & Jugador",
      campaigns: "What is Dead May Never Die",
      extra: "Creador de The Dungeon Archives",
      url: "https://www.instagram.com/thedungeonarchives/",
    },
    {
      name: "Santiago Agostinelli",
      role: "DM & Creador de Fornheim",
      campaigns: "El Lamento de las Doncellas",
      extra: "",
      url: "https://www.instagram.com/hojaenbarco/",
    },
    {
      name: "Federico Diaz Sparta",
      role: "DM & Game Developer",
      campaigns: "",
      extra: "",
      url: "https://github.com/FDiazsparta",
    },
    {
      name: "Ignacio Antuña",
      role: "Jugador & Desarrollador",
      campaigns: "",
      extra: "Creador del sitio original de LODTE",
      url: "https://github.com/Fibonach0",
    },
    {
      name: "Juan Ignacio Bide",
      role: "El Tabernero",
      campaigns: "",
      extra: "",
      url: "https://www.linkedin.com/in/juanibide/",
    },
    {
      name: "Martín Morillo",
      role: "Jugador",
      campaigns: "",
      extra: "",
      url: "https://www.instagram.com/martinmorillo19/",
    },
    {
      name: "Ulises Saggion Zyupas",
      role: "DM & Jugador",
      campaigns: "Rough Sails, Solaris 3",
      extra: "",
      url: "https://www.instagram.com/ulersag/",
    },
    {
      name: "Rodolfo Agustín García",
      role: "DM & Desarrollador",
      campaigns: "Echoes First Call, The Land Before Time",
      extra: "Desarrollador del ecosistema de herramientas LODTE",
      url: "https://github.com/ragustingarcia",
    },
  ],

  // ──────────────────────────────────────────
  // Campañas
  // Para agregar una campaña, copiá un bloque y completá.
  //
  // Campos obligatorios: id, title, dm, status, setting, tone, desc.
  // Campos OPCIONALES (si no los ponés, simplemente no se muestran):
  //   startDate:    "2024" o "Marzo 2024"  → cuándo arrancó
  //   sessions:     12                      → cantidad de sesiones jugadas
  //   players:      ["Nombre 1", "Nombre 2"]→ jugadores en la mesa
  //   dndBeyondUrl: "https://www.dndbeyond.com/campaigns/XXXXXXX" → botón "Ver en D&D Beyond"
  //   maps:         [ { img: "assets/img/mapas/<carpeta>/mapa.jpg", title: "Región X" } ]
  //                 → galería de mapas (subí las imágenes a assets/img/mapas/; ver ese README)
  //   Los LOGS de sesión de cada campaña van en la sección "chronicles" (más abajo),
  //   enlazados por el campo "campaign" = el title EXACTO de la campaña.
  // ──────────────────────────────────────────
  campaigns: [
    {
      id: 1,
      title: "What is Dead May Never Die",
      dm: "Marcos Caro",
      status: "Completar",
      setting: "Fornheim",
      tone: "Memoria, amenaza latente",
      desc: "Una campaña cuyo título ya sugiere persistencia, retorno y conflicto con aquello que se niega a desaparecer. Un territorio ideal para trabajar temas de memoria, amenaza latente y consecuencias que sobreviven al tiempo.",
    },
    {
      id: 2,
      title: "El Lamento de las Doncellas",
      dm: "Santiago Agostinelli",
      status: "Completar",
      setting: "Fornheim / Gotland",
      tone: "Épica, guerra, intriga",
      desc: "En una Fornheim quebrada por la guerra, un grupo improvisado de aventureros acepta escoltar a una princesa hacia Verna, capital de Gotland, para descubrir por qué su tierra natal se encuentra aislada e incomunicada.",
    },
    {
      id: 3,
      title: "Rough Sails",
      dm: "Ulises Saggion Zyupas",
      status: "Completar",
      setting: "Fornheim",
      tone: "Marítima, supervivencia",
      desc: "Una campaña que sugiere travesía, inestabilidad, riesgo y decisión bajo presión. Rutas inciertas, vínculos tensos, supervivencia y horizontes cambiantes.",
    },
    {
      id: 4,
      title: "Echoes First Call",
      dm: "Rodolfo Agustín García",
      status: "Completar",
      setting: "Fornheim",
      tone: "Resonancia, origen",
      desc: "Una campaña cuyo nombre convoca resonancia, origen y llamado. El eco de antiguos acontecimientos, la activación de fuerzas dormidas o el inicio de una búsqueda con consecuencias amplias.",
      // ── Campos opcionales (ejemplo / piloto — completá o ajustá) ──
      dndBeyondUrl: "https://www.dndbeyond.com/campaigns/8001251",
      // startDate: "2024",
      // sessions: 0,
      // players: ["..."],
      maps: [
        // Subí las imágenes a assets/img/mapas/echoes-first-call/ y descomentá:
        // { img: "assets/img/mapas/echoes-first-call/mapa-region-inicial.jpg", title: "Región inicial" },
      ],
    },
    {
      id: 5,
      title: "The Land Before Time",
      dm: "Rodolfo Agustín García",
      status: "Completar",
      setting: "Fornheim",
      tone: "Exploración, lo primordial",
      desc: "Un título que abre una dimensión de antigüedad, origen y confrontación con tiempos remotos. Exploración histórica, ruinas, eras previas o territorios marcados por lo primordial.",
    },
    {
      id: 6,
      title: "Solaris 3",
      dm: "Ulises Saggion Zyupas",
      status: "Completar",
      setting: "Otro",
      tone: "Expansión, nueva escala",
      desc: "Una campaña asociada a expansión de universo, nuevas escalas o marcos menos convencionales dentro del repertorio narrativo del grupo.",
    },
  ],

  // ──────────────────────────────────────────
  // Tools & Games
  // Para agregar una herramienta o juego, copiá un bloque.
  // ──────────────────────────────────────────
  tools: [
    {
      name: "El Códice del Tabernero",
      url: "https://elcodicedeltabernero.netlify.app/",
      desc: "Compendio digital de reglas, referencias y herramientas para el Dungeon Master.",
      icon: "📜",
      type: "tool",
    },
    {
      name: "Los Dados del Tabernero",
      url: "https://losdadosdeltabernero.netlify.app/",
      desc: "Tirador de dados virtual con estética LODTE para tus sesiones.",
      icon: "🎲",
      type: "tool",
    },
    {
      name: "Sala de Mapas Online",
      url: "https://lodte-sala-de-mapas.onrender.com/",
      desc: "Herramienta de mapas compartidos en tiempo real con fog of war y tokens.",
      icon: "🗺️",
      type: "tool",
    },
    {
      name: "Goblin King",
      url: "https://velizor.ai/games/goblin_king.html",
      desc: "Juego de estrategia y supervivencia ambientado en un mundo de goblins y caos.",
      icon: "👑",
      type: "game",
    },
  ],

  // ──────────────────────────────────────────
  // Recetas — Banquetes y Leyendas
  // ──────────────────────────────────────────
  recipes: [
    {
      title: "Estofado del Cazador de Fornheim",
      serves: "8 aventureros",
      origin: "Bosques profundos de Fornheim",
      lore: "Cazadores valientes preparaban este estofado después de largas jornadas persiguiendo ciervos legendarios. La receta, heredada de generación en generación, simboliza el respeto por la presa cazada y la riqueza del bosque. Compartirlo alrededor del fuego es tradición para sellar amistades duraderas.",
    },
    {
      title: "Cocido Montañés del Viejo Reino",
      serves: "8 aventureros",
      origin: "Pasos nevados de Fornheim",
      lore: "Preparado originalmente por los guardias de los pasos nevados de Fornheim, el Cocido Montañés es el plato que alimentó a los vigías del Muro de Piedra Negra. Su receta fue guardada en pergaminos viejos por los taberneros errantes, restaurando el cuerpo, el ánimo y la hermandad en los días más fríos.",
    },
    {
      title: "Countryside Casserole del Valle del Roble Viejo",
      serves: "8 aventureros",
      origin: "Valles del sur de Fornheim",
      lore: "Nació entre los hogares de campesinos y cazadores del sur. La cerveza negra, infaltable en la región, era tanto para el cocinero como para el guiso, y el conejo, atrapado en los claros de luna, era tratado con respeto. Celebra la alianza entre humano y naturaleza.",
    },
    {
      title: "Borscht de Ossobuco del Asedio de Vatnaborg",
      serves: "10 aventureros",
      origin: "Vatnaborg, la Perla del Norte",
      lore: "Durante el duro sitio de Vatnaborg, las matronas gautas idearon este borscht robusto combinando ossobuco de las reservas reales con remolachas cultivadas en invernaderos improvisados. El rojo intenso del guiso se volvió un estandarte: fuego, sangre, vida.",
    },
  ],

  // ──────────────────────────────────────────
  // Secciones de Fornheim
  // Para agregar una sección, copiá un bloque.
  // Cuando quieras expandir una sección, agregá el campo "content"
  // con el texto completo en HTML.
  // ──────────────────────────────────────────
  fornheim_sections: [
    {
      title: "Historia y cronología",
      desc: "Las eras, guerras y eventos que forjaron Fornheim.",
      content: null, // Cuando tengas contenido, reemplazá null con el texto HTML
    },
    {
      title: "Regiones",
      desc: "Gotland, los pasos nevados, las costas y más territorios.",
      content: null,
    },
    {
      title: "Culturas y pueblos",
      desc: "Gautas, clanes del norte, pueblos del sur y más.",
      content: null,
    },
    {
      title: "Panteón Tolfrádico",
      desc: "Los dioses que ordenan la fe, la guerra y el destino.",
      content: null,
    },
    {
      title: "Facciones",
      desc: "Casas nobles, órdenes, gremios y alianzas.",
      content: null,
    },
    {
      title: "Atlas",
      desc: "Mapas del mundo, regiones y zonas de aventura.",
      content: null,
    },
  ],

  // ──────────────────────────────────────────
  // Líneas futuras — Comunidad
  // ──────────────────────────────────────────
  community_lines: [
    { title: "Mesas Abiertas", desc: "Sesiones para nuevos jugadores y veteranos." },
    { title: "Talleres", desc: "Introducción al rol, worldbuilding y narrativa." },
    { title: "Recursos para DMs", desc: "Materiales descargables, guías y herramientas." },
    { title: "Eventos", desc: "Encuentros temáticos y celebraciones de campaña." },
    { title: "Laboratorio", desc: "Experimentación con nuevos mundos y formatos." },
    { title: "Material físico", desc: "Miniaturas, mapas, escenografías y más." },
  ],

  // ──────────────────────────────────────────
  // Crónicas de sesión = el LOG de cada campaña
  // Cada entrada es una sesión. El campo "campaign" debe coincidir EXACTO con
  // el title de la campaña (así aparece dentro de esa campaña, en Campañas → Ver más).
  // Se ordenan por número de sesión. Campos opcionales: characters, keyEvents, consequences.
  // ──────────────────────────────────────────
  chronicles: [
    {
      campaign: "Echoes First Call", // ← debe ser IGUAL al title de la campaña
      session: 1,
      title: "Ejemplo — El primer eco",
      date: "2024-01-01",
      dm: "Rodolfo Agustín García",
      characters: [], // opcional: ["Nombre del PJ", ...]
      summary: "Entrada de EJEMPLO para mostrar cómo se ve un log de sesión. Reemplazá este texto con el resumen real: qué hicieron los personajes, a dónde llegaron, qué decisiones tomaron.",
      keyEvents: ["Evento clave 1 (editá)", "Evento clave 2 (editá)"],
      consequences: "Qué cambió en el mundo tras la sesión (opcional).",
    },
    // Copiá el bloque de arriba para cada sesión de cualquier campaña.
  ],

  // ──────────────────────────────────────────
  // Personajes
  // Para agregar un personaje, copiá el bloque de ejemplo.
  // ──────────────────────────────────────────
  characters: [
    // Ejemplo:
    // {
    //   name: "Nombre del PJ",
    //   campaign: "Campaña",
    //   player: "Nombre del jugador",
    //   race: "Humano",
    //   class: "Guerrero",
    //   status: "Activo",
    //   summary: "Breve descripción del personaje...",
    //   traits: ["Rasgo 1", "Rasgo 2"],
    //   quote: "Frase memorable...",
    // },
  ],

};
