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
  const W = 320, H = 180;          // resolución interna, se escala por CSS
  const SUELO = 104;               // y de la tapa de la barra

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
    idle: "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",
    habla: "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",
    saludo: "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",
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

    // Tablones verticales con junta oscura
    for (let x = 0; x < W; x += 16) {
      g.fillStyle = (x / 16) % 2 ? C.pared2 : C.pared1;
      g.fillRect(x, 0, 15, SUELO);
      g.fillStyle = C.junta;
      g.fillRect(x + 15, 0, 1, SUELO);
    }
    // Vigas horizontales
    g.fillStyle = C.junta;
    for (const y of [26, 66]) g.fillRect(0, y, W, 2);

    // ── Hogar, a la izquierda ───────────────────────────────────────────────
    g.fillStyle = C.junta;   g.fillRect(14, 40, 74, 64);
    g.fillStyle = "#1b1206"; g.fillRect(18, 44, 66, 60);
    g.fillStyle = C.barra;                       // dintel
    g.fillRect(12, 36, 78, 5);
    g.fillStyle = C.barraTapa; g.fillRect(12, 36, 78, 1);
    // leños
    g.fillStyle = "#3a2a12";
    g.fillRect(30, 92, 42, 5);
    g.fillRect(36, 87, 30, 4);

    // ── Estantes, a la derecha ──────────────────────────────────────────────
    const botellas = [
      [216, C.vidrio1, 11], [224, C.vidrio2, 9],  [231, C.vidrio3, 12],
      [240, C.vidrio1, 8],  [250, C.vidrio2, 11], [259, C.vidrio3, 9],
      [268, C.vidrio1, 12], [277, C.vidrio2, 10], [286, C.vidrio3, 8],
      [295, C.vidrio1, 11],
    ];
    for (const y of [40, 70]) {
      g.fillStyle = C.barra;      g.fillRect(208, y + 14, 100, 3);
      g.fillStyle = C.barraTapa;  g.fillRect(208, y + 14, 100, 1);
      for (const [x, col, alto] of botellas) {
        if ((x + y) % 3 === 0) continue;         // huecos, que no quede parejo
        g.fillStyle = col;
        g.fillRect(x, y + 14 - alto, 4, alto);
        g.fillStyle = C.junta;
        g.fillRect(x + 1, y + 14 - alto - 2, 2, 2);   // cuello
      }
    }

    fondo = c;
  }

  /**
   * El mostrador va delante del Tabernero, no detrás: si se dibuja con el resto
   * del fondo, el sprite le queda encima y el personaje parece flotar.
   */
  function pintarBarra(g) {
    g.fillStyle = C.barra;     g.fillRect(0, SUELO, W, H - SUELO);
    g.fillStyle = C.barraTapa; g.fillRect(0, SUELO, W, 4);
    g.fillStyle = C.barraLuz;  g.fillRect(0, SUELO, W, 1);
    g.fillStyle = C.junta;
    for (let x = 6; x < W; x += 26) g.fillRect(x, SUELO + 6, 2, H - SUELO - 6);
  }

  /** Fuego: llamas por columnas, con altura que late. */
  function pintarFuego(g, t) {
    const base = 96, x0 = 24, ancho = 54;
    const capas = [
      [C.fuego1, 1.0, 26], [C.fuego2, 0.72, 20],
      [C.fuego3, 0.46, 13], [C.fuego4, 0.22, 7],
    ];
    for (const [col, esc, alto] of capas) {
      g.fillStyle = col;
      for (let i = 0; i < ancho; i += 2) {
        const x = x0 + i;
        const centro = 1 - Math.abs(i - ancho / 2) / (ancho / 2);
        const onda =
          Math.sin(t / 190 + i * 0.55) * 0.5 +
          Math.sin(t / 90 + i * 1.15) * 0.32;
        const h = Math.max(0, (alto * centro + onda * 5) * esc);
        g.fillRect(x, base - h, 2, h);
      }
    }
    // resplandor sobre la barra
    g.globalAlpha = 0.13 + Math.sin(t / 260) * 0.05;
    g.fillStyle = C.fuego3;
    g.fillRect(4, SUELO, 96, 4);
    g.globalAlpha = 1;
  }

  function pintarVelas(g, t) {
    for (const [x, fase] of [[104, 0], [292, 2.1]]) {
      g.fillStyle = C.hueso;  g.fillRect(x, SUELO - 11, 3, 11);   // cuerpo
      g.fillStyle = C.fuego3;                                      // llama
      const p = Math.sin(t / 170 + fase) > 0 ? 0 : 1;
      g.fillRect(x + 1, SUELO - 14 - p, 1, 3 + p);
      g.fillStyle = C.fuego4; g.fillRect(x + 1, SUELO - 13 - p, 1, 1);
    }
  }

  function pintarCartel(g, t) {
    const bal = reducido ? 0 : Math.round(Math.sin(t / 700) * 1.5);
    const x = 116 + bal, y = 8;
    g.fillStyle = C.junta;      g.fillRect(x + 34, 0, 2, y);       // cadena
    g.fillStyle = C.barra;      g.fillRect(x, y, 88, 16);
    g.fillStyle = C.barraTapa;  g.fillRect(x, y, 88, 1);
    g.fillStyle = C.oro;
    g.font = "8px 'Press Start 2P', monospace";
    g.textAlign = "center";
    g.fillText("LODTE", x + 44, y + 12);
  }

  function pintarTabernero(g, t) {
    const sp = sprites[estado] || sprites.idle;
    if (!sp) return;
    const resp = reducido ? 0 : Math.round(Math.sin(t / 900));      // respira
    g.drawImage(sp, 124, 34 + resp, 72, 72);
  }

  function particulas(g, t, dt) {
    if (reducido) return;
    if (Math.random() < 0.34) {
      chispas.push({ x: 40 + Math.random() * 26, y: 104, vy: -0.32 - Math.random() * 0.45,
                     vx: (Math.random() - 0.5) * 0.22, vida: 1 });
    }
    if (Math.random() < 0.09) {
      humo.push({ x: 105 + (Math.random() < 0.5 ? 0 : 188), y: SUELO - 15,
                  vy: -0.16, vida: 1 });
    }
    g.fillStyle = C.fuego3;
    chispas = chispas.filter((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= 0.011 * dt;
      if (p.vida <= 0) return false;
      g.globalAlpha = Math.max(0, p.vida);
      g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      return true;
    });
    g.fillStyle = "#5a4a38";
    humo = humo.filter((p) => {
      p.y += p.vy * dt; p.x += Math.sin(p.y / 9) * 0.14 * dt; p.vida -= 0.007 * dt;
      if (p.vida <= 0) return false;
      g.globalAlpha = Math.max(0, p.vida) * 0.4;
      g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
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
    pintarCartel(ctx, t);
    pintarTabernero(ctx, t);
    pintarBarra(ctx);
    particulas(ctx, t, dt);
    pintarVelas(ctx, t);

    // viñeta: oscurece los bordes y centra la mirada
    const grad = ctx.createRadialGradient(W / 2, 70, 40, W / 2, 70, 190);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(cuadro);
  }

  function arrancarEscena() {
    if (reducido) {                       // un solo cuadro, nada se mueve
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(fondo, 0, 0);
      pintarFuego(ctx, 0); pintarCartel(ctx, 0);
      pintarTabernero(ctx, 0); pintarBarra(ctx); pintarVelas(ctx, 0);
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
    min-height: 3.4em; max-height: 30dvh; overflow-y: auto;
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
    #tab-canvas { width: 100%; height: auto; aspect-ratio: 16 / 9; flex: 0 0 auto; }
    .tab-dialog {
      /* relative, no static: el cartel del nombre es absolute y necesita
         anclarse a la caja, si no se va al borde del escenario. */
      position: relative; flex: 1 1 auto; margin: 0;
      display: flex; flex-direction: column;
      border-left: none; border-right: none; border-bottom: none; outline: none;
    }
    .tab-nombre { top: -11px; left: 10px; }
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
        <canvas id="tab-canvas" width="${W}" height="${H}" aria-hidden="true"></canvas>
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
