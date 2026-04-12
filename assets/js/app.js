/* ============================================================
 *  LODTE — Motor del sitio
 * ============================================================
 *  Este archivo lee los datos de content/site-data.js
 *  y renderiza todo el sitio.
 *  NO deberías necesitar editar este archivo para agregar
 *  contenido — usá content/site-data.js para eso.
 * ============================================================ */

(function () {
  "use strict";

  // ── State ──
  let currentPage = "home";
  let adminLoggedIn = false;
  let adminTab = "campaigns";
  let openCampaign = null;
  let openRecipe = null;
  let mobileMenuOpen = false;

  const D = SITE_DATA;

  // ── Helpers ──
  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function initials(name) {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  }

  // ── Navigation ──
  function navigateTo(page) {
    currentPage = page;
    mobileMenuOpen = false;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Particles ──
  function renderParticles() {
    let html = '<div class="bg-grid"></div>';
    for (let i = 0; i < 15; i++) {
      const w = 2 + Math.random() * 3;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const dur = 8 + Math.random() * 12;
      const delay = Math.random() * 8;
      const op = 0.15 + Math.random() * 0.2;
      html += `<div class="particle" style="width:${w}px;height:${w}px;left:${left}%;top:${top}%;opacity:${op};animation-duration:${dur}s;animation-delay:${delay}s;"></div>`;
    }
    return html;
  }

  // ── Section Title ──
  function sectionTitle(title, subtitle) {
    return `
      <div class="section-title">
        <div><span class="diamonds">&#9670;&#9670;&#9670;</span> <h2>${esc(title)}</h2> <span class="diamonds">&#9670;&#9670;&#9670;</span></div>
        ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ""}
      </div>`;
  }

  // ── Pixel Border ──
  function pixelBorder(innerHtml) {
    return `<div class="pixel-border"><div class="pixel-border-inner">${innerHtml}</div></div>`;
  }

  // ── Navbar ──
  function renderNavbar() {
    const links = [
      { page: "home", label: "Inicio" },
      { page: "about", label: "LODTE" },
      { page: "fornheim", label: "Fornheim" },
      { page: "campaigns", label: "Campañas" },
      { page: "tools", label: "Tools & Games" },
      { page: "banquetes", label: "Banquetes" },
      { page: "community", label: "Comunidad" },
      { page: "contact", label: "Contacto" },
    ];

    const desktopLinks = links.map(l =>
      `<button class="navbar-link ${currentPage === l.page ? 'active' : ''}" data-page="${l.page}">${esc(l.label)}</button>`
    ).join("");

    const mobileLinks = links.map(l =>
      `<button class="navbar-mobile-link ${currentPage === l.page ? 'active' : ''}" data-page="${l.page}">${esc(l.label)}</button>`
    ).join("") + `<button class="navbar-mobile-link" data-page="admin_login">🔒 Zona Privada</button>`;

    return `
      <nav class="navbar" id="navbar">
        <div class="navbar-inner">
          <button class="navbar-brand" data-page="home">⚔ LODTE</button>
          <div class="navbar-links">
            ${desktopLinks}
            <button class="navbar-lock" data-page="admin_login">🔒</button>
          </div>
          <button class="navbar-mobile-btn" id="mobile-toggle">☰</button>
        </div>
        <div class="navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}" id="mobile-menu">
          ${mobileLinks}
        </div>
      </nav>`;
  }

  // ── Footer ──
  function renderFooter() {
    const navLinks = [
      { page: "home", label: "Inicio" },
      { page: "about", label: "LODTE" },
      { page: "fornheim", label: "Fornheim" },
      { page: "campaigns", label: "Campañas" },
      { page: "tools", label: "Tools & Games" },
    ];
    const moreLinks = [
      { page: "banquetes", label: "Banquetes y Leyendas" },
      { page: "community", label: "Comunidad" },
      { page: "contact", label: "Contacto" },
    ];

    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <p class="footer-heading" style="font-size:10px;">LODTE</p>
              <p style="font-size:13px;color:var(--gold-dim);line-height:1.5;">${esc(D.config.tagline)}</p>
              <a href="${esc(D.config.instagram)}" target="_blank" rel="noopener noreferrer" class="footer-link" style="margin-top:8px;">${esc(D.config.instagramHandle)} ↗</a>
            </div>
            <div>
              <p class="footer-heading">Navegación</p>
              ${navLinks.map(l => `<span class="footer-link" data-page="${l.page}">${esc(l.label)}</span>`).join("")}
            </div>
            <div>
              <p class="footer-heading">Más</p>
              ${moreLinks.map(l => `<span class="footer-link" data-page="${l.page}">${esc(l.label)}</span>`).join("")}
            </div>
            <div>
              <p class="footer-heading">Tools & Games</p>
              ${D.tools.map(t => `<a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" class="footer-link">${esc(t.name)} ↗</a>`).join("")}
            </div>
          </div>
          <div class="footer-bottom">
            <p class="footer-copy">© ${new Date().getFullYear()} La Orden del Tabernero Errante · D&D 5e · lodte.com.ar</p>
          </div>
        </div>
      </footer>`;
  }

  // ── Pages ──

  function pageHome() {
    const featuredCampaigns = D.campaigns.slice(0, 3).map(c => `
      <div class="card clickable" data-page="campaigns">
        <h3 class="card-title">${esc(c.title)}</h3>
        <p class="card-meta mb-1">DM: ${esc(c.dm)}</p>
        <p class="card-text">${esc(c.desc.slice(0, 120))}...</p>
      </div>`).join("");

    const exploreCards = [
      { title: "Campañas", desc: "Historias dirigidas por distintos DMs, con tonos, escalas y conflictos propios.", page: "campaigns" },
      { title: "Fornheim", desc: "Nuestro mundo original: regiones, culturas, dioses y memoria viva.", page: "fornheim" },
      { title: "Tools & Games", desc: "Apps, utilidades y juegos para potenciar tus sesiones de D&D.", page: "tools" },
      { title: "Banquetes", desc: "Recetas épicas inspiradas en el lore de Fornheim para tu mesa.", page: "banquetes" },
    ].map(item => `
      <div class="card clickable" data-page="${item.page}">
        <h3 class="card-title">${esc(item.title)}</h3>
        <p class="card-text">${esc(item.desc)}</p>
      </div>`).join("");

    return `
      <section class="hero">
        <div style="position:relative;z-index:1;max-width:800px;">
          <div class="hero-subtitle">⚔ Bienvenidos a ⚔</div>
          <h1>La Orden del<br/>Tabernero Errante</h1>
          <p class="hero-desc">${esc(D.config.tagline)} ${esc(D.config.description)}</p>
          <div class="flex flex-center flex-wrap gap-12">
            <button class="btn btn-primary" data-page="campaigns">Explorar Campañas</button>
            <button class="btn btn-secondary" data-page="fornheim">Conocer Fornheim</button>
          </div>
        </div>
        <div class="hero-scroll">▼ Scroll ▼</div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionTitle("Explora LODTE", "Lo que vas a encontrar en este archivo")}
          <div class="grid grid-4">${exploreCards}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionTitle("Sobre Fornheim", "La matriz narrativa de LODTE")}
          ${pixelBorder(`
            <p class="prose mb-2">Fornheim es el corazón narrativo de buena parte de nuestras campañas: un territorio marcado por la guerra, la fe, la fragmentación política, la memoria de los clanes y los ecos de antiguas eras.</p>
            <p class="prose-muted mb-3">No es solo un escenario. Es una geografía viva donde cada región impone sus reglas, cada linaje carga con su historia y cada conflicto deja cicatrices duraderas.</p>
            <button class="btn btn-secondary" data-page="fornheim">Explorar Fornheim</button>
          `)}
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionTitle("Campañas Destacadas", "Historias que marcaron la mesa")}
          <div class="grid grid-2">${featuredCampaigns}</div>
        </div>
      </section>

      <section class="section" style="padding-bottom:80px;">
        <div class="container text-center">
          ${pixelBorder(`
            <p class="prose italic" style="max-width:600px;margin:0 auto;color:var(--text-main);">
              Toda campaña deja huellas. Toda mesa crea su mitología.<br/>
              Este sitio es el lugar donde esas huellas empiezan a ordenarse.
            </p>
          `)}
        </div>
      </section>`;
  }

  function pageAbout() {
    const memberCards = D.members.map(m => `
      <div class="card">
        <div class="flex gap-12" style="align-items:center;margin-bottom:8px;">
          <div class="member-avatar">${esc(initials(m.name))}</div>
          <div>
            <p class="card-title" style="margin:0;font-size:8px;">${esc(m.name)}</p>
            <p style="font-family:var(--font-body);font-size:13px;color:var(--gold-dark);margin:0;">${esc(m.role)}</p>
          </div>
        </div>
        ${m.campaigns ? `<p style="font-size:12px;color:var(--gold-dim);margin:0;">DM: ${esc(m.campaigns)}</p>` : ""}
        ${m.extra ? `<p style="font-size:12px;color:var(--gold-faint);margin-top:4px;">${esc(m.extra)}</p>` : ""}
      </div>`).join("");

    return `
      <div class="section-narrow">
        ${sectionTitle("Qué es LODTE", "Mesa, archivo y proyecto")}
        <div class="prose mb-4">
          <p>La Orden del Tabernero Errante es un grupo de amigos y creadores que comparte una pasión central: vivir y construir experiencias de rol memorables a través de Calabozos y Dragones.</p>
          <p>Nuestro principal objetivo siempre fue disfrutar la riqueza narrativa y estratégica del juego, pero con el tiempo esa búsqueda se transformó en algo más amplio: un proceso sostenido de creación colectiva, donde cada campaña suma capas al mundo, a la mesa y a la identidad del grupo.</p>
        </div>

        <div class="mb-4">
          <h3 style="font-family:var(--font-pixel);font-size:12px;color:var(--gold);margin-bottom:16px;">Cómo trabajamos</h3>
          ${pixelBorder(`<p class="prose-muted" style="margin:0;">En LODTE cada integrante aporta desde su propio lugar. A veces como Dungeon Master. A veces como jugador. A veces como impulsor de ideas, estética, tono, conflictos o worldbuilding. Nos interesa tanto la intensidad de una escena como la consistencia de un mundo. Tanto una gran batalla como la lógica íntima de un personaje. Tanto el reglamento como el relato.</p>`)}
        </div>

        <div class="mb-4">
          <h3 style="font-family:var(--font-pixel);font-size:12px;color:var(--gold);margin-bottom:16px;">Nuestra visión</h3>
          <p class="prose-muted">LODTE no se piensa solo como un grupo de juego. También se proyecta como una plataforma creativa con potencial comunitario, educativo y cultural. A futuro, imaginamos campañas abiertas, talleres, materiales de juego, recursos narrativos, mesas de iniciación, diseño de mundos, miniaturas, mapas, escenografías y otras herramientas capaces de acercar el rol a nuevas comunidades.</p>
        </div>

        <div class="mb-3 text-center">
          <a href="${esc(D.config.instagram)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            ${esc(D.config.instagramHandle)} — The Dungeon Archives ↗
          </a>
        </div>

        ${sectionTitle("La Orden", "Los integrantes")}
        <div class="grid grid-members">${memberCards}</div>

        <div class="text-center" style="padding:40px 0;">
          <p class="prose italic" style="color:var(--text-muted);">LODTE es mesa, archivo y proyecto. Una comunidad pequeña en escala, pero grande en ambición narrativa.</p>
        </div>
      </div>`;
  }

  function pageFornheim() {
    const sections = D.fornheim_sections.map(s => {
      const hasContent = s.content !== null && s.content !== undefined;
      return `
        <div class="card ${hasContent ? 'clickable' : ''}" ${hasContent ? `onclick="document.getElementById('fornheim-${esc(s.title)}').classList.toggle('open')"` : ""}>
          <h4 class="card-title" style="font-size:9px;">${esc(s.title)}</h4>
          <p class="card-text">${esc(s.desc)}</p>
          ${hasContent
            ? `<div id="fornheim-${esc(s.title)}" class="campaign-details"><div class="prose-muted" style="margin-top:12px;">${s.content}</div></div>`
            : `<p style="font-family:var(--font-pixel);font-size:7px;color:var(--gold-dim);margin-top:10px;font-style:italic;">Próximamente</p>`
          }
        </div>`;
    }).join("");

    return `
      <div class="section-narrow">
        ${sectionTitle("Fornheim", "El corazón narrativo de LODTE")}
        ${pixelBorder(`
          <p class="prose mb-2">Fornheim es uno de los ejes principales del universo narrativo de LODTE: un mundo de clanes, reinos, guerra, tradición, tensiones internas y fuerzas que atraviesan tanto lo político como lo sagrado.</p>
          <p class="prose-muted" style="margin:0;">No se entiende desde una sola ciudad ni desde una sola campaña. Se entiende a través de sus fracturas: invasiones, lealtades quebradas, disputas de poder, regiones periféricas bajo presión y comunidades obligadas a redefinir su lugar en medio del conflicto.</p>
        `)}

        <div style="margin:40px 0;">
          <h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin-bottom:8px;">Fe, panteón y orden del mundo</h3>
          <p class="prose-muted">La tradición tolfrádica ordena buena parte del vínculo entre lo humano, lo sagrado y la ley. Sus deidades encarnan valores, tensiones y aspectos fundamentales del mundo: guerra, conocimiento, fertilidad, océano, luz, estrategia, fuego, fortuna, celebración, muerte y naturaleza.</p>
        </div>

        <h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin-bottom:16px;">Explorar Fornheim</h3>
        <div class="grid grid-3">${sections}</div>
      </div>`;
  }

  function pageCampaigns() {
    const cards = D.campaigns.map(c => `
      <div class="card clickable" onclick="window.LODTE.toggleCampaign(${c.id})">
        <div class="flex" style="justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h3 class="card-title" style="flex:1;margin:0;">${esc(c.title)}</h3>
          <span class="campaign-status">${esc(c.status)}</span>
        </div>
        <p class="card-meta mb-1">DM: ${esc(c.dm)}</p>
        <p style="font-size:12px;color:var(--gold-dim);margin:0 0 10px;">${esc(c.setting)} · ${esc(c.tone)}</p>
        <div class="campaign-details ${openCampaign === c.id ? 'open' : ''}" id="campaign-${c.id}">
          <p class="prose-muted" style="font-size:15px;margin:0;">${esc(c.desc)}</p>
        </div>
        <p style="font-family:var(--font-pixel);font-size:7px;color:var(--gold-faint);margin:10px 0 0;text-align:right;">
          ${openCampaign === c.id ? "▲ Cerrar" : "▼ Ver más"}
        </p>
      </div>`).join("");

    return `
      <div class="section-narrow" style="max-width:1000px;">
        ${sectionTitle("Campañas", "Cada historia, una puerta distinta hacia el juego")}
        <p class="prose-muted text-center mb-4" style="max-width:700px;margin-left:auto;margin-right:auto;">
          Algunas se apoyan en la épica bélica. Otras en el viaje, la exploración, la política, el misterio o la supervivencia. Todas dejan marcas en la memoria del grupo.
        </p>
        <div class="grid grid-2">${cards}</div>
      </div>`;
  }

  function pageTools() {
    const cards = D.tools.map(t => {
      const isGame = t.type === "game";
      return `
        <div class="pixel-border">
          <div class="pixel-border-inner text-center">
            <div class="tool-icon">${t.icon}</div>
            <span class="tool-type-badge ${isGame ? 'tool-type-game' : 'tool-type-tool'}">${isGame ? '🎮 Game' : '🛠 Tool'}</span>
            <h3 class="card-title" style="font-size:10px;line-height:1.6;">${esc(t.name)}</h3>
            <p class="card-text mb-3">${esc(t.desc)}</p>
            <a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Abrir ↗</a>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="section-narrow">
        ${sectionTitle("Tools & Games", "Apps, utilidades y juegos para potenciar tus sesiones")}
        <p class="prose-muted text-center mb-4" style="max-width:600px;margin-left:auto;margin-right:auto;">
          Herramientas y juegos creados por LODTE para facilitar, enriquecer y expandir la experiencia en la mesa.
        </p>
        <div class="grid grid-2">${cards}</div>
        <div class="text-center mt-4">
          <p style="font-family:var(--font-pixel);font-size:9px;color:var(--gold-dim);margin-bottom:8px;">Más en desarrollo...</p>
          <p style="font-size:14px;color:var(--gold-faint);">El Tabernero (gestión de sesiones), El Caldero del Tabernero (post-procesamiento de audio con IA), y más.</p>
        </div>
      </div>`;
  }

  function pageBanquetes() {
    const cards = D.recipes.map((r, i) => `
      <div class="card clickable" onclick="window.LODTE.toggleRecipe(${i})">
        <div class="flex" style="justify-content:space-between;align-items:flex-start;">
          <div>
            <h3 class="card-title">${esc(r.title)}</h3>
            <p style="font-size:13px;color:var(--gold-dark);margin:0;">Para ${esc(r.serves)} · Origen: ${esc(r.origin)}</p>
          </div>
          <span style="font-family:var(--font-pixel);font-size:16px;color:var(--gold-dark);">🍖</span>
        </div>
        <div class="recipe-expand ${openRecipe === i ? 'open' : ''}" id="recipe-${i}">
          <p class="prose-muted" style="font-size:15px;margin:0 0 12px;">${esc(r.lore)}</p>
          <a href="${esc(D.config.recipeDocUrl)}" target="_blank" rel="noopener noreferrer" style="font-family:var(--font-pixel);font-size:8px;color:var(--gold);">Ver receta completa ↗</a>
        </div>
      </div>`).join("");

    return `
      <div class="section-narrow">
        ${sectionTitle("Banquetes y Leyendas", "Un viaje culinario por Fornheim")}
        ${pixelBorder(`
          <div class="text-center">
            <p class="prose italic mb-1" style="color:var(--text-main);">"La mejor aventura empieza en la mesa... y a veces también termina en ella."</p>
            <p class="prose-muted" style="margin:0;font-size:15px;">Banquetes y Leyendas es nuestro recetario temático: platos épicos inspirados en el lore de Fornheim, pensados para compartir entre aventureros antes, durante o después de cada sesión.</p>
          </div>
        `)}
        <div class="grid mt-4" style="gap:16px;">${cards}</div>
        <div class="text-center mt-4">
          <a href="${esc(D.config.recipeDocUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Ver recetario completo ↗</a>
        </div>
      </div>`;
  }

  function pageCommunity() {
    const cards = D.community_lines.map(item => `
      <div class="card">
        <h4 class="card-title" style="font-size:9px;">${esc(item.title)}</h4>
        <p class="card-text">${esc(item.desc)}</p>
      </div>`).join("");

    return `
      <div class="section-narrow">
        ${sectionTitle("Comunidad y Proyección", "El horizonte no termina en la mesa")}
        <p class="prose mb-2">Creemos que Calabozos y Dragones no es solo entretenimiento. También puede ser una herramienta de imaginación, aprendizaje, colaboración y construcción cultural.</p>
        <p class="prose-muted mb-4">Además del archivo de campañas, esta web busca dejar abierta una proyección futura: actividades formativas, propuestas abiertas, talleres, recursos para nuevos jugadores, materiales de apoyo y otras formas de encuentro alrededor del juego narrativo.</p>

        <h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin-bottom:16px;">Líneas futuras</h3>
        <div class="grid grid-3">${cards}</div>

        <div class="text-center" style="padding:40px 0;">
          ${pixelBorder(`<p class="prose italic text-center" style="margin:0;color:var(--text-main);">Hoy este sitio documenta lo que ya hicimos. Mañana también puede ser el punto de partida de lo que todavía no existe.</p>`)}
        </div>
      </div>`;
  }

  function pageContact() {
    return `
      <div class="section-narrow" style="max-width:700px;">
        ${sectionTitle("Contacto", "Toda comunidad empieza con una invitación")}
        <p class="prose-muted text-center mb-4">LODTE está en crecimiento. Si te interesa conocer más sobre nuestras campañas, nuestro mundo o futuras iniciativas vinculadas al rol, podés contactarnos.</p>
        ${pixelBorder(`
          <form id="contact-form" action="https://formsubmit.co/${esc(D.config.contactEmail)}" method="POST" style="display:grid;gap:16px;">
            <input type="hidden" name="_subject" value="Nuevo mensaje desde lodte.com.ar" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="https://www.lodte.com.ar/" />
            <div>
              <label class="form-label">Nombre</label>
              <input type="text" name="name" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Email</label>
              <input type="email" name="email" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Mensaje</label>
              <textarea name="message" rows="4" class="form-textarea" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Enviar Mensaje</button>
          </form>
        `)}
        <p style="font-family:var(--font-pixel);font-size:8px;color:var(--gold-faint);text-align:center;margin-top:24px;">Este puede ser el primer paso.</p>

        <div class="text-center mt-4">
          <a href="${esc(D.config.instagram)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            ${esc(D.config.instagramHandle)} ↗
          </a>
        </div>
      </div>`;
  }

  function pageAdminLogin() {
    if (adminLoggedIn) return pageAdminPanel();
    return `
      <div class="section-narrow" style="max-width:400px;padding-top:140px;">
        ${sectionTitle("Zona Privada", "Solo para miembros de la Orden")}
        ${pixelBorder(`
          <div style="text-align:center;">
            <div style="margin-bottom:16px;">
              <label class="form-label">Contraseña</label>
              <input type="password" id="admin-pass" class="form-input" style="text-align:center;" />
            </div>
            <p id="admin-error" class="hidden" style="font-family:var(--font-pixel);font-size:7px;color:var(--red-text);margin:0 0 12px;">Contraseña incorrecta</p>
            <button class="btn btn-primary" style="width:100%;" id="admin-login-btn">Entrar</button>
          </div>
        `)}
      </div>`;
  }

  function pageAdminPanel() {
    const tabs = [
      { id: "campaigns", label: "Campañas" },
      { id: "chronicles", label: "Crónicas" },
      { id: "characters", label: "Personajes" },
      { id: "lore", label: "Lore / Fornheim" },
      { id: "recipes", label: "Recetas" },
      { id: "media", label: "Mediateca" },
    ];

    const tabBtns = tabs.map(t =>
      `<button class="admin-tab ${adminTab === t.id ? 'active' : ''}" data-admin-tab="${t.id}">${esc(t.label)}</button>`
    ).join("");

    let tabContent = "";
    if (adminTab === "campaigns") {
      tabContent = D.campaigns.map(c => `
        <div class="admin-item mb-1">
          <div>
            <p class="card-title" style="font-size:9px;margin:0 0 4px;">${esc(c.title)}</p>
            <p style="font-size:13px;color:var(--gold-dim);margin:0;">DM: ${esc(c.dm)} · ${esc(c.setting)}</p>
          </div>
          <button class="btn btn-secondary btn-sm" style="padding:4px 10px;font-size:7px;">Editar</button>
        </div>`).join("");
    } else {
      const tabLabel = tabs.find(t => t.id === adminTab)?.label || "";
      tabContent = `
        <div class="text-center" style="padding:40px 0;">
          <p style="font-family:var(--font-pixel);font-size:10px;color:var(--gold-faint);margin-bottom:8px;">Sección en desarrollo</p>
          <p style="font-size:14px;color:var(--gold-ghost);">Aquí se podrán cargar y gestionar ${esc(tabLabel.toLowerCase())} del universo LODTE.</p>
        </div>`;
    }

    return `
      <div class="section-narrow" style="max-width:1000px;">
        <div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:24px;">
          ${sectionTitle("Panel de la Orden")}
          <button class="btn btn-secondary btn-sm" id="admin-logout">Salir</button>
        </div>
        <div class="admin-tabs">${tabBtns}</div>
        ${pixelBorder(`
          <div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin:0;">${esc(tabs.find(t => t.id === adminTab)?.label || "")}</h3>
            <button class="btn btn-primary btn-sm">+ Nuevo</button>
          </div>
          ${tabContent}
        `)}
      </div>`;
  }

  // ── Main Render ──
  function render() {
    const pages = {
      home: pageHome,
      about: pageAbout,
      fornheim: pageFornheim,
      campaigns: pageCampaigns,
      tools: pageTools,
      banquetes: pageBanquetes,
      community: pageCommunity,
      contact: pageContact,
      admin_login: pageAdminLogin,
      admin_panel: pageAdminPanel,
    };

    const pageRenderer = pages[currentPage] || pageHome;

    document.getElementById("app").innerHTML =
      renderParticles() +
      renderNavbar() +
      `<main style="position:relative;z-index:1;">${pageRenderer()}</main>` +
      renderFooter();

    bindEvents();
    updateMetaTags();
  }

  // ── SEO Meta Tags ──
  function updateMetaTags() {
    const titles = {
      home: "LODTE — La Orden del Tabernero Errante",
      about: "Qué es LODTE — La Orden del Tabernero Errante",
      fornheim: "Fornheim — El Mundo de LODTE",
      campaigns: "Campañas — LODTE",
      tools: "Tools & Games — LODTE",
      banquetes: "Banquetes y Leyendas — LODTE",
      community: "Comunidad — LODTE",
      contact: "Contacto — LODTE",
      admin_login: "Zona Privada — LODTE",
      admin_panel: "Panel — LODTE",
    };
    document.title = titles[currentPage] || titles.home;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descs = {
        home: "La Orden del Tabernero Errante: campañas, crónicas y mundos compartidos de Calabozos y Dragones. Archivo vivo de aventuras en Fornheim.",
        about: "Conocé a LODTE: un grupo de amigos y creadores dedicados a construir experiencias de rol memorables en Dungeons & Dragons.",
        fornheim: "Fornheim: un mundo de clanes, reinos, guerra y tradición. El corazón narrativo del universo de LODTE.",
        campaigns: "Campañas de LODTE: El Lamento de las Doncellas, Rough Sails, Solaris 3 y más historias de Calabozos y Dragones.",
        tools: "Herramientas y juegos digitales de LODTE: El Códice del Tabernero, Los Dados del Tabernero, Sala de Mapas y Goblin King.",
        banquetes: "Banquetes y Leyendas: recetas épicas inspiradas en Fornheim. Un viaje culinario por el mundo de LODTE.",
        community: "El futuro de LODTE: mesas abiertas, talleres, eventos y recursos para la comunidad de rol.",
        contact: "Contactá a La Orden del Tabernero Errante. Escribinos para saber más sobre campañas, mundos y rol.",
      };
      metaDesc.content = descs[currentPage] || descs.home;
    }
  }

  // ── Event Binding ──
  function bindEvents() {
    // Navigation clicks (buttons and spans with data-page)
    document.querySelectorAll("[data-page]").forEach(el => {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigateTo(this.dataset.page);
      });
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        mobileMenuOpen = !mobileMenuOpen;
        const menu = document.getElementById("mobile-menu");
        if (menu) menu.classList.toggle("open", mobileMenuOpen);
        this.textContent = mobileMenuOpen ? "✕" : "☰";
      });
    }

    // Scroll effect on navbar
    window.onscroll = function () {
      const nav = document.getElementById("navbar");
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
    };

    // Admin login
    const loginBtn = document.getElementById("admin-login-btn");
    if (loginBtn) {
      loginBtn.addEventListener("click", handleAdminLogin);
      const passField = document.getElementById("admin-pass");
      if (passField) {
        passField.addEventListener("keydown", function (e) {
          if (e.key === "Enter") handleAdminLogin();
        });
      }
    }

    // Admin logout
    const logoutBtn = document.getElementById("admin-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        adminLoggedIn = false;
        navigateTo("home");
      });
    }

    // Admin tabs
    document.querySelectorAll("[data-admin-tab]").forEach(el => {
      el.addEventListener("click", function () {
        adminTab = this.dataset.adminTab;
        render();
      });
    });
  }

  function handleAdminLogin() {
    const pass = document.getElementById("admin-pass")?.value;
    if (pass === "fornheim2024") {
      adminLoggedIn = true;
      navigateTo("admin_panel");
    } else {
      const err = document.getElementById("admin-error");
      if (err) err.classList.remove("hidden");
    }
  }

  // ── Exposed functions for onclick in HTML ──
  window.LODTE = {
    toggleCampaign: function (id) {
      openCampaign = openCampaign === id ? null : id;
      render();
    },
    toggleRecipe: function (i) {
      openRecipe = openRecipe === i ? null : i;
      render();
    },
  };

  // ── Init ──
  document.addEventListener("DOMContentLoaded", function () {
    render();
  });

})();
