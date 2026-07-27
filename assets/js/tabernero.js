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
  // El arte es pintado, no dibujado por código: fondo, tres poses y el trazado
  // del borde del mostrador vienen de assets/img/taberna. Lo que sigue aporta
  // sólo lo que una imagen fija no puede dar — el latido del fuego, las chispas
  // y la respiración del Tabernero.
  //
  // El mostrador no viaja como imagen aparte: es la misma pintura del fondo
  // recortada bajo su borde, así que se recompone acá recortando por ese
  // trazado. Son 195 KB que no se descargan.

  const RAIZ = (script?.src || "").replace(/js\/[^/]*$/, "");
  const BASE = RAIZ + "img/taberna/";
  const VOZ_SALUDO = RAIZ + "audio/saludo.mp3";

  let W = 1408, H = 768;           // lo confirma escena.json al cargar
  let escena = null;               // metadatos: anclas de las poses y borde de la barra

  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Focos de luz de la escena, medidos sobre el fondo. Cada uno late con su
  // propia fase: si parpadean todos a la vez se lee como un fallo eléctrico,
  // no como fuego.
  const FUEGOS = [
    { x: 232, y: 486, r: 210, fuerza: 0.30, ritmo: 150, fase: 0.0 },  // hogar
    { x: 97,  y: 250, r: 42,  fuerza: 0.16, ritmo: 210, fase: 1.7 },  // vela izq
    { x: 411, y: 250, r: 42,  fuerza: 0.16, ritmo: 190, fase: 3.1 },  // vela der
    { x: 548, y: 288, r: 70,  fuerza: 0.18, ritmo: 240, fase: 0.8 },  // antorcha
    { x: 795, y: 268, r: 70,  fuerza: 0.18, ritmo: 225, fase: 2.4 },  // antorcha
    { x: 1341, y: 212, r: 70, fuerza: 0.18, ritmo: 260, fase: 4.2 },  // antorcha
  ];

  const imgs = {};
  let ctx, canvas, raf = null, t0 = 0;
  let estado = "saludo";            // saludo | idle | habla
  let chispas = [];
  let listo = false;

  // La voz arranca encendida: se entra a la taberna con un clic deliberado, y
  // el saludo hablado es el efecto buscado. Pero el control tiene que estar a
  // la vista y la elección se recuerda — un sitio que te habla sin que puedas
  // callarlo es hostil aunque la voz esté buena.
  let vozAudio = null;
  let vozActiva = true;
  try { vozActiva = localStorage.getItem("tab-voz") !== "off"; } catch { /* modo privado */ }

  function cargarImagen(url) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = url;
    });
  }

  async function cargarArte() {
    try {
      const r = await fetch(BASE + "escena.json");
      escena = await r.json();
      [W, H] = escena.escena;
      if (canvas) { canvas.width = W; canvas.height = H; }   // el arte manda la medida
    } catch {
      console.warn("[El Tabernero] No se pudo leer escena.json");
      return false;
    }
    const nombres = ["fondo", "idle", "habla", "saludo"];
    const cargadas = await Promise.all(
      nombres.map((n) => cargarImagen(`${BASE}${n}.webp`)),
    );
    nombres.forEach((n, i) => { if (cargadas[i]) imgs[n] = cargadas[i]; });
    listo = Boolean(imgs.fondo && imgs.idle);
    if (!listo) console.warn("[El Tabernero] Falta arte de la taberna");
    return listo;
  }

  /** Recorta por el borde del mostrador para redibujarlo delante del personaje. */
  function recortarBarra(g) {
    const pts = escena.barra;
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts) g.lineTo(x, y);
    g.lineTo(W, H); g.lineTo(0, H);
    g.closePath();
    g.clip();
  }

  function pintarTabernero(g, t) {
    const pose = imgs[estado] || imgs.idle;
    const meta = escena.poses[estado] || escena.poses.idle;
    if (!pose || !meta) return;
    const resp = reducido ? 0 : Math.round(Math.sin(t / 1400) * 1.5);   // respira
    g.drawImage(pose,
      escena.ojos[0] - meta.ancla[0],
      escena.ojos[1] - meta.ancla[1] + resp);
  }

  /**
   * Latido del fuego.
   *
   * El fuego ya está pintado en el fondo; esto sólo suma luz encima, en modo
   * aditivo. Pintar llamas propias sobre las pintadas las duplicaría.
   */
  function pintarLumbre(g, t) {
    g.globalCompositeOperation = "lighter";
    for (const f of FUEGOS) {
      const late =
        Math.sin(t / f.ritmo + f.fase) * 0.5 +
        Math.sin(t / (f.ritmo * 0.41) + f.fase * 2) * 0.3;
      const a = Math.max(0, f.fuerza * (0.62 + (reducido ? 0 : late * 0.38)));
      const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      grad.addColorStop(0, `rgba(255,176,72,${a.toFixed(3)})`);
      grad.addColorStop(0.45, `rgba(226,116,40,${(a * 0.42).toFixed(3)})`);
      grad.addColorStop(1, "rgba(180,70,20,0)");
      g.fillStyle = grad;
      g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
    g.globalCompositeOperation = "source-over";
  }

  function particulas(g, t, dt) {
    if (reducido) return;
    if (Math.random() < 0.5) {
      chispas.push({
        x: 170 + Math.random() * 130, y: 520,
        vx: (Math.random() - 0.5) * 0.5, vy: -0.7 - Math.random() * 1.1,
        vida: 1, brillo: 0.6 + Math.random() * 0.4,
      });
    }
    g.globalCompositeOperation = "lighter";
    chispas = chispas.filter((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= 0.009 * dt;
      if (p.vida <= 0 || p.y < 330) return false;
      g.fillStyle = `rgba(255,190,90,${(p.vida * p.brillo).toFixed(3)})`;
      g.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
      return true;
    });
    g.globalCompositeOperation = "source-over";
  }

  function cuadro(ts) {
    if (!t0) t0 = ts;
    const t = ts - t0;
    const dt = Math.min(3, (ts - (cuadro.ultimo || ts)) / 16.7);
    cuadro.ultimo = ts;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imgs.fondo, 0, 0);
    pintarTabernero(ctx, t);

    ctx.save();                       // el mostrador, delante del Tabernero
    recortarBarra(ctx);
    ctx.drawImage(imgs.fondo, 0, 0);
    ctx.restore();

    pintarLumbre(ctx, t);
    particulas(ctx, t, dt);

    // Viñeta: oscurece los bordes y lleva la mirada al centro
    const grad = ctx.createRadialGradient(W * 0.52, H * 0.42, H * 0.30,
                                          W * 0.52, H * 0.42, H * 1.05);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(cuadro);
  }

  function arrancarEscena() {
    if (!listo) return;
    if (reducido) {                       // un solo cuadro, nada se mueve
      cuadro.ultimo = 0; t0 = 0;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(imgs.fondo, 0, 0);
      pintarTabernero(ctx, 0);
      ctx.save(); recortarBarra(ctx); ctx.drawImage(imgs.fondo, 0, 0); ctx.restore();
      pintarLumbre(ctx, 0);
      return;
    }
    if (!raf) raf = requestAnimationFrame(cuadro);
  }

  /**
   * Saludo hablado.
   *
   * Encadena las poses con el audio: el brindis mientras dura el gesto, y
   * hablando hasta que la voz termina. Si el audio no está, falla en silencio
   * y queda la secuencia muda de siempre — el texto ya está en pantalla, así
   * que nadie se pierde nada.
   */
  function decirSaludo() {
    if (!vozActiva) return false;
    if (!vozAudio) {
      vozAudio = new Audio(VOZ_SALUDO);
      vozAudio.preload = "auto";
      vozAudio.addEventListener("ended", () => { estado = "idle"; });
    }
    vozAudio.currentTime = 0;
    estado = "saludo";
    const p = vozAudio.play();
    if (p && p.catch) {
      // Puede rebotar por política de reproducción o porque el archivo no está.
      p.catch(() => saludoMudo());
    }
    setTimeout(() => {
      if (estado === "saludo" && !vozAudio.paused) estado = "habla";
    }, 1500);
    return true;
  }

  /** Brindis y a reposo: la bienvenida cuando no hay voz que la acompañe. */
  function saludoMudo() {
    estado = "saludo";
    setTimeout(() => { if (estado === "saludo") estado = "idle"; }, 2200);
  }

  function callarVoz() {
    if (vozAudio) { vozAudio.pause(); vozAudio.currentTime = 0; }
  }

  function pararEscena() {
    if (raf) cancelAnimationFrame(raf);
    raf = null; t0 = 0; chispas = [];
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
    position: relative; width: min(100%, calc(100dvh * 1408 / 768));
    aspect-ratio: 1408 / 768; max-height: 100dvh;
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

  .tab-voz {
    position: absolute; top: 10px; right: 92px; z-index: 3;
    background: rgba(10,7,3,.85); border: 2px solid #3D2E0A; color: #8B6914;
    cursor: pointer; padding: 6px 9px; line-height: 1;
    font-family: 'Press Start 2P', monospace; font-size: 11px;
  }
  .tab-voz:hover { border-color:#8B6914; color:#D4A844; }
  .tab-voz[aria-pressed="false"] { opacity: .55; }

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
    /* En vertical la escena es demasiado ancha para entrar entera. Se recorta
       por los costados en vez de achatarla, y se encuadra sobre el Tabernero,
       que es lo único que no puede perderse. */
    .tab-vista {
      position: relative; flex: 0 0 auto; height: 46dvh; width: 100%;
    }
    #tab-canvas {
      position: absolute; top: 0; left: 56%; transform: translateX(-56%);
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
    .tab-voz { right: 10px; }
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
          <canvas id="tab-canvas" aria-hidden="true"></canvas>
        </div>
        <button class="tab-voz" type="button" aria-pressed="true"
                aria-label="Silenciar al Tabernero">🔊</button>
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
    canvas.width = W; canvas.height = H;
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
      voz:   scene.querySelector(".tab-voz"),
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
    callarVoz();                          // no se pisa con su propio saludo
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
    arrancarEscena();
    if (!decirSaludo()) saludoMudo();
    if (!historia.length) {
      pintarTexto(els.texto, SALUDO, null);
      els.cont.hidden = false;
      mostrarSugerencias();
    }
    els.input.focus();
  }

  function pintarBotonVoz() {
    els.voz.textContent = vozActiva ? "🔊" : "🔇";
    els.voz.setAttribute("aria-pressed", String(vozActiva));
    els.voz.setAttribute("aria-label",
      vozActiva ? "Silenciar al Tabernero" : "Dar voz al Tabernero");
  }

  function cerrar() {
    callarVoz();
    els.scene.classList.remove("tab-open");
    els.launcher.hidden = false;
    pararEscena();
  }

  function iniciar() {
    construir();
    cargarArte().then(() => { if (els.scene.classList.contains("tab-open")) arrancarEscena(); });
    els.launcher.addEventListener("click", abrir);
    els.exit.addEventListener("click", cerrar);
    pintarBotonVoz();
    els.voz.addEventListener("click", () => {
      vozActiva = !vozActiva;
      try { localStorage.setItem("tab-voz", vozActiva ? "on" : "off"); } catch { /* modo privado */ }
      if (!vozActiva) { callarVoz(); estado = "idle"; }
      pintarBotonVoz();
    });
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
