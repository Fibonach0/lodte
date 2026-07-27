/**
 * El Tabernero — la taberna, para www.lodte.com.ar
 *
 * Escena 8 bits a pantalla completa: el Tabernero detrás de la barra, el fuego
 * del hogar, y una caja de diálogo con texto libre. Sin dependencias.
 *
 * La escena se dibuja a 320x180 y se escala con image-rendering: pixelated, que
 * es lo que le da el pixelado duro y parejo. Todo lo estático se pinta una sola
 * vez en un canvas aparte; por cuadro solo se redibuja lo que se mueve.
 *
 * Uso:
 *   <script src="assets/js/tabernero.js" data-endpoint="https://…workers.dev" defer></script>
 */

(function () {
  "use strict";

  const script = document.currentScript;
  const ENDPOINT = (script?.dataset.endpoint ?? "").replace(/\/$/, "");
  if (!ENDPOINT) {
    console.warn("[El Tabernero] Sin data-endpoint: se usa el mismo origen.");
  }

  const SALUDO =
    "Sentaos, buen forastero. Soy el Tabernero, y guardo las crónicas de la Orden. " +
    "Preguntad por las campañas, por Fornheim, por quienes se sientan a esta mesa, " +
    "o por lo que hierve en la olla.";

  const SUGERENCIAS = [
    "¿Quiénes forman la Orden?",
    "Habladme de Fornheim",
    "¿Qué campañas se han jugado?",
    "¿Qué se cocina aquí?",
  ];

  // ── Escena ────────────────────────────────────────────────────────────────
  const W = 480, H = 270;          // resolución interna, se escala por CSS
  const SUELO = 159;               // y de la tapa de la barra

  const C = {
    negro:    "#0A0703",
    pared1:   "#241a09",
    pared2:   "#2e2210",
    junta:    "#160f05",
    barra:    "#4a3410",
    barraTapa:"#6b5020",
    barraLuz: "#8B6914",
    oro:      "#D4A844",
    oroTenue: "#8B6914",
    hueso:    "#F5E6C8",
    fuego1:   "#6B1A1A",
    fuego2:   "#C44040",
    fuego3:   "#D4A844",
    fuego4:   "#F5E6C8",
    vidrio1:  "#3f5a34",
    vidrio2:  "#6b4a1a",
    vidrio3:  "#5a2a2a",
  };

  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPRITES_B64 = {
    idle:
      "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",
    habla:
      "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",
    saludo:
      "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",
  };

  const sprites = {};
  let fondo = null;                 // canvas offscreen con lo estático
  let ctx, canvas, raf = null, t0 = 0;
  let estado = "saludo";            // saludo | idle | habla
  let chispas = [], humo = [];

  function cargarSprites() {
    return Promise.all(
      Object.entries(SPRITES_B64).map(
        ([k, b64]) =>
          new Promise((res) => {
            const im = new Image();
            im.onload = () => { sprites[k] = im; res(); };
            im.onerror = () => res();
            im.src = "data:image/png;base64," + b64;
          }),
      ),
    );
  }

  /** Todo lo que no se mueve: pared, estantes, botellas, barra. */
  function pintarFondo() {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");

    g.fillStyle = C.pared1; g.fillRect(0, 0, W, H);

    // Tablones verticales. Cada uno con su tono: dos alternados se leen como
    // papel pintado, no como madera.
    const tono = ["#241a09", "#2e2210", "#2a1e0c", "#332614", "#261b0b"];
    for (let x = 0, i = 0; x < W; x += 24, i++) {
      g.fillStyle = tono[(i * 7 + 3) % tono.length];
      g.fillRect(x, 0, 23, SUELO);
      g.fillStyle = C.junta;
      g.fillRect(x + 23, 0, 1, SUELO);
      g.fillStyle = "rgba(0,0,0,.16)";              // veta
      g.fillRect(x + 6 + (i % 3) * 2, 0, 2, SUELO);
    }
    g.fillStyle = C.junta;                          // vigas
    for (const y of [39, 99]) g.fillRect(0, y, W, 3);

    // Luz del hogar: cae sobre la pared y se apaga con la distancia. Sin esto
    // el fuego es un adorno que no ilumina nada.
    const luz = g.createRadialGradient(75, 111, 9, 75, 111, 252);
    luz.addColorStop(0, "rgba(212,168,68,.30)");
    luz.addColorStop(0.35, "rgba(196,120,50,.14)");
    luz.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = luz; g.fillRect(0, 0, W, SUELO);

    // ── Hogar, a la izquierda ───────────────────────────────────────────────
    g.fillStyle = C.junta;   g.fillRect(15, 39, 117, 114);
    g.fillStyle = "#170f04"; g.fillRect(21, 45, 105, 108);
    g.fillStyle = C.barra;     g.fillRect(12, 33, 123, 8);      // dintel
    g.fillStyle = C.barraTapa; g.fillRect(12, 33, 123, 2);
    g.fillStyle = "#3a2a12";                                    // leños
    g.fillRect(33, 141, 81, 9);
    g.fillRect(42, 132, 60, 8);
    g.fillStyle = "#241a0a";
    g.fillRect(33, 141, 81, 3);
    // Morillos de hierro, a los costados
    g.fillStyle = "#1a1409";
    g.fillRect(27, 126, 5, 27); g.fillRect(115, 126, 5, 27);
    g.fillRect(24, 120, 11, 7); g.fillRect(112, 120, 11, 7);
    // Caldero colgado de la barra: llena el hueco y da el olor a guiso
    g.fillStyle = "#181209"; g.fillRect(24, 51, 99, 4);          // barra
    g.fillRect(70, 55, 3, 12);                                    // gancho
    g.fillStyle = "#2b2b30"; g.fillRect(52, 67, 39, 30);
    g.fillStyle = "#3d3d44"; g.fillRect(52, 67, 15, 30);
    g.fillStyle = "#55555e"; g.fillRect(55, 70, 5, 24);
    g.fillStyle = "#1c1c20"; g.fillRect(49, 64, 45, 6);           // borde
    g.fillRect(55, 97, 33, 4);                                    // fondo

    // ── Cartel, sobre el hogar ──────────────────────────────────────────────
    // Va aquí y no en el centro: en el centro le tapaba la cabeza al Tabernero.
    g.fillStyle = C.barra;      g.fillRect(20, 6, 108, 22);
    g.fillStyle = C.barraTapa;  g.fillRect(20, 6, 108, 2);
    g.fillStyle = C.junta;      g.fillRect(20, 26, 108, 2);
    g.fillStyle = C.oro;
    g.font = "12px 'Press Start 2P', monospace";
    g.textAlign = "center";
    g.fillText("LODTE", 74, 22);
    g.textAlign = "left";

    // ── Estantes, a la derecha ──────────────────────────────────────────────
    const botellas = [
      [324, C.vidrio1, 17], [336, C.vidrio2, 13], [346, C.vidrio3, 18],
      [360, C.vidrio1, 12], [375, C.vidrio2, 17], [388, C.vidrio3, 13],
      [402, C.vidrio1, 18], [415, C.vidrio2, 15], [429, C.vidrio3, 12],
      [442, C.vidrio1, 17],
    ];
    for (const y of [48, 96]) {
      g.fillStyle = C.barra;      g.fillRect(312, y + 21, 150, 5);
      g.fillStyle = C.barraTapa;  g.fillRect(312, y + 21, 150, 2);
      for (const [x, col, alto] of botellas) {
        if ((x + y) % 3 === 0) continue;         // huecos, que no quede parejo
        g.fillStyle = col;
        g.fillRect(x, y + 21 - alto, 6, alto);
        g.fillStyle = C.junta;
        g.fillRect(x + 2, y + 21 - alto - 3, 3, 3);   // cuello
      }
    }

    fondo = c;
  }

  /**
   * El mostrador va delante del Tabernero, no detrás: si se dibuja con el resto
   * del fondo, el sprite le queda encima y el personaje parece flotar.
   */
  function pintarBarra(g) {
    // Frente oscuro y saturado: separa el primer plano del fondo por valor.
    g.fillStyle = "#2b1d08";   g.fillRect(0, SUELO, W, H - SUELO);
    // Tapa: canto iluminado arriba, sombra proyectada debajo
    g.fillStyle = C.barraLuz;  g.fillRect(0, SUELO, W, 2);
    g.fillStyle = C.barraTapa; g.fillRect(0, SUELO + 2, W, 4);
    g.fillStyle = C.barra;     g.fillRect(0, SUELO + 6, W, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(0, SUELO + 9, W, 3);
    for (let x = 6; x < W - 9; x += 45) {                  // paneles del frente
      g.fillStyle = "#3a280d";
      g.fillRect(x, SUELO + 17, 36, H - SUELO - 22);
      g.fillStyle = "#1d1305";
      g.fillRect(x, SUELO + 17, 36, 2);
      g.fillRect(x, SUELO + 17, 2, H - SUELO - 22);
    }
  }

  /**
   * Fuego por columnas.
   *
   * Cada columna lleva su propia fase y su propio factor: con una sola onda
   * compartida las cuatro capas suben y bajan a la vez y el resultado es una
   * pirámide roja, no una llama.
   */
  function pintarFuego(g, t) {
    const base = 150, x0 = 33, ancho = 81, paso = 3;
    const capas = [
      [C.fuego1, 1.00, 54], [C.fuego2, 0.74, 41],
      [C.fuego3, 0.48, 26], [C.fuego4, 0.24, 13],
    ];
    for (const [col, esc, alto] of capas) {
      g.fillStyle = col;
      for (let i = 0; i < ancho; i += paso) {
        const x = x0 + i;
        const u = i / ancho;
        // Perfil de brasero: ancho abajo, con dos crestas en vez de un pico.
        const perfil = 0.45 + 0.55 * Math.sin(Math.PI * u) * (0.8 + 0.3 * Math.cos(u * 9));
        const onda =
          Math.sin(t / 150 + i * 0.9) * 0.55 +
          Math.sin(t / 71 + i * 2.3) * 0.30 +
          Math.sin(t / 233 + i * 0.4) * 0.35;
        const h = Math.max(0, alto * esc * (perfil + onda * 0.30));
        g.fillRect(x, base - Math.round(h), paso, Math.round(h));
      }
    }
    // Brasas en el leño
    g.fillStyle = C.fuego3;
    for (let i = 0; i < 8; i++) {
      const x = 39 + i * 9;
      if (Math.sin(t / 300 + i * 2.1) > 0.2) g.fillRect(x, 143, 3, 3);
    }
    g.globalAlpha = 0.13 + Math.sin(t / 260) * 0.05;   // resplandor sobre la barra
    g.fillStyle = C.fuego3;
    g.fillRect(6, SUELO, 150, 6);
    g.globalAlpha = 1;
  }

  /**
   * Cacharros sobre la tapa, por delante del Tabernero.
   *
   * Van pegados a los bordes de su silueta a propósito: solapar el primer plano
   * con el personaje es lo que da profundidad a una escena plana.
   */
  function pintarCacharros(g, t) {
    const jx = 150, jy = SUELO - 28;                  // jarra de peltre
    g.fillStyle = "#4a3d22"; g.fillRect(jx, jy, 26, 28);
    g.fillStyle = "#6b5730"; g.fillRect(jx, jy, 11, 28);
    g.fillStyle = "#8a7442"; g.fillRect(jx + 2, jy + 2, 4, 25);
    g.fillStyle = "#33290f"; g.fillRect(jx + 26, jy + 6, 7, 4);
    g.fillRect(jx + 30, jy + 10, 3, 9);
    g.fillRect(jx + 26, jy + 19, 7, 4);
    g.fillStyle = "#d8c8a0"; g.fillRect(jx, jy - 5, 26, 6);
    g.fillStyle = "#f0e6cc"; g.fillRect(jx + 3, jy - 7, 16, 3);

    const bx = 296;                                   // cuenco de madera
    g.fillStyle = "#3f3016"; g.fillRect(bx, SUELO - 16, 39, 16);
    g.fillStyle = "#5c4722"; g.fillRect(bx, SUELO - 16, 16, 16);
    g.fillStyle = "#2a1f0c"; g.fillRect(bx - 2, SUELO - 20, 42, 5);
    g.fillStyle = "#7a6236"; g.fillRect(bx + 2, SUELO - 19, 15, 2);
  }

  function pintarVelas(g, t) {
    for (const [x, fase] of [[126, 0], [446, 2.1]]) {
      g.fillStyle = "#2a1f0c"; g.fillRect(x - 3, SUELO - 4, 12, 4);  // plato
      g.fillStyle = C.hueso;  g.fillRect(x, SUELO - 22, 6, 18);   // cuerpo
      g.fillStyle = "#c9b48c"; g.fillRect(x + 4, SUELO - 22, 2, 18);
      g.fillStyle = C.fuego3;                                      // llama
      const p = Math.sin(t / 170 + fase) > 0 ? 0 : 1;
      g.fillRect(x + 2, SUELO - 28 - p, 3, 7 + p);
      g.fillStyle = C.fuego4; g.fillRect(x + 2, SUELO - 25 - p, 3, 3);
    }
  }

  function pintarTabernero(g, t) {
    const sp = sprites[estado] || sprites.idle;
    if (!sp) return;
    const resp = reducido ? 0 : Math.round(Math.sin(t / 900));      // respira
    // A tamaño nativo: escalar pixel art por un factor no entero lo arruina.
    g.drawImage(sp, Math.round((W - sp.width) / 2), 14 + resp);
  }

  function particulas(g, t, dt) {
    if (reducido) return;
    if (Math.random() < 0.34) {
      chispas.push({ x: 60 + Math.random() * 39, y: 156, vy: -0.42 - Math.random() * 0.6,
                     vx: (Math.random() - 0.5) * 0.3, vida: 1 });
    }
    if (Math.random() < 0.09) {
      humo.push({ x: 128 + (Math.random() < 0.5 ? 0 : 320), y: SUELO - 22,
                  vy: -0.16, vida: 1 });
    }
    g.fillStyle = C.fuego3;
    chispas = chispas.filter((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= 0.011 * dt;
      if (p.vida <= 0) return false;
      g.globalAlpha = Math.max(0, p.vida);
      g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      return true;
    });
    g.fillStyle = "#5a4a38";
    humo = humo.filter((p) => {
      p.y += p.vy * dt; p.x += Math.sin(p.y / 9) * 0.14 * dt; p.vida -= 0.007 * dt;
      if (p.vida <= 0) return false;
      g.globalAlpha = Math.max(0, p.vida) * 0.4;
      g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      return true;
    });
    g.globalAlpha = 1;
  }

  function cuadro(ts) {
    if (!t0) t0 = ts;
    const t = ts - t0;
    const dt = Math.min(3, (ts - (cuadro.ultimo || ts)) / 16.7);
    cuadro.ultimo = ts;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fondo, 0, 0);
    pintarFuego(ctx, t);
    pintarTabernero(ctx, t);
    pintarBarra(ctx);
    pintarCacharros(ctx, t);
    particulas(ctx, t, dt);
    pintarVelas(ctx, t);

    // viñeta: oscurece los bordes y centra la mirada
    const grad = ctx.createRadialGradient(W / 2, 105, 60, W / 2, 105, 285);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(cuadro);
  }

  function arrancarEscena() {
    if (reducido) {                       // un solo cuadro, nada se mueve
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(fondo, 0, 0);
      pintarFuego(ctx, 0);
      pintarTabernero(ctx, 0); pintarBarra(ctx); pintarCacharros(ctx, 0); pintarVelas(ctx, 0);
      return;
    }
    if (!raf) raf = requestAnimationFrame(cuadro);
  }

  function pararEscena() {
    if (raf) cancelAnimationFrame(raf);
    raf = null; t0 = 0; chispas = []; humo = [];
  }

  // ── Interfaz ──────────────────────────────────────────────────────────────
  const CSS = `
  #tab-launcher {
    position: fixed; bottom: 24px; right: 24px; z-index: 9998;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; cursor: pointer;
    background: rgba(15,10,5,.95); border: 2px solid #8B6914; border-radius: 2px;
    color: #D4A844; font-family: 'Press Start 2P', monospace; font-size: 9px;
    line-height: 1.6; box-shadow: 0 4px 20px rgba(0,0,0,.6);
    transition: border-color .2s, transform .2s, color .2s;
  }
  #tab-launcher:hover { border-color:#D4A844; color:#F5E6C8; transform: translateY(-2px); }
  #tab-launcher[hidden] { display: none; }

  #tab-scene {
    position: fixed; inset: 0; z-index: 9999; display: none;
    background: #0A0703; align-items: center; justify-content: center;
  }
  #tab-scene.tab-open { display: flex; }

  .tab-stage {
    position: relative; width: min(100%, calc(100dvh * 16 / 9));
    aspect-ratio: 16 / 9; max-height: 100dvh;
  }
  .tab-vista { width: 100%; height: 100%; overflow: hidden; }
  #tab-canvas {
    display: block; width: 100%; height: 100%;
    image-rendering: pixelated; image-rendering: crisp-edges;
  }

  .tab-exit {
    position: absolute; top: 10px; right: 10px; z-index: 3;
    background: rgba(10,7,3,.85); border: 2px solid #3D2E0A; color: #8B6914;
    cursor: pointer; padding: 7px 10px;
    font-family: 'Press Start 2P', monospace; font-size: 9px;
  }
  .tab-exit:hover { border-color:#8B6914; color:#D4A844; }

  /* Caja de diálogo: borde doble, sin curvas, como corresponde */
  .tab-dialog {
    position: absolute; left: 3%; right: 3%; bottom: 3%; z-index: 2;
    background: rgba(10,7,3,.94);
    border: 3px solid #8B6914; outline: 3px solid #0A0703; outline-offset: 0;
    box-shadow: 0 0 0 1px #3D2E0A inset;
    padding: 14px 16px 12px;
  }
  .tab-nombre {
    position: absolute; top: -11px; left: 12px;
    background: #0A0703; border: 2px solid #8B6914; padding: 3px 8px;
    font-family: 'Press Start 2P', monospace; font-size: 8px; color: #D4A844;
  }
  .tab-texto {
    font-family: 'Crimson Text', Georgia, serif;
    font-size: clamp(15px, 1.7vw, 19px); line-height: 1.55; color: #F5E6C8;
    min-height: 2.6em; max-height: 26dvh; overflow-y: auto;
    white-space: pre-wrap; word-wrap: break-word;
    scrollbar-width: thin; scrollbar-color: #3D2E0A transparent;
  }
  .tab-texto::-webkit-scrollbar { width: 8px; }
  .tab-texto::-webkit-scrollbar-thumb { background: #3D2E0A; }
  .tab-texto em { color: #A89060; }
  .tab-texto.tab-error { color: #C44040; font-style: italic; }
  .tab-pregunta { color: #8B6914; display: block; margin-bottom: .5em; }

  .tab-cont {
    text-align: right; height: 12px; margin-top: 4px;
    font-family: 'Press Start 2P', monospace; font-size: 9px; color: #D4A844;
  }
  .tab-cont[hidden] { visibility: hidden; display: block; }
  @keyframes tab-parpadeo { 0%,55% { opacity:1 } 56%,100% { opacity:0 } }
  .tab-cont span { animation: tab-parpadeo 1s steps(1) infinite; }

  .tab-chips { display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0 0; }
  .tab-chip {
    background: none; border: 2px solid #3D2E0A; color: #A89060;
    padding: 6px 10px; cursor: pointer;
    font-family: 'Crimson Text', Georgia, serif; font-size: 15px;
  }
  .tab-chip:hover { border-color:#8B6914; color:#D4A844; background: rgba(139,105,20,.1); }

  .tab-form { display: flex; align-items: center; gap: 8px; margin-top: 10px;
              border-top: 2px solid #3D2E0A; padding-top: 10px; }
  .tab-prompt { font-family:'Press Start 2P',monospace; font-size:10px; color:#8B6914; }
  .tab-input {
    flex: 1; background: none; border: none; color: #F5E6C8; padding: 2px 0;
    font-family: 'Crimson Text', Georgia, serif; font-size: clamp(15px,1.6vw,18px);
  }
  .tab-input:focus { outline: none; }
  .tab-input::placeholder { color: #5A4420; }
  .tab-send {
    background: #8B6914; border: none; color: #0A0703; padding: 8px 12px;
    cursor: pointer; font-family: 'Press Start 2P', monospace; font-size: 9px;
  }
  .tab-send:hover:not(:disabled) { background: #A67C1A; color: #F5E6C8; }
  .tab-send:disabled { opacity: .4; cursor: not-allowed; }

  @media (max-width: 700px) {
    /* En vertical el canvas no puede estirarse: 320x180 deformado alarga al
       Tabernero. Se mantiene la proporción arriba y el diálogo ocupa el resto. */
    .tab-stage {
      width: 100%; height: 100dvh; max-height: 100dvh; aspect-ratio: auto;
      display: flex; flex-direction: column;
    }
    /* En vertical, 16:9 deja al Tabernero diminuto. Se recortan los lados y
       se agranda el centro, que es donde está él. */
    .tab-vista {
      position: relative; flex: 0 0 auto; height: 36dvh; width: 100%;
    }
    #tab-canvas {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      height: 100%; width: auto; max-width: none;
    }
    .tab-dialog {
      /* relative, no static: el cartel del nombre es absolute y necesita
         anclarse a la caja, si no se va al borde del escenario. */
      position: relative; flex: 1 1 auto; margin: 0;
      display: flex; flex-direction: column;
      border-left: none; border-right: none; border-bottom: none; outline: none;
    }
    .tab-nombre { top: -11px; left: 10px; }
    .tab-exit { right: auto; left: 10px; }
    .tab-texto { flex: 1 1 auto; max-height: none; }
    .tab-form { margin-top: auto; }
    #tab-launcher { bottom: 16px; right: 16px; }
  }
  @media (prefers-reduced-motion: reduce) {
    #tab-launcher { transition: none; }
    #tab-launcher:hover { transform: none; }
    .tab-cont span { animation: none; }
  }
  `;

  const historia = [];
  let ocupado = false, els;

  function construir() {
    const st = document.createElement("style");
    st.textContent = CSS; document.head.appendChild(st);

    const launcher = document.createElement("button");
    launcher.id = "tab-launcher"; launcher.type = "button";
    launcher.setAttribute("aria-label", "Entrar a la taberna");
    launcher.innerHTML = `<span aria-hidden="true">🍺</span><span>El Tabernero</span>`;

    const scene = document.createElement("div");
    scene.id = "tab-scene";
    scene.setAttribute("role", "dialog");
    scene.setAttribute("aria-label", "La taberna de El Tabernero");
    scene.innerHTML = `
      <div class="tab-stage">
        <div class="tab-vista">
          <canvas id="tab-canvas" width="${W}" height="${H}" aria-hidden="true"></canvas>
        </div>
        <button class="tab-exit" type="button" aria-label="Salir de la taberna">SALIR ✕</button>
        <div class="tab-dialog">
          <div class="tab-nombre">EL TABERNERO</div>
          <div class="tab-texto" aria-live="polite"></div>
          <div class="tab-cont" hidden><span>▼</span></div>
          <div class="tab-chips"></div>
          <form class="tab-form">
            <span class="tab-prompt" aria-hidden="true">&gt;</span>
            <input class="tab-input" type="text" autocomplete="off"
                   placeholder="Preguntad al Tabernero..." aria-label="Vuestra pregunta" />
            <button class="tab-send" type="submit">▶</button>
          </form>
        </div>
      </div>`;

    document.body.append(launcher, scene);
    canvas = scene.querySelector("#tab-canvas");
    ctx = canvas.getContext("2d");

    els = {
      launcher, scene,
      texto: scene.querySelector(".tab-texto"),
      cont:  scene.querySelector(".tab-cont"),
      chips: scene.querySelector(".tab-chips"),
      form:  scene.querySelector(".tab-form"),
      input: scene.querySelector(".tab-input"),
      send:  scene.querySelector(".tab-send"),
      exit:  scene.querySelector(".tab-exit"),
    };
  }

  /** Las cursivas del Tabernero (*sirve una jarra*) se renderizan como tales. */
  function pintarTexto(nodo, texto, pregunta) {
    nodo.innerHTML = "";
    nodo.className = "tab-texto";
    if (pregunta) {
      const q = document.createElement("span");
      q.className = "tab-pregunta";
      q.textContent = "> " + pregunta;
      nodo.appendChild(q);
    }
    for (const parte of texto.split(/(\*[^*\n]+\*)/g)) {
      if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
        const em = document.createElement("em");
        em.textContent = parte.slice(1, -1);
        nodo.appendChild(em);
      } else if (parte) {
        nodo.appendChild(document.createTextNode(parte));
      }
    }
  }

  function mostrarSugerencias() {
    els.chips.innerHTML = "";
    for (const texto of SUGERENCIAS) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "tab-chip"; b.textContent = texto;
      b.addEventListener("click", () => preguntar(texto));
      els.chips.appendChild(b);
    }
  }

  async function preguntar(pregunta) {
    if (ocupado || !pregunta.trim()) return;
    ocupado = true;
    els.send.disabled = true;
    els.chips.innerHTML = "";
    els.cont.hidden = true;
    els.input.value = "";
    estado = "habla";

    historia.push({ role: "user", content: pregunta });
    pintarTexto(els.texto, "sirviendo una jarra...", pregunta);

    let respuesta = "";
    try {
      const res = await fetch(`${ENDPOINT}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historia }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "El Tabernero no responde.");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lineas = buf.split("\n");
        buf = lineas.pop() ?? "";
        for (const linea of lineas) {
          if (!linea.startsWith("data: ")) continue;
          let ev;
          try { ev = JSON.parse(linea.slice(6)); } catch { continue; }
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            respuesta += ev.delta.text;
            pintarTexto(els.texto, respuesta, pregunta);
            els.texto.scrollTop = els.texto.scrollHeight;
          } else if (ev.type === "error") {
            throw new Error(ev.error?.message || "Error en el stream.");
          }
        }
      }

      if (respuesta.trim()) {
        historia.push({ role: "assistant", content: respuesta });
        els.cont.hidden = false;
      } else {
        throw new Error("El Tabernero ha callado. Intentadlo de nuevo.");
      }
    } catch (err) {
      historia.pop();               // la pregunta no llegó a tener respuesta
      pintarTexto(els.texto, err.message, pregunta);
      els.texto.classList.add("tab-error");
    } finally {
      ocupado = false;
      estado = "idle";
      els.send.disabled = false;
      els.input.focus();
    }
  }

  function abrir() {
    els.scene.classList.add("tab-open");
    els.launcher.hidden = true;
    if (!fondo) pintarFondo();
    estado = "saludo";
    arrancarEscena();
    setTimeout(() => { if (estado === "saludo") estado = "idle"; }, 2200);
    if (!historia.length) {
      pintarTexto(els.texto, SALUDO, null);
      els.cont.hidden = false;
      mostrarSugerencias();
    }
    els.input.focus();
  }

  function cerrar() {
    els.scene.classList.remove("tab-open");
    els.launcher.hidden = false;
    pararEscena();
  }

  function iniciar() {
    construir();
    cargarSprites().then(() => { if (els.scene.classList.contains("tab-open")) arrancarEscena(); });
    els.launcher.addEventListener("click", abrir);
    els.exit.addEventListener("click", cerrar);
    els.form.addEventListener("submit", (e) => { e.preventDefault(); preguntar(els.input.value); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.scene.classList.contains("tab-open")) cerrar();
    });
    // Sin la escena visible no tiene sentido gastar CPU animando.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pararEscena();
      else if (els.scene.classList.contains("tab-open")) arrancarEscena();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
