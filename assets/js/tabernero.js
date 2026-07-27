/**
 * El Tabernero — widget de chat para www.lodte.com.ar
 *
 * Sin dependencias. Se inyecta solo, trae su propio CSS y usa las fuentes que
 * el sitio ya carga (Press Start 2P y Crimson Text), con fallback si no están.
 *
 * Uso:
 *   <script src="/assets/js/tabernero.js" data-endpoint="https://el-tabernero.TU-SUBDOMINIO.workers.dev" defer></script>
 */

(function () {
  "use strict";

  const script = document.currentScript;

  // Sin data-endpoint apuntamos al mismo origen (útil para desarrollo local).
  // En producción hay que declararlo: el sitio es estático y el Worker vive
  // en otro dominio.
  const ENDPOINT = (script?.dataset.endpoint ?? "").replace(/\/$/, "");
  if (!ENDPOINT) {
    console.warn(
      "[El Tabernero] Sin data-endpoint: se usa el mismo origen. " +
        "En producción apuntá al Worker.",
    );
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

  const CSS = `
  #tab-launcher {
    position: fixed; bottom: 24px; right: 24px; z-index: 9998;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; cursor: pointer;
    background: rgba(15, 10, 5, 0.95);
    border: 2px solid #8B6914; border-radius: 2px;
    color: #D4A844;
    font-family: 'Press Start 2P', monospace; font-size: 9px; line-height: 1.6;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    transition: border-color .2s, transform .2s, color .2s;
  }
  #tab-launcher:hover {
    border-color: #D4A844; color: #F5E6C8; transform: translateY(-2px);
  }
  #tab-launcher[hidden] { display: none; }
  #tab-launcher .tab-flame { font-size: 14px; line-height: 1; }

  #tab-panel {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: none; flex-direction: column;
    width: min(420px, calc(100vw - 32px));
    height: min(600px, calc(100vh - 48px));
    background: rgba(10, 7, 3, 0.98);
    border: 2px solid #8B6914; border-radius: 2px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.8);
    overflow: hidden;
  }
  #tab-panel.tab-open { display: flex; }

  .tab-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 16px;
    border-bottom: 1px solid #3D2E0A; background: rgba(139, 105, 20, 0.08);
  }
  .tab-header h2 {
    margin: 0; font-family: 'Press Start 2P', monospace;
    font-size: 11px; color: #D4A844; line-height: 1.5;
  }
  .tab-header p {
    margin: 6px 0 0; font-family: 'Press Start 2P', monospace;
    font-size: 7px; color: #6B5020; line-height: 1.6;
  }
  .tab-close {
    flex-shrink: 0; background: none; border: 1px solid #3D2E0A;
    color: #8B6914; cursor: pointer; padding: 6px 10px;
    font-family: 'Press Start 2P', monospace; font-size: 9px;
  }
  .tab-close:hover { border-color: #8B6914; color: #D4A844; }

  .tab-log {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: #3D2E0A transparent;
  }
  .tab-log::-webkit-scrollbar { width: 8px; }
  .tab-log::-webkit-scrollbar-thumb { background: #3D2E0A; }

  .tab-msg {
    font-family: 'Crimson Text', Georgia, serif;
    font-size: 16px; line-height: 1.65; white-space: pre-wrap; word-wrap: break-word;
  }
  .tab-msg.tab-user {
    align-self: flex-end; max-width: 85%;
    padding: 10px 14px; color: #F5E6C8;
    background: rgba(139, 105, 20, 0.15); border-right: 2px solid #8B6914;
  }
  .tab-msg.tab-bot { color: #C4A060; }
  .tab-msg.tab-bot em { color: #6B5020; font-size: 14px; }
  .tab-msg.tab-error { color: #C44040; font-style: italic; }

  .tab-typing { color: #6B5020; font-family: 'Press Start 2P', monospace; font-size: 8px; }

  .tab-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 12px; }
  .tab-chip {
    background: none; border: 1px solid #3D2E0A; color: #A89060;
    padding: 7px 11px; cursor: pointer;
    font-family: 'Crimson Text', Georgia, serif; font-size: 14px;
  }
  .tab-chip:hover { border-color: #8B6914; color: #D4A844; background: rgba(139,105,20,0.1); }

  .tab-form {
    display: flex; gap: 8px; padding: 12px 16px 16px;
    border-top: 1px solid #3D2E0A;
  }
  .tab-input {
    flex: 1; background: rgba(15, 10, 5, 0.9);
    border: 1px solid #3D2E0A; color: #F5E6C8; padding: 11px 12px;
    font-family: 'Crimson Text', Georgia, serif; font-size: 16px;
  }
  .tab-input:focus { outline: none; border-color: #8B6914; }
  .tab-input::placeholder { color: #5A4420; }
  .tab-send {
    background: #8B6914; border: none; color: #0A0703;
    padding: 11px 15px; cursor: pointer;
    font-family: 'Press Start 2P', monospace; font-size: 9px;
  }
  .tab-send:hover:not(:disabled) { background: #A67C1A; color: #F5E6C8; }
  .tab-send:disabled { opacity: .4; cursor: not-allowed; }

  @media (max-width: 480px) {
    #tab-panel {
      bottom: 0; right: 0; width: 100vw; height: 100dvh; border-width: 0;
      /* A pantalla completa la traslucidez del panel deja ver la página de
         atrás. Opaco. */
      background: #0A0703;
    }
    #tab-launcher { bottom: 16px; right: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    #tab-launcher { transition: none; }
    #tab-launcher:hover { transform: none; }
  }
  `;

  const history = [];
  let busy = false;
  let els;

  function build() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    const launcher = document.createElement("button");
    launcher.id = "tab-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Hablar con El Tabernero");
    launcher.innerHTML = `<span class="tab-flame" aria-hidden="true">🍺</span><span>El Tabernero</span>`;

    const panel = document.createElement("div");
    panel.id = "tab-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "El Tabernero");
    panel.innerHTML = `
      <div class="tab-header">
        <div>
          <h2>El Tabernero</h2>
          <p>Guardián de las crónicas</p>
        </div>
        <button class="tab-close" type="button" aria-label="Cerrar">✕</button>
      </div>
      <div class="tab-log" aria-live="polite"></div>
      <div class="tab-chips"></div>
      <form class="tab-form">
        <input class="tab-input" type="text" autocomplete="off"
               placeholder="Preguntad al Tabernero..." aria-label="Vuestra pregunta" />
        <button class="tab-send" type="submit">▶</button>
      </form>`;

    document.body.append(launcher, panel);

    els = {
      launcher,
      panel,
      log: panel.querySelector(".tab-log"),
      chips: panel.querySelector(".tab-chips"),
      form: panel.querySelector(".tab-form"),
      input: panel.querySelector(".tab-input"),
      send: panel.querySelector(".tab-send"),
      close: panel.querySelector(".tab-close"),
    };
  }

  function addMessage(kind, text) {
    const node = document.createElement("div");
    node.className = `tab-msg tab-${kind}`;
    node.textContent = text;
    els.log.appendChild(node);
    els.log.scrollTop = els.log.scrollHeight;
    return node;
  }

  function showSuggestions() {
    els.chips.innerHTML = "";
    for (const text of SUGERENCIAS) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tab-chip";
      chip.textContent = text;
      chip.addEventListener("click", () => ask(text));
      els.chips.appendChild(chip);
    }
  }

  /** Cursiva de las citas: *— del archivo: ...* → <em> */
  function render(node, text) {
    node.innerHTML = "";
    const parts = text.split(/(\*[^*\n]+\*)/g);
    for (const part of parts) {
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        const em = document.createElement("em");
        em.textContent = part.slice(1, -1);
        node.appendChild(em);
      } else if (part) {
        node.appendChild(document.createTextNode(part));
      }
    }
  }

  async function ask(question) {
    if (busy || !question.trim()) return;

    busy = true;
    els.send.disabled = true;
    els.chips.innerHTML = "";
    els.input.value = "";

    addMessage("user", question);
    history.push({ role: "user", content: question });

    const bubble = addMessage("bot", "");
    bubble.classList.add("tab-typing");
    bubble.textContent = "sirviendo una jarra...";

    let answer = "";

    try {
      const res = await fetch(`${ENDPOINT}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || "El Tabernero no responde.");
      }

      bubble.classList.remove("tab-typing");
      bubble.textContent = "";

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // La última línea puede estar cortada al medio: la dejamos en el buffer.
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          // Solo texto visible: los bloques de thinking vienen vacíos.
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            answer += event.delta.text;
            render(bubble, answer);
            els.log.scrollTop = els.log.scrollHeight;
          } else if (event.type === "error") {
            throw new Error(event.error?.message || "Error en el stream.");
          }
        }
      }

      if (answer.trim()) {
        history.push({ role: "assistant", content: answer });
      } else {
        throw new Error("El Tabernero ha callado. Intentadlo de nuevo.");
      }
    } catch (err) {
      // La pregunta no llegó a tener respuesta: la sacamos del historial para
      // que un reintento no mande dos turnos de usuario seguidos.
      history.pop();
      bubble.classList.remove("tab-typing");
      bubble.className = "tab-msg tab-error";
      bubble.textContent = err.message;
    } finally {
      busy = false;
      els.send.disabled = false;
      els.input.focus();
    }
  }

  function open() {
    els.panel.classList.add("tab-open");
    els.launcher.hidden = true;
    if (els.log.children.length === 0) {
      addMessage("bot", SALUDO);
      showSuggestions();
    }
    els.input.focus();
  }

  function close() {
    els.panel.classList.remove("tab-open");
    els.launcher.hidden = false;
  }

  function init() {
    build();
    els.launcher.addEventListener("click", open);
    els.close.addEventListener("click", close);
    els.form.addEventListener("submit", (event) => {
      event.preventDefault();
      ask(els.input.value);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.panel.classList.contains("tab-open")) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
