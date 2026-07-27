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
    idle: "iVBORw0KGgoAAAANSUhEUgAAACIAAAAuCAYAAABNhcu5AAACuklEQVR4nM2Xv4sTURDHv5EjhUhyVWBlbzmuOJYEDi5ckX9AISIWOTgsgqXVNTYWXpMmIv4HWliIWAQUwSKgYClBQopAwnJFkM1yga0SsQpiLMILu5u3b2fe5oLfatmZfft5837MDPCfKMP9oJDPLih+/mzOGnuHC2CUTNoHA2/BAUp0YgNENBl4oAApjYV8dhEFMKwcHcL9FQJSwcQaohAcAB2YG5TBdCE435I3KwD02kMtmHK1GIpMKpBee4jGaUULpPGhk7jZWREBgCPbYvn3HZfkR9ojANA4rbAhgCU4JZJkkKCO6+eoNVux9lqzheP6OWtMLZDrEOkeMawcHtzMxS6N5/kAANMsSO19x8Urx0t/j2xD7FMj9PztF6X92aO71wfSd1yMrpZJrGjeUvp++vYdAHBwm5YsY0H82TyDgRfKNwICAIbeb+XAAnR05ZFgtJYmCNEdT0O2k73dlU9S1MggIiqACdjy5CV+nKSkMkDr1FBmyokGQKxZC/ns4mRvNzR43B6J+nTHU1K5SIqIP5tnuuNp6OeyGetCAMwqXhYZmbgQbBABAwAfL86kdpEMue0Ee7NSfsCF0AKhNFjUJiwoMjm3v6H2MySQ4MzSNlhJUFJD0uyTWoS4il0VpdCLtABpgFYPwYosGM6gytXi6tlWpCkHf0hQwfyzNtpk4OH1RQV36i9D77++e4rHzQ7K1SJs7KgresddgzGsnLLJYh/fXnuI9+2+0ufItqQRUy2tNL6dvo8fD++F3v21loWxuFFrzRZePLmvhJFFhgWikmUfwnUuAQAHh/tr9tHlTy0Y9tIIiE1Lu4oHwrNPKzaIqtVMo1gQsTmjUm3QjYIYJRNvPo+2CrEGMhl4MEomgj2vkOom1VH09k7MNQImDYg4vuJmVeYaGVAUKq1UJQG5HtmUdMrIreofxmQ71XeSCAUAAAAASUVORK5CYII=",
    habla: "iVBORw0KGgoAAAANSUhEUgAAACIAAAAuCAYAAABNhcu5AAADHElEQVR4nM2YMWvbQBTH/y7BQwl2JoOLIkqGIGxwwWTIF2jApXRIwXQo7VK6dOrSoe6QxaX0E7QlFNJ2CsQEOhhc6NAhmCIMMcgVHtwiixg02SGTKVUH91SddD7dSTbkPwm9p7uf3j3duyfgkigl+0Aum3ZF/JzJVGrsFVmAfFERe8CwXRmgSCdpgIBGhg0RIK4xl027QYC8mhGHsM4pIB7MXEMQQgYgDswVkcHiQsg8K5ysANBp9mLBlCsFKjKJQDrNHvbubscC2TtqRya7VEQAoKSpUv5d0xLyE0rWvJrBnasZlDQVu/VDz6dRq4aeY9m7poW3pp08Wf1q1Kr4+eMb1w6A67MQkGVJemlYsm0HAKAoOaZ9KUuzLEl/NUQvP7S49ucPdpYH0jUtDM5mRaygrHJ9j7+eAAA2rokVy7kgzmSagmFT9YZAAEDPvuAOTEAHZ7YQTKylIRD6cByyba2veT5RURMGIVEBFEBjF69HN2aT7Z9eeBAsRR0DYkWkoKx6Udk/ZS+RTDQAwTNrLpt2t9bXqMHn5UjQRx+OhY6LQvuIM5mm9OGYmpz1xjyIXDbt8g7eUidtVmRYYkHoH1/AMvvYrR8yIySVI85kmtIxdvXhmFl5gf/VNziZZfa5Y0tv8SLrLdvTxAIRabD8Prls2vVHr1GrMseI3WA9OT5h+nk78b8GS1RcED+5bINF/EmDFSXmWkZ1d1EtQvDEPjJsL7mFvpqkAEG/kXXuReSNPQjN4wdK+Y1R4SxXCt61xllVE7+9606zh52HW5S9daAjX1So+hMabWTYeFfbxs37r6n7Xz49w+N6G+VKARpW+G2FaVEwIpIuep1mDx3w+5uSpnow5UoBrQOdsrOWngnS7jr4fu8Wde+POjsY+5Pu1dPbwjBE81pP6Yio2qa3XW9sXg/ZB/1fTJgoSe+sUTUjrmKf4gH67ZNKGsTf2y5Sc0FIcgbFS9CFguSLCt5/HrB8lwYRAhkZNvJFBf6el4i3k8ZRcPemig+r1hCYJCDk8yV7COuXJ7f6BqGSyh+FYAWO/M+6MIo5AJdOfwHgqn7BdceGqQAAAABJRU5ErkJggg==",
    saludo: "iVBORw0KGgoAAAANSUhEUgAAACIAAAAuCAYAAABNhcu5AAADHklEQVR4nM2YMWvbQBTH/y7BQwl2JoOKIkoGI2TIEDz4CzTgUjokYDqUduvSqUuHesmSUvoN2qGQ0inQEOgQSKBDh2CK8GCwKzK4RRIxaJJLJ1OqDu4J6Syd3kluyB+MZd3T6ad3z/feE3BNVJK9oFYtBxQ7bzqTmntFFkBpqLQLhm4gA5RpJA3AaTJ0QQESDtaq5YAHULQKHcL+GQMSwaQO8BAyAHlgblAmywshcy05WAGgfzLKBbPVNmKeKQTSPxlhb7eVC2TvYy8z2KU8AgCbuiZlP7Bskh0pRgBgb7clDQHMwSmelPbIzv5h7PdRt0MayxLZI9HJv3/7knijo24nPMdsqCLtI4pWwf2bldSlcV0PAKCqtcTxgWXjjeUW30euQtIxwvTy/alw/MWj7f8HMrBsjC/nScxQV4W2x5/PAQAbt2jJMhXEm85KGLqxfMMgAGDk/hJOzEDHly4JJleMMAjT8WGoqzDUVZiOD9PxyaC8hEvDvAKogL6YvJrra+ENm+trwhtllQG5PJIVH1SbqEhlXK1aDprra7HJ01zP25iOTyoXSR7xprOS6fixmyc9cRIEEys504pv8tKkwUQ/SRBH3Q5q1XLAf/PzS+0j3nRWMuEHpuOnJjSW+LzprERtPYAcwUpZb96GQYuysTQI5SllPMGUu8F6enyeaBfuxP8aLKqEHqlVywH7KA1VqslitppeJ9knrndWd5fVIvC9DF/FJcVZ7ERRgCQg1nJuP24CAE4PzHA8ChQeRCsydjGvrbYRHuuC8LLwG8C8BWEAUZ0emFAaaiz/LMw2Gbp4223hzsPXsfNnH57jyX4PW20DOlbEFb1lhzBUSVdo/ZMR+hD3N5u6Blg20DZiS8GUtPSJIL2Bh68P7sbO/dHmhTELvJ39Q7x6do8EE1Va6yntEU2vw7YuAAAb9dsL4+OLHwswlGWS3lkZxLKVu4oH4k9fVIVbzmUpFYQFJy9RgC4VRGmoePdpfKUQCyCToYtocotu6aKdNI/43Tsz1zCYIiDs78v2kKRXnsLsy0MVVdQLfAbOfM+6NIoUgGunv3Z1b7Evn5RcAAAAAElFTkSuQmCC",
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
    g.drawImage(sp, 126, 18 + resp, 68, 92);
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
