/* ============================================================
 *  LODTE — Motor del sitio v2
 * ============================================================
 *  - Hash routing: lodte.com.ar/#tools, /#fornheim, etc.
 *  - Links compartibles y navegación directa por URL
 *  - Contenido editable desde content/site-data.js
 * ============================================================ */

(function () {
  "use strict";

  var currentPage = "home";
  var adminLoggedIn = false;
  var adminTab = "campaigns";
  var openCampaign = null;
  var openRecipe = null;
  var mobileMenuOpen = false;
  var loginAttempts = 0;
  var D = SITE_DATA;
  var VALID_PAGES = ["home","about","fornheim","campaigns","tools","banquetes","community","contact","admin_login","admin_panel"];

  function esc(str) {
    if (!str) return "";
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function initials(name) {
    return name.split(" ").map(function(n){ return n[0]; }).join("").slice(0, 2).toUpperCase();
  }

  // ── Hash Router ──
  function getPageFromHash() {
    var hash = window.location.hash.replace("#", "").replace("/", "");
    if (hash && VALID_PAGES.indexOf(hash) !== -1) return hash;
    return "home";
  }

  function navigateTo(page) {
    currentPage = page;
    mobileMenuOpen = false;
    window.location.hash = page === "home" ? "" : page;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", function() {
    var page = getPageFromHash();
    if (page !== currentPage) {
      currentPage = page;
      mobileMenuOpen = false;
      render();
      window.scrollTo({ top: 0 });
    }
  });

  // ── Particles ──
  function renderParticles() {
    var html = '<div class="bg-grid" aria-hidden="true"></div>';
    for (var i = 0; i < 12; i++) {
      var w = 2 + Math.random() * 3;
      html += '<div class="particle" aria-hidden="true" style="width:'+w+'px;height:'+w+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;opacity:'+(0.15+Math.random()*0.2)+';animation-duration:'+(8+Math.random()*12)+'s;animation-delay:'+(Math.random()*8)+'s;"></div>';
    }
    return html;
  }

  function sectionTitle(title, subtitle) {
    return '<div class="section-title"><div><span class="diamonds" aria-hidden="true">&#9670;&#9670;&#9670;</span> <h2>'+esc(title)+'</h2> <span class="diamonds" aria-hidden="true">&#9670;&#9670;&#9670;</span></div>'+(subtitle?'<p class="subtitle">'+esc(subtitle)+'</p>':'')+'</div>';
  }

  function pixelBorder(inner) {
    return '<div class="pixel-border"><div class="pixel-border-inner">'+inner+'</div></div>';
  }

  // ── Navbar ──
  function renderNavbar() {
    var links = [
      {p:"home",l:"Inicio"},{p:"about",l:"LODTE"},{p:"fornheim",l:"Fornheim"},
      {p:"campaigns",l:"Campañas"},{p:"tools",l:"Tools & Games"},
      {p:"banquetes",l:"Banquetes"},{p:"community",l:"Comunidad"},{p:"contact",l:"Contacto"}
    ];
    var dsk="", mob="";
    for(var i=0;i<links.length;i++){
      var a=currentPage===links[i].p?" active":"";
      dsk+='<a href="#'+links[i].p+'" class="navbar-link'+a+'" data-page="'+links[i].p+'">'+esc(links[i].l)+'</a>';
      mob+='<a href="#'+links[i].p+'" class="navbar-mobile-link'+a+'" data-page="'+links[i].p+'">'+esc(links[i].l)+'</a>';
    }
    mob+='<a href="#admin_login" class="navbar-mobile-link" data-page="admin_login">&#128274; Zona Privada</a>';
    return '<nav class="navbar" id="navbar" role="navigation" aria-label="Navegación principal"><div class="navbar-inner">'+
      '<a href="#" class="navbar-brand" data-page="home" aria-label="LODTE Inicio">&#9876; LODTE</a>'+
      '<div class="navbar-links">'+dsk+'<a href="#admin_login" class="navbar-lock" data-page="admin_login" aria-label="Zona privada">&#128274;</a></div>'+
      '<button class="navbar-mobile-btn" id="mobile-toggle" aria-label="Menú">&#9776;</button>'+
      '</div><div class="navbar-mobile-menu'+(mobileMenuOpen?' open':'')+'" id="mobile-menu">'+mob+'</div></nav>';
  }

  // ── Footer ──
  function renderFooter() {
    var nav=[{p:"home",l:"Inicio"},{p:"about",l:"LODTE"},{p:"fornheim",l:"Fornheim"},{p:"campaigns",l:"Campañas"},{p:"tools",l:"Tools & Games"}];
    var more=[{p:"banquetes",l:"Banquetes y Leyendas"},{p:"community",l:"Comunidad"},{p:"contact",l:"Contacto"}];
    var nh="",mh="",th="";
    for(var i=0;i<nav.length;i++) nh+='<a href="#'+nav[i].p+'" class="footer-link" data-page="'+nav[i].p+'">'+esc(nav[i].l)+'</a>';
    for(var j=0;j<more.length;j++) mh+='<a href="#'+more[j].p+'" class="footer-link" data-page="'+more[j].p+'">'+esc(more[j].l)+'</a>';
    for(var k=0;k<D.tools.length;k++) th+='<a href="'+esc(D.tools[k].url)+'" target="_blank" rel="noopener noreferrer" class="footer-link">'+esc(D.tools[k].name)+' &#8599;</a>';
    return '<footer class="footer" role="contentinfo"><div class="container"><div class="footer-grid">'+
      '<div><p class="footer-heading" style="font-size:10px;">LODTE</p><p style="font-size:13px;color:var(--gold-dim);line-height:1.5;">'+esc(D.config.tagline)+'</p><a href="'+esc(D.config.instagram)+'" target="_blank" rel="noopener noreferrer" class="footer-link" style="margin-top:8px;">'+esc(D.config.instagramHandle)+' &#8599;</a><a href="'+esc(D.config.youtube)+'" target="_blank" rel="noopener noreferrer" class="footer-link">'+esc(D.config.youtubeHandle)+' — YouTube &#8599;</a></div>'+
      '<div><p class="footer-heading">Navegación</p>'+nh+'</div>'+
      '<div><p class="footer-heading">Más</p>'+mh+'</div>'+
      '<div><p class="footer-heading">Tools &amp; Games</p>'+th+'</div>'+
      '</div><div class="footer-bottom"><p class="footer-copy">&copy; '+new Date().getFullYear()+' La Orden del Tabernero Errante &nbsp;|&nbsp; D&amp;D 5e &nbsp;|&nbsp; lodte.com.ar</p></div></div></footer>';
  }

  // ══════════════════════════════════════════
  //  PAGES
  // ══════════════════════════════════════════

  function pageHome() {
    var fc="";
    for(var i=0;i<Math.min(3,D.campaigns.length);i++){
      var c=D.campaigns[i];
      fc+='<a href="#campaigns" class="card clickable" data-page="campaigns" style="text-decoration:none;color:inherit;"><h3 class="card-title">'+esc(c.title)+'</h3><p class="card-meta mb-1">DM: '+esc(c.dm)+'</p><p class="card-text">'+esc(c.desc.slice(0,120))+'...</p></a>';
    }
    var ei=[{t:"Campañas",d:"Historias dirigidas por distintos DMs, con tonos, escalas y conflictos propios.",p:"campaigns"},{t:"Fornheim",d:"Nuestro mundo original: regiones, culturas, dioses y memoria viva.",p:"fornheim"},{t:"Tools & Games",d:"Apps, utilidades y juegos para potenciar tus sesiones de D&D.",p:"tools"},{t:"Banquetes",d:"Recetas épicas inspiradas en el lore de Fornheim para tu mesa.",p:"banquetes"}];
    var ec="";
    for(var j=0;j<ei.length;j++) ec+='<a href="#'+ei[j].p+'" class="card clickable" data-page="'+ei[j].p+'" style="text-decoration:none;color:inherit;"><h3 class="card-title">'+esc(ei[j].t)+'</h3><p class="card-text">'+esc(ei[j].d)+'</p></a>';

    return '<section class="hero"><div style="position:relative;z-index:1;max-width:800px;">'+
      '<div class="hero-subtitle">&#9876; Bienvenidos a &#9876;</div>'+
      '<h1>La Orden del<br/>Tabernero Errante</h1>'+
      '<p class="hero-desc">'+esc(D.config.tagline)+' '+esc(D.config.description)+'</p>'+
      '<div class="flex flex-center flex-wrap gap-12"><a href="#campaigns" class="btn btn-primary" data-page="campaigns">Explorar Campañas</a><a href="#fornheim" class="btn btn-secondary" data-page="fornheim">Conocer Fornheim</a></div>'+
      '</div><div class="hero-scroll" aria-hidden="true">&#9660; Scroll &#9660;</div></section>'+
      '<section class="section"><div class="container">'+sectionTitle("Explora LODTE","Lo que vas a encontrar en este archivo")+'<div class="grid grid-4">'+ec+'</div></div></section>'+
      '<section class="section"><div class="container">'+sectionTitle("Sobre Fornheim","La matriz narrativa de LODTE")+pixelBorder('<p class="prose mb-2">Fornheim es el corazón narrativo de buena parte de nuestras campañas: un territorio marcado por la guerra, la fe, la fragmentación política, la memoria de los clanes y los ecos de antiguas eras.</p><p class="prose-muted mb-3">No es solo un escenario. Es una geografía viva donde cada región impone sus reglas, cada linaje carga con su historia y cada conflicto deja cicatrices duraderas.</p><a href="#fornheim" class="btn btn-secondary" data-page="fornheim">Explorar Fornheim</a>')+'</div></section>'+
      '<section class="section"><div class="container">'+sectionTitle("Campañas Destacadas","Historias que marcaron la mesa")+'<div class="grid grid-2">'+fc+'</div></div></section>'+
      '<section class="section" style="padding-bottom:80px;"><div class="container text-center">'+pixelBorder('<p class="prose italic" style="max-width:600px;margin:0 auto;color:var(--text-main);">Toda campaña deja huellas. Toda mesa crea su mitología.<br/>Este sitio es el lugar donde esas huellas empiezan a ordenarse.</p>')+'</div></section>';
  }

  function pageAbout() {
    var mc="";
    for(var i=0;i<D.members.length;i++){
      var m=D.members[i];
      var hasUrl=m.url&&m.url.length>0;
      var open=hasUrl?'<a href="'+esc(m.url)+'" target="_blank" rel="noopener noreferrer" class="card clickable" style="text-decoration:none;color:inherit;display:block;">':'<div class="card">';
      var close=hasUrl?'</a>':'</div>';
      var arrow=hasUrl?' <span style="font-size:7px;opacity:0.6;">&#8599;</span>':'';
      mc+=open+
        '<div class="flex gap-12" style="align-items:center;margin-bottom:8px;"><div class="member-avatar">'+esc(initials(m.name))+'</div><div><p class="card-title" style="margin:0;font-size:8px;">'+esc(m.name)+arrow+'</p><p style="font-family:var(--font-body);font-size:13px;color:var(--gold-dark);margin:0;">'+esc(m.role)+'</p></div></div>'+
        (m.campaigns?'<p style="font-size:12px;color:var(--gold-dim);margin:0;">DM: '+esc(m.campaigns)+'</p>':'')+
        (m.extra?'<p style="font-size:12px;color:var(--gold-faint);margin-top:4px;">'+esc(m.extra)+'</p>':'')+
      close;
    }
    return '<div class="section-narrow">'+sectionTitle("Qué es LODTE","Mesa, archivo y proyecto")+
      '<div class="prose mb-4"><p>La Orden del Tabernero Errante es un grupo de amigos y creadores que comparte una pasión central: vivir y construir experiencias de rol memorables a través de Calabozos y Dragones.</p><p>Nuestro principal objetivo siempre fue disfrutar la riqueza narrativa y estratégica del juego, pero con el tiempo esa búsqueda se transformó en algo más amplio: un proceso sostenido de creación colectiva, donde cada campaña suma capas al mundo, a la mesa y a la identidad del grupo.</p></div>'+
      '<div class="mb-4"><h3 style="font-family:var(--font-pixel);font-size:12px;color:var(--gold);margin-bottom:16px;">Cómo trabajamos</h3>'+pixelBorder('<p class="prose-muted" style="margin:0;">En LODTE cada integrante aporta desde su propio lugar. A veces como Dungeon Master. A veces como jugador. A veces como impulsor de ideas, estética, tono, conflictos o worldbuilding. Nos interesa tanto la intensidad de una escena como la consistencia de un mundo. Tanto una gran batalla como la lógica íntima de un personaje. Tanto el reglamento como el relato.</p>')+'</div>'+
      '<div class="mb-4"><h3 style="font-family:var(--font-pixel);font-size:12px;color:var(--gold);margin-bottom:16px;">Nuestra visión</h3><p class="prose-muted">LODTE no se piensa solo como un grupo de juego. También se proyecta como una plataforma creativa con potencial comunitario, educativo y cultural. A futuro, imaginamos campañas abiertas, talleres, materiales de juego, recursos narrativos, mesas de iniciación, diseño de mundos, miniaturas, mapas, escenografías y otras herramientas capaces de acercar el rol a nuevas comunidades.</p></div>'+
      '<div class="mb-3 text-center"><a href="'+esc(D.config.instagram)+'" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">'+esc(D.config.instagramHandle)+' — The Dungeon Archives &#8599;</a></div>'+
      sectionTitle("La Orden","Los integrantes")+
      '<div class="grid grid-members">'+mc+'</div>'+
      '<div class="text-center" style="padding:40px 0;"><p class="prose italic" style="color:var(--text-muted);">LODTE es mesa, archivo y proyecto. Una comunidad pequeña en escala, pero grande en ambición narrativa.</p></div></div>';
  }

  function pageFornheim() {
    var s="";
    for(var i=0;i<D.fornheim_sections.length;i++){
      var sec=D.fornheim_sections[i];
      var has=sec.content!==null&&sec.content!==undefined;
      s+='<div class="card"><h4 class="card-title" style="font-size:9px;">'+esc(sec.title)+'</h4><p class="card-text">'+esc(sec.desc)+'</p>'+(has?'<div class="prose-muted" style="margin-top:12px;">'+sec.content+'</div>':'<p style="font-family:var(--font-pixel);font-size:7px;color:var(--gold-dim);margin-top:10px;font-style:italic;">Próximamente</p>')+'</div>';
    }
    return '<div class="section-narrow">'+sectionTitle("Fornheim","El corazón narrativo de LODTE")+
      pixelBorder('<p class="prose mb-2">Fornheim es uno de los ejes principales del universo narrativo de LODTE: un mundo de clanes, reinos, guerra, tradición, tensiones internas y fuerzas que atraviesan tanto lo político como lo sagrado.</p><p class="prose-muted" style="margin:0;">No se entiende desde una sola ciudad ni desde una sola campaña. Se entiende a través de sus fracturas: invasiones, lealtades quebradas, disputas de poder, regiones periféricas bajo presión y comunidades obligadas a redefinir su lugar en medio del conflicto.</p>')+
      '<div style="margin:40px 0;"><h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin-bottom:8px;">Fe, panteón y orden del mundo</h3><p class="prose-muted">La tradición tolfrádica ordena buena parte del vínculo entre lo humano, lo sagrado y la ley. Sus deidades encarnan valores, tensiones y aspectos fundamentales del mundo: guerra, conocimiento, fertilidad, océano, luz, estrategia, fuego, fortuna, celebración, muerte y naturaleza.</p></div>'+
      '<h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin-bottom:16px;">Explorar Fornheim</h3><div class="grid grid-3">'+s+'</div></div>';
  }

  function pageCampaigns() {
    var cards="";
    for(var i=0;i<D.campaigns.length;i++){
      var c=D.campaigns[i], isOpen=openCampaign===c.id;
      cards+='<div class="card clickable" data-campaign-id="'+c.id+'"><div class="flex" style="justify-content:space-between;align-items:flex-start;margin-bottom:8px;"><h3 class="card-title" style="flex:1;margin:0;">'+esc(c.title)+'</h3><span class="campaign-status">'+esc(c.status)+'</span></div><p class="card-meta mb-1">DM: '+esc(c.dm)+'</p><p style="font-size:12px;color:var(--gold-dim);margin:0 0 10px;">'+esc(c.setting)+' &middot; '+esc(c.tone)+'</p><div class="campaign-details'+(isOpen?' open':'')+'"><p class="prose-muted" style="font-size:15px;margin:0;">'+esc(c.desc)+'</p></div><p style="font-family:var(--font-pixel);font-size:7px;color:var(--gold-faint);margin:10px 0 0;text-align:right;">'+(isOpen?'&#9650; Cerrar':'&#9660; Ver más')+'</p></div>';
    }
    return '<div class="section-narrow" style="max-width:1000px;">'+sectionTitle("Campañas","Cada historia, una puerta distinta hacia el juego")+'<p class="prose-muted text-center mb-4" style="max-width:700px;margin-left:auto;margin-right:auto;">Algunas se apoyan en la épica bélica. Otras en el viaje, la exploración, la política, el misterio o la supervivencia. Todas dejan marcas en la memoria del grupo.</p><div class="grid grid-2">'+cards+'</div></div>';
  }

  function pageTools() {
    var cards="";
    for(var i=0;i<D.tools.length;i++){
      var t=D.tools[i], isGame=t.type==="game";
      cards+='<div class="pixel-border"><div class="pixel-border-inner text-center"><div class="tool-icon" aria-hidden="true">'+t.icon+'</div><span class="tool-type-badge '+(isGame?'tool-type-game':'tool-type-tool')+'">'+(isGame?'&#127918; Game':'&#128736; Tool')+'</span><h3 class="card-title" style="font-size:10px;line-height:1.6;">'+esc(t.name)+'</h3><p class="card-text mb-3">'+esc(t.desc)+'</p><a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Abrir &#8599;</a></div></div>';
    }
    return '<div class="section-narrow">'+sectionTitle("Tools & Games","Apps, utilidades y juegos para potenciar tus sesiones")+'<p class="prose-muted text-center mb-4" style="max-width:600px;margin-left:auto;margin-right:auto;">Herramientas y juegos creados por LODTE para facilitar, enriquecer y expandir la experiencia en la mesa.</p><div class="grid grid-2">'+cards+'</div><div class="text-center mt-4"><p style="font-family:var(--font-pixel);font-size:9px;color:var(--gold-dim);margin-bottom:8px;">Más en desarrollo...</p><p style="font-size:14px;color:var(--gold-faint);">El Tabernero (gestión de sesiones), El Caldero del Tabernero (post-procesamiento de audio con IA), y más.</p></div></div>';
  }

  function pageBanquetes() {
    var cards="";
    for(var i=0;i<D.recipes.length;i++){
      var r=D.recipes[i], isOpen=openRecipe===i;
      cards+='<div class="card clickable" data-recipe-id="'+i+'"><div class="flex" style="justify-content:space-between;align-items:flex-start;"><div><h3 class="card-title">'+esc(r.title)+'</h3><p style="font-size:13px;color:var(--gold-dark);margin:0;">Para '+esc(r.serves)+' &middot; Origen: '+esc(r.origin)+'</p></div><span style="font-family:var(--font-pixel);font-size:16px;color:var(--gold-dark);" aria-hidden="true">&#127830;</span></div><div class="recipe-expand'+(isOpen?' open':'')+'"><p class="prose-muted" style="font-size:15px;margin:0 0 12px;">'+esc(r.lore)+'</p><a href="'+esc(D.config.recipeDocUrl)+'" target="_blank" rel="noopener noreferrer" style="font-family:var(--font-pixel);font-size:8px;color:var(--gold);">Ver receta completa &#8599;</a></div></div>';
    }
    return '<div class="section-narrow">'+sectionTitle("Banquetes y Leyendas","Un viaje culinario por Fornheim")+pixelBorder('<div class="text-center"><p class="prose italic mb-1" style="color:var(--text-main);">"La mejor aventura empieza en la mesa... y a veces también termina en ella."</p><p class="prose-muted" style="margin:0;font-size:15px;">Banquetes y Leyendas es nuestro recetario temático: platos épicos inspirados en el lore de Fornheim, pensados para compartir entre aventureros antes, durante o después de cada sesión.</p></div>')+'<div class="grid mt-4" style="gap:16px;">'+cards+'</div><div class="text-center mt-4"><a href="'+esc(D.config.recipeDocUrl)+'" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Ver recetario completo &#8599;</a></div></div>';
  }

  function pageCommunity() {
    var cards="";
    for(var i=0;i<D.community_lines.length;i++){
      var it=D.community_lines[i];
      cards+='<div class="card"><h4 class="card-title" style="font-size:9px;">'+esc(it.title)+'</h4><p class="card-text">'+esc(it.desc)+'</p></div>';
    }
    return '<div class="section-narrow">'+sectionTitle("Comunidad y Proyección","El horizonte no termina en la mesa")+'<p class="prose mb-2">Creemos que Calabozos y Dragones no es solo entretenimiento. También puede ser una herramienta de imaginación, aprendizaje, colaboración y construcción cultural.</p><p class="prose-muted mb-4">Además del archivo de campañas, esta web busca dejar abierta una proyección futura: actividades formativas, propuestas abiertas, talleres, recursos para nuevos jugadores, materiales de apoyo y otras formas de encuentro alrededor del juego narrativo.</p><h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin-bottom:16px;">Líneas futuras</h3><div class="grid grid-3">'+cards+'</div><div class="text-center" style="padding:40px 0;">'+pixelBorder('<p class="prose italic text-center" style="margin:0;color:var(--text-main);">Hoy este sitio documenta lo que ya hicimos. Mañana también puede ser el punto de partida de lo que todavía no existe.</p>')+'</div></div>';
  }

  function pageContact() {
    return '<div class="section-narrow" style="max-width:700px;">'+sectionTitle("Contacto","Toda comunidad empieza con una invitación")+'<p class="prose-muted text-center mb-4">LODTE está en crecimiento. Si te interesa conocer más sobre nuestras campañas, nuestro mundo o futuras iniciativas vinculadas al rol, podés contactarnos.</p>'+
      pixelBorder('<form id="contact-form" action="https://formsubmit.co/'+esc(D.config.contactEmail)+'" method="POST" style="display:grid;gap:16px;"><input type="hidden" name="_subject" value="Nuevo mensaje desde lodte.com.ar"/><input type="hidden" name="_captcha" value="false"/><input type="hidden" name="_next" value="https://www.lodte.com.ar/"/><div><label class="form-label" for="c-name">Nombre</label><input type="text" name="name" id="c-name" class="form-input" required/></div><div><label class="form-label" for="c-email">Email</label><input type="email" name="email" id="c-email" class="form-input" required/></div><div><label class="form-label" for="c-msg">Mensaje</label><textarea name="message" id="c-msg" rows="4" class="form-textarea" required></textarea></div><button type="submit" class="btn btn-primary" style="width:100%;">Enviar Mensaje</button></form>')+
      '<p style="font-family:var(--font-pixel);font-size:8px;color:var(--gold-faint);text-align:center;margin-top:24px;">Este puede ser el primer paso.</p><div class="text-center mt-4" style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;"><a href="'+esc(D.config.instagram)+'" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">'+esc(D.config.instagramHandle)+' &#8599;</a><a href="'+esc(D.config.youtube)+'" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">'+esc(D.config.youtubeHandle)+' — YouTube &#8599;</a></div></div>';
  }

  function pageAdminLogin() {
    if(adminLoggedIn) return pageAdminPanel();
    var errorMsg = "";
    if (loginAttempts === 1 || loginAttempts === 2) errorMsg = "Contraseña incorrecta, inténtalo de nuevo";
    else if (loginAttempts === 3) errorMsg = "¿Cuál es la palabra mágica?";
    else if (loginAttempts >= 4) errorMsg = "No dijiste la palabra mágica...";
    var showError = loginAttempts > 0;
    return '<div class="section-narrow" style="max-width:400px;padding-top:140px;" id="admin-login-container">'+sectionTitle("Zona Privada","Solo para miembros de la Orden")+pixelBorder('<div style="text-align:center;"><div style="margin-bottom:16px;"><label class="form-label" for="admin-pass">Contraseña</label><input type="password" id="admin-pass" class="form-input" style="text-align:center;"/></div><p id="admin-error" style="font-family:var(--font-pixel);font-size:7px;color:var(--red-text);margin:0 0 12px;'+(showError?'':'display:none;')+'">'+esc(errorMsg)+'</p><button class="btn btn-primary" style="width:100%;" id="admin-login-btn">Entrar</button></div>')+'</div><div id="punishment-overlay" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;align-items:center;justify-content:center;"><video id="punishment-video" style="max-width:100%;max-height:100%;" playsinline></video></div>';
  }

  function pageAdminPanel() {
    var tabs=[{id:"campaigns",l:"Campañas"},{id:"chronicles",l:"Crónicas"},{id:"characters",l:"Personajes"},{id:"lore",l:"Lore / Fornheim"},{id:"recipes",l:"Recetas"},{id:"media",l:"Mediateca"}];
    var tb="",al="";
    for(var i=0;i<tabs.length;i++){var a=adminTab===tabs[i].id?" active":"";if(adminTab===tabs[i].id)al=tabs[i].l;tb+='<button class="admin-tab'+a+'" data-admin-tab="'+tabs[i].id+'">'+esc(tabs[i].l)+'</button>';}
    var tc="";
    if(adminTab==="campaigns"){for(var j=0;j<D.campaigns.length;j++){var c=D.campaigns[j];tc+='<div class="admin-item mb-1"><div><p class="card-title" style="font-size:9px;margin:0 0 4px;">'+esc(c.title)+'</p><p style="font-size:13px;color:var(--gold-dim);margin:0;">DM: '+esc(c.dm)+' &middot; '+esc(c.setting)+'</p></div><button class="btn btn-secondary btn-sm" style="padding:4px 10px;font-size:7px;">Editar</button></div>';}}
    else{tc='<div class="text-center" style="padding:40px 0;"><p style="font-family:var(--font-pixel);font-size:10px;color:var(--gold-faint);margin-bottom:8px;">Sección en desarrollo</p><p style="font-size:14px;color:var(--gold-ghost);">Aquí se podrán cargar y gestionar '+esc(al.toLowerCase())+' del universo LODTE.</p></div>';}
    return '<div class="section-narrow" style="max-width:1000px;"><div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:24px;">'+sectionTitle("Panel de la Orden")+'<button class="btn btn-secondary btn-sm" id="admin-logout">Salir</button></div><div class="admin-tabs">'+tb+'</div>'+pixelBorder('<div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:20px;"><h3 style="font-family:var(--font-pixel);font-size:11px;color:var(--gold);margin:0;">'+esc(al)+'</h3><button class="btn btn-primary btn-sm">+ Nuevo</button></div>'+tc)+'</div>';
  }

  // ── Render ──
  function render() {
    var pages={home:pageHome,about:pageAbout,fornheim:pageFornheim,campaigns:pageCampaigns,tools:pageTools,banquetes:pageBanquetes,community:pageCommunity,contact:pageContact,admin_login:pageAdminLogin,admin_panel:pageAdminPanel};
    var fn=pages[currentPage]||pageHome;
    document.getElementById("app").innerHTML=renderParticles()+renderNavbar()+'<main style="position:relative;z-index:1;" role="main">'+fn()+'</main>'+renderFooter();
    bindEvents();
    updateMeta();
  }

  function updateMeta() {
    var t={home:"LODTE | La Orden del Tabernero Errante",about:"Qué es LODTE | La Orden del Tabernero Errante",fornheim:"Fornheim | El Mundo de LODTE",campaigns:"Campañas | LODTE",tools:"Tools & Games | LODTE",banquetes:"Banquetes y Leyendas | LODTE",community:"Comunidad | LODTE",contact:"Contacto | LODTE",admin_login:"Zona Privada | LODTE",admin_panel:"Panel | LODTE"};
    document.title=t[currentPage]||t.home;
    var m=document.querySelector('meta[name="description"]');
    if(m){var d={home:"La Orden del Tabernero Errante: campañas, crónicas y mundos compartidos de Calabozos y Dragones. Archivo vivo de aventuras en Fornheim.",about:"Conocé a LODTE: un grupo de amigos y creadores dedicados a construir experiencias de rol memorables en Dungeons & Dragons.",fornheim:"Fornheim: un mundo de clanes, reinos, guerra y tradición. El corazón narrativo del universo de LODTE.",campaigns:"Campañas de LODTE: El Lamento de las Doncellas, Rough Sails, Solaris 3 y más historias de Calabozos y Dragones.",tools:"Herramientas y juegos digitales de LODTE: El Códice del Tabernero, Los Dados del Tabernero, Sala de Mapas y Goblin King.",banquetes:"Banquetes y Leyendas: recetas épicas inspiradas en Fornheim. Un viaje culinario por el mundo de LODTE.",community:"El futuro de LODTE: mesas abiertas, talleres, eventos y recursos para la comunidad de rol.",contact:"Contactá a La Orden del Tabernero Errante."};m.content=d[currentPage]||d.home;}
  }

  // ── Events ──
  function bindEvents() {
    var pl=document.querySelectorAll("[data-page]");
    for(var i=0;i<pl.length;i++) pl[i].addEventListener("click",function(e){e.preventDefault();e.stopPropagation();navigateTo(this.getAttribute("data-page"));});

    var mt=document.getElementById("mobile-toggle");
    if(mt) mt.addEventListener("click",function(){mobileMenuOpen=!mobileMenuOpen;var m=document.getElementById("mobile-menu");if(m)m.classList.toggle("open",mobileMenuOpen);this.textContent=mobileMenuOpen?"\u2715":"\u2630";});

    window.onscroll=function(){var n=document.getElementById("navbar");if(n)n.classList.toggle("scrolled",window.scrollY>20);};

    var cc=document.querySelectorAll("[data-campaign-id]");
    for(var j=0;j<cc.length;j++) cc[j].addEventListener("click",function(){var id=parseInt(this.getAttribute("data-campaign-id"),10);openCampaign=openCampaign===id?null:id;render();});

    var rc=document.querySelectorAll("[data-recipe-id]");
    for(var k=0;k<rc.length;k++) rc[k].addEventListener("click",function(e){if(e.target.tagName==="A")return;var id=parseInt(this.getAttribute("data-recipe-id"),10);openRecipe=openRecipe===id?null:id;render();});

    var lb=document.getElementById("admin-login-btn");
    if(lb){lb.addEventListener("click",doLogin);var pf=document.getElementById("admin-pass");if(pf){pf.addEventListener("keydown",function(e){if(e.key==="Enter")doLogin();});pf.focus();}}

    var lo=document.getElementById("admin-logout");
    if(lo) lo.addEventListener("click",function(){adminLoggedIn=false;navigateTo("home");});

    var at=document.querySelectorAll("[data-admin-tab]");
    for(var l=0;l<at.length;l++) at[l].addEventListener("click",function(){adminTab=this.getAttribute("data-admin-tab");render();});
  }

  // SHA-256 hash - la contraseña nunca aparece en texto plano en el código
  var PASS_HASH = "f18ac46472e9251eecf36cd91ee2cd288cd31b4b32bba3293fea4fbb45f10094";

  async function sha256(text) {
    var encoder = new TextEncoder();
    var data = encoder.encode(text);
    var hashBuffer = await crypto.subtle.digest("SHA-256", data);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function(b){ return b.toString(16).padStart(2,"0"); }).join("");
  }

  async function doLogin(){
    var p=document.getElementById("admin-pass");if(!p)return;
    var inputHash = await sha256(p.value);
    if(inputHash===PASS_HASH){adminLoggedIn=true;loginAttempts=0;navigateTo("admin_panel");return;}
    loginAttempts++;
    if(loginAttempts>=4){
      // 4th+ fail: show punishment video then redirect to YouTube
      render(); // show "No dijiste la palabra mágica..." message
      setTimeout(function(){
        var overlay=document.getElementById("punishment-overlay");
        var video=document.getElementById("punishment-video");
        if(overlay&&video){
          overlay.style.display="flex";
          video.src="assets/img/TaberneroJurassic.mp4";
          video.play();
          video.onended=function(){
            // Redirect to YouTube video fullscreen
            window.location.href="https://www.youtube.com/embed/dvFFonaNwoM?autoplay=1&rel=0";
          };
        }
      },800);
    } else {
      render(); // re-render to show updated error message
    }
  }

  // ── Init ──
  document.addEventListener("DOMContentLoaded",function(){currentPage=getPageFromHash();render();});
})();
