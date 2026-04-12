# ⚔ La Orden del Tabernero Errante

> *Donde los dados ruedan, las historias nacen y los mundos no olvidan.*

---

## Qué es esto

Este repositorio alberga el sitio oficial de **LODTE — La Orden del Tabernero Errante**, un grupo de amigos y creadores unidos por una pasión inquebrantable hacia Calabozos y Dragones.

Desde las primeras tiradas de dados en mesas improvisadas hasta la forja de **Fornheim** —un mundo entero nacido de la imaginación colectiva—, LODTE ha crecido en ambición, profundidad y alcance. Este sitio es el reflejo digital de esa aventura: un archivo vivo donde se entrelazan campañas, crónicas, personajes, mapas, recetas de taberna y herramientas forjadas en código y fuego.

🌐 **[www.lodte.com.ar](https://www.lodte.com.ar/)**

---

## La Forja del Sitio

Este dominio fue levantado por primera vez por **Ignacio Antuña**, quien con ingenio y determinación encontró la manera de que GitHub Pages sirviera como bastión gratuito para nuestra presencia en la red. Configuró Cloudflare como administrador de DNS, apuntó el registro CNAME a `Fibonach0.github.io`, y así nació el primer hogar digital de la Orden.

Sobre esos cimientos se construyó la versión actual: una web completa con estética pixel-art medieval, navegación fluida, contenido expandible directamente desde el repositorio y acceso a todas las herramientas del ecosistema LODTE.

---

## Estructura del Repositorio

```
lodte/
├── index.html              ← Página principal (no necesita edición frecuente)
├── CNAME                   ← Configuración de dominio (NO MODIFICAR)
├── content/
│   └── site-data.js        ← ✏️ TODOS los datos editables del sitio
├── assets/
│   ├── css/
│   │   └── styles.css      ← Estilos (pixel-art medieval)
│   ├── js/
│   │   └── app.js          ← Motor de renderizado del sitio
│   └── img/
│       ├── og-image.png    ← Imagen para redes sociales
│       └── favicon.png     ← Favicon del sitio
└── README.md               ← Estás aquí, aventurero
```

---

## Cómo Agregar Contenido

**No necesitás tocar código.** Todo el contenido del sitio vive en un solo archivo:

### 📜 `content/site-data.js`

Abrí este archivo y vas a encontrar secciones claramente marcadas con instrucciones:

| Sección | Qué contiene | Cómo agregar |
|---------|-------------|--------------|
| `members` | Integrantes de LODTE | Copiá un bloque y completá los campos |
| `campaigns` | Campañas jugadas | Copiá un bloque, poné título, DM, descripción |
| `tools` | Herramientas y juegos | Copiá un bloque con nombre, URL y descripción |
| `recipes` | Recetas de Banquetes y Leyendas | Copiá un bloque con título, origen y lore |
| `fornheim_sections` | Secciones del mundo de Fornheim | Reemplazá `null` en `content` con texto HTML |
| `chronicles` | Crónicas de sesión | Descomentá el ejemplo y completá |
| `characters` | Personajes | Descomentá el ejemplo y completá |
| `community_lines` | Líneas futuras del proyecto | Agregá títulos y descripciones |
| `config` | Datos generales (email, redes, links) | Editá los valores según necesites |

### Ejemplo: Agregar una nueva campaña

Abrí `content/site-data.js`, buscá la sección `campaigns` y agregá un bloque:

```javascript
{
  id: 7,
  title: "El Nombre de tu Campaña",
  dm: "Nombre del DM",
  status: "Activa",
  setting: "Fornheim",
  tone: "Exploración, misterio",
  desc: "Una breve sinopsis sin spoilers de la campaña...",
},
```

Guardá, pusheá, y el sitio se actualiza solo.

### Ejemplo: Expandir una sección de Fornheim

Buscá `fornheim_sections` y reemplazá `content: null` con HTML:

```javascript
{
  title: "Historia y cronología",
  desc: "Las eras, guerras y eventos que forjaron Fornheim.",
  content: "<p>Fornheim fue fundado en la Era de los Clanes...</p><p>La Gran Guerra del Norte cambió todo...</p>",
},
```

---

## El Ecosistema LODTE

El sitio conecta con las herramientas digitales forjadas por la Orden:

| Herramienta | Descripción | Link |
|-------------|-------------|------|
| 📜 **El Códice del Tabernero** | Compendio de reglas y referencias para el DM | [elcodicedeltabernero.netlify.app](https://elcodicedeltabernero.netlify.app/) |
| 🎲 **Los Dados del Tabernero** | Tirador de dados virtual con estética LODTE | [losdadosdeltabernero.netlify.app](https://losdadosdeltabernero.netlify.app/) |
| 🗺️ **Sala de Mapas Online** | Mapas compartidos en tiempo real con fog of war | [lodte-sala-de-mapas.onrender.com](https://lodte-sala-de-mapas.onrender.com/) |
| 👑 **Goblin King** | Juego de estrategia y supervivencia goblin | [velizor.ai/games/goblin_king.html](https://velizor.ai/games/goblin_king.html) |

---

## Redes y Contacto

- 🌐 **Web:** [www.lodte.com.ar](https://www.lodte.com.ar/)
- 📸 **Instagram:** [@thedungeonarchives](https://www.instagram.com/thedungeonarchives/) — administrado por Marcos Caro
- 📧 **Contacto:** marcos.caro.92@gmail.com

---

## Importante: El archivo CNAME

> ⚠️ **NO MODIFICAR NI ELIMINAR el archivo `CNAME`.**

Este archivo contiene `www.lodte.com.ar` y es lo que conecta el repositorio de GitHub con nuestro dominio personalizado a través de Cloudflare. Sin él, el sitio deja de funcionar en lodte.com.ar.

---

## Hosting y Configuración Técnica

- **Hosting:** GitHub Pages (gratuito)
- **DNS:** Cloudflare con registro CNAME apuntando a `Fibonach0.github.io`
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks, sin build steps)
- **SEO:** Meta tags completos, Open Graph, Twitter Cards, JSON-LD structured data
- **Formulario de contacto:** [FormSubmit.co](https://formsubmit.co/) (envía a marcos.caro.92@gmail.com)

---

## La Orden del Tabernero Errante

*Ocho almas que se sentaron alrededor de una mesa y decidieron que el mundo que imaginaban merecía existir más allá de una noche de dados.*

### Fundadores y Colaboradores

| Nombre | Rol |
|--------|-----|
| **Ignacio Antuña** | Jugador & Desarrollador — *Creador del sitio original de LODTE* |
| **Marcos Caro** | DM & Jugador — *Creador de The Dungeon Archives* |
| **Santiago Agostinelli** | DM & Creador de Fornheim |
| **Federico Diaz Sparta** | DM & Game Developer |
| **Juan Ignacio Bide** | El Tabernero |
| **Martín Morillo** | Jugador |
| **Ulises Saggion Zyupas** | DM & Jugador |
| **Rodolfo Agustín García** | DM & Desarrollador — *Desarrollador del ecosistema de herramientas LODTE* |

---

## Banquetes y Leyendas

Porque toda aventura que se precie empieza —o termina— con un buen estofado y una jarra de cerveza negra al lado del fuego.

📖 [Ver el recetario completo](https://docs.google.com/document/d/1DWd6PNr9vd6UFSqKb1kaIE7KHNn_JTI0yVkCS3QATd8/edit)

---

## Licencia

Contenido narrativo y material de archivo desarrollado por LODTE.
Sistema de referencia: Dungeons & Dragons 5e.

*Toda campaña deja huellas. Toda mesa crea su mitología. Este repositorio es el lugar donde esas huellas empiezan a ordenarse.*

---

⚔ **La Orden del Tabernero Errante** — *Fornheim aguarda.*
