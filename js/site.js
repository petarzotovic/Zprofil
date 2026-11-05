/* Zprofil - ponasanje sajta */
(function () {
  var BP = 1200;
  var isMobile = window.matchMedia('(max-width: ' + (BP - 0.02) + 'px)').matches;

  // Ostavi samo verziju koja odgovara ekranu (desktop ili mobilna)
  var drop = document.querySelector(isMobile ? '.v-d' : '.v-m');
  if (drop) drop.parentNode.removeChild(drop);
  window.matchMedia('(max-width: ' + (BP - 0.02) + 'px)').addEventListener('change', function () { location.reload(); });

  var header = document.querySelector('.hdr');
  var menuOpen = false;

  // Meni: providan preko hero slike, dobija pozadinu pri skrolovanju
  function onScroll() {
    var hero = document.getElementById('top');
    if (!header || !hero) return;
    var scrolled = hero.getBoundingClientRect().top < -8;
    var solid = scrolled || menuOpen;
    header.classList.toggle('solid', solid);
    header.classList.toggle('top', !solid);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger meni na telefonu
  var burger = document.querySelector('.burger[data-act="toggle"]');
  var nav = document.querySelector('.mnav');
  var ov = document.querySelector('.mnav-ov');
  var prod = document.querySelector('.mnav-p');
  var sub = document.querySelector('.msub');
  function setMenu(open) {
    menuOpen = open;
    [burger, nav, ov].forEach(function (el) { if (el) el.classList.toggle('open', open); });
    if (burger) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    }
    if (!open) setProd(false);
    onScroll();
  }
  function setProd(open) {
    if (prod) { prod.classList.toggle('open', open); prod.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    if (sub) sub.classList.toggle('open', open);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'toggle') setMenu(!menuOpen);
    else if (act === 'close') setMenu(false);
    else if (act === 'prod') {
      // prvi dodir otvara podmeni, drugi vodi na stranicu Proizvodi
      if (!prod.classList.contains('open')) { e.preventDefault(); setProd(true); }
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  // Recenzije na telefonu: beskonacna traka koja se moze prevlaciti
  var box = document.querySelector('.rev-marquee');
  var track = box && box.querySelector('.rev-track');
  if (box && track) {
    var speed = 0.035, offset = 0, dragging = false, startX = 0, startOffset = 0, pid = null;
    var vel = 0, lastX = 0, lastT = 0, last = performance.now();
    box.addEventListener('pointerdown', function (e) {
      dragging = true; pid = e.pointerId; startX = lastX = e.clientX; startOffset = offset;
      lastT = performance.now(); vel = 0;
      try { box.setPointerCapture(pid); } catch (err) {}
    });
    box.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var now = performance.now(), dt = Math.max(now - lastT, 1);
      vel = 0.8 * vel + 0.2 * ((e.clientX - lastX) / dt);
      lastX = e.clientX; lastT = now;
      offset = startOffset + (e.clientX - startX);
    });
    function up(e) { if (dragging && (!e || e.pointerId === pid)) { dragging = false; pid = null; } }
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
    box.addEventListener('lostpointercapture', up);
    box.addEventListener('dragstart', function (e) { e.preventDefault(); });
    (function tick(now) {
      var dt = Math.min(now - last, 50); last = now;
      var set = track.scrollWidth / 2;
      if (!dragging) {
        offset += vel * dt; vel *= Math.pow(0.94, dt / 16);
        if (Math.abs(vel) < 0.02) vel = 0;
        offset -= speed * dt;
      }
      if (set > 0) { while (offset <= -set) offset += set; while (offset > 0) offset -= set; }
      track.style.transform = 'translate3d(' + offset.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(tick);
    })(last);
  }

  // Slajder projekata na telefonu: tackice prate i pomeraju slajder
  var slider = document.querySelector('.slider');
  var dots = document.querySelectorAll('.dot');
  if (slider && dots.length) {
    var slides = slider.children;
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (slides[i]) slider.scrollTo({ left: slides[i].offsetLeft - slider.offsetLeft, behavior: 'smooth' });
      });
    });
    slider.addEventListener('scroll', function () {
      var idx = 0, best = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var d = Math.abs(slides[i].offsetLeft - slider.offsetLeft - slider.scrollLeft);
        if (d < best) { best = d; idx = i; }
      }
      dots.forEach(function (dot, i) { dot.classList.toggle('active', i === idx); });
    }, { passive: true });
  }
  // Forma "Zatrazite ponudu": otvara email sa popunjenim upitom
  document.querySelectorAll('form.ponuda-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      function v(n) { return ((f.elements[n] && f.elements[n].value) || '').trim(); }
      var lines = ['Ime i prezime: ' + v('ime'), 'Telefon: ' + v('telefon'), 'Email: ' + v('email'),
        'Mesto: ' + v('mesto'), 'Šta mi treba: ' + v('proizvod'), '', v('poruka')];
      var subject = 'Upit za ponudu - ' + (v('ime') || 'sajt');
      window.location.href = 'mailto:info@zprofil.co.rs?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var msg = f.querySelector('.form-msg');
      if (msg) msg.textContent = 'Otvorili smo vaš email program sa popunjenim upitom. Samo kliknite Pošalji. Ako se ništa nije otvorilo, pozovite 063 866 4220.';
    });
  });
  // Tabovi na stranicama PVC i ALU stolarija
  var tabs = document.querySelectorAll('[data-tab]');
  function pickTab(k) {
    var found = false;
    tabs.forEach(function (b) { var on = b.getAttribute('data-tab') === k; if (on) found = true; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (!found) return false;
    document.querySelectorAll('[data-panel]').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-panel') === k); });
    return true;
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-tab');
      pickTab(k);
      if (history.replaceState) history.replaceState(null, '', '#' + k);
    });
  });
  if (tabs.length && location.hash && pickTab(location.hash.slice(1))) {
    var izbor = document.getElementById('izbor');
    if (izbor) setTimeout(function () { izbor.scrollIntoView(); }, 50);
  }

  // Konfigurator panela vrata: putanja slike se pravi iz modela i boje
  document.querySelectorAll('[data-cfg]').forEach(function (box) {
    var img = box.querySelector('[data-cfg-img]');
    if (!img) return;
    var stage = img.closest('.cfg-stage');
    var MODELS = 59, model = 1, color = 'bela-9016-sjaj', label = 'Bela 9016 Sjaj';
    function path(n, c) { return 'img/paneli/ZP-' + n + '/ZP-' + n + '_' + c + '.webp'; }
    var thumbs = box.querySelectorAll('[data-model]');
    var swatches = box.querySelectorAll('[data-color]');
    img.addEventListener('error', function () { stage.classList.add('miss'); });
    img.addEventListener('load', function () { stage.classList.remove('miss'); });
    function render(fromModel) {
      img.src = path(model, color);
      img.alt = 'Panel vrata ZP ' + model + ', ' + label;
      box.querySelector('[data-cfg-capt]').textContent = 'ZP ' + model + ' - ' + label;
      box.querySelector('[data-cfg-color]').textContent = label;
      box.querySelector('[data-cfg-model]').textContent = 'ZP ' + model;
      var cta = box.querySelector('[data-cfg-cta]');
      if (cta) cta.href = 'kontakt.html?panel=ZP-' + model + '&boja=' + color + '#ponuda';
      swatches.forEach(function (s) { var on = s.getAttribute('data-color') === color; s.classList.toggle('on', on); s.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      thumbs.forEach(function (t) {
        var n = +t.getAttribute('data-model'), on = n === model;
        t.classList.toggle('on', on); t.setAttribute('aria-pressed', on ? 'true' : 'false');
        var ti = t.querySelector('img'); var want = path(n, color);
        if (ti) { ti.setAttribute('data-src', want); if (t._seen && ti.getAttribute('src') !== want) ti.setAttribute('src', want); }
        if (on && fromModel) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
      // tiho ucitaj sledeci model unapred
      var pre = new Image(); pre.src = path(model < MODELS ? model + 1 : 1, color);
    }
    // sličice se učitavaju tek kad uđu u vidljivi deo liste
    var list = thumbs.length ? thumbs[0].parentNode : null;
    function show(t) { t._seen = true; var ti = t.querySelector('img'); if (ti && !ti.getAttribute('src')) ti.setAttribute('src', ti.getAttribute('data-src')); }
    if ('IntersectionObserver' in window && list) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { root: list, rootMargin: '120px' });
      thumbs.forEach(function (t) { io.observe(t); });
    } else { thumbs.forEach(show); }
    swatches.forEach(function (s) { s.addEventListener('click', function () { color = s.getAttribute('data-color'); label = s.getAttribute('data-label'); render(false); }); });
    thumbs.forEach(function (t) { t.addEventListener('click', function () { model = +t.getAttribute('data-model'); render(true); }); });
    box.querySelectorAll('[data-cfg-step]').forEach(function (b) {
      b.addEventListener('click', function () { model = ((model - 1 + (+b.getAttribute('data-cfg-step')) + MODELS) % MODELS) + 1; render(true); });
    });
  });

  // Kontakt: popuni formu ako je stigao izbor iz konfiguratora
  (function () {
    var q = new URLSearchParams(location.search);
    var panel = q.get('panel'); if (!panel) return;
    var names = {"bela-9016-sjaj": "Bela 9016 Sjaj", "antracit-7016-mat": "Antracit 7016 Mat", "crna-9005-mat": "Crna 9005 Mat", "braon-8017-sjaj": "Braon 8017 Sjaj", "braon-8014-sjaj": "Braon 8014 Sjaj", "eloksaza-9006": "Imitacija eloksaže 9006", "zlatni-hrast": "Zlatni hrast", "tamni-orah": "Tamni orah"};
    var boja = names[q.get('boja')] || '';
    document.querySelectorAll('form.ponuda-form').forEach(function (f) {
      var sel = f.elements['proizvod']; if (sel) sel.value = 'Vrata';
      var t = f.elements['poruka'];
      if (t && !t.value) t.value = 'Zanima me ulazna vrata sa panelom ' + panel.replace('-', ' ') + (boja ? ', boja ' + boja : '') + '.';
    });
  })();
})();
