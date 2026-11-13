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
    var sel = f.elements['proizvod'], vbox = f.querySelector('[data-vr-box]');
    var pbox = f.querySelector('[data-pr-box]');
    function syncVr() { if (vbox && sel) vbox.classList.toggle('on', sel.value === 'Vrata'); if (pbox && sel) pbox.classList.toggle('on', sel.value === 'Prozori'); }
    if (sel) sel.addEventListener('change', syncVr);
    f._syncVr = syncVr;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      function v(n) { return ((f.elements[n] && f.elements[n].value) || '').trim(); }
      var lines = ['Ime i prezime: ' + v('ime'), 'Telefon: ' + v('telefon'), 'Email: ' + v('email'),
        'Mesto: ' + v('mesto'), 'Šta mi treba: ' + v('proizvod'), '', v('poruka')];
      if (v('proizvod') === 'Prozori') {
        lines.splice(5, 0, 'Vrsta: ' + v('p_vrsta'), 'Tip profila: ' + v('p_profil'), 'Broj krila: ' + v('p_krila') + (v('p_krila') === 'Jednokrilni' ? ', otvara se ' + v('p_strana').toLowerCase() : ''), 'Boja: ' + v('p_boja'), 'Staklo: ' + v('p_staklo'),
          'Dimenzije: ' + (v('p_sirina') && v('p_visina') ? v('p_sirina') + ' x ' + v('p_visina') + ' cm (širina x visina)' : 'nisu unete'));
      }
      if (v('proizvod') === 'Vrata') {
        lines.splice(5, 0, 'Vrsta: ' + v('vrsta'), 'Model panela: ' + v('model'), 'Boja: ' + v('boja'), 'Staklo: ' + v('staklo'),
          'Dimenzije: ' + (v('sirina') && v('visina') ? v('sirina') + ' x ' + v('visina') + ' cm (širina x visina)' : 'nisu unete'));
      }
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
      var mdi = box.querySelector('[data-md-img]'); if (mdi) mdi.src = path(model, color);
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
    // Padajuca lista modela sa slikama
    var md = box.querySelector('.md'), mdBtn = box.querySelector('[data-md-btn]');
    function setMd(open) { if (!md) return; md.classList.toggle('open', open); if (mdBtn) mdBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var on = box.querySelector('.th.on'); if (on) { on.scrollIntoView({ block: 'nearest' }); } thumbs.forEach(function (t) { if (!t._seen) { var r = t.getBoundingClientRect(); if (r.height) show(t); } }); } }
    if (mdBtn) mdBtn.addEventListener('click', function () { setMd(!md.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (md && md.classList.contains('open') && !md.contains(e.target)) setMd(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMd(false); });
    thumbs.forEach(function (t) { t.addEventListener('click', function () { model = +t.getAttribute('data-model'); render(false); setMd(false); }); });
    // Staklo, dimenzije i slanje upita na kontakt formu
    var glass = 'Providno';
    var glasses = box.querySelectorAll('[data-glass]');
    glasses.forEach(function (g) {
      g.addEventListener('click', function () {
        glass = g.getAttribute('data-glass');
        glasses.forEach(function (x) { var on = x === g; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        var gl = box.querySelector('[data-cfg-glass]'); if (gl) gl.textContent = glass;
      });
    });
    var cta = box.querySelector('[data-cfg-cta]');
    if (cta) cta.addEventListener('click', function (e) {
      e.preventDefault();
      function dim(k) { var i = box.querySelector('[data-dim="' + k + '"]'); return i ? i.value.trim() : ''; }
      var w = dim('w'), h = dim('h');
      var vrsta = (location.pathname.indexOf('alu-') >= 0) ? 'ALU vrata' : 'PVC vrata';
      var q = new URLSearchParams({ proizvod: 'Vrata', vrsta: vrsta, model: 'ZP ' + model, boja: label, staklo: glass, sirina: w, visina: h });
      location.href = 'kontakt.html?' + q.toString() + '#ponuda';
    });
    box.querySelectorAll('[data-cfg-step]').forEach(function (b) {
      b.addEventListener('click', function () { model = ((model - 1 + (+b.getAttribute('data-cfg-step')) + MODELS) % MODELS) + 1; render(true); });
    });
  });

  // Konfigurator prozora: boja rama, profil, broj krila, staklo, dimenzije
  document.querySelectorAll('[data-wcfg]').forEach(function (box) {
    var st = { color: 'bela-9016-sjaj', label: 'Bela 9016 Sjaj', prof: '', glass: '', krila: 'Dvokrilni', strana: 'Levo' };
    var pb = box.querySelector('[data-wprof].on'), gb = box.querySelector('[data-wglass].on');
    st.prof = pb ? pb.getAttribute('data-wprof') : ''; st.glass = gb ? gb.getAttribute('data-wglass') : '';
    function lbl(k, v) { var e = box.querySelector('[data-wlbl="' + k + '"]'); if (e) e.textContent = v; }
    function chips(attr, val) { box.querySelectorAll('[data-' + attr + ']').forEach(function (b) { var on = b.getAttribute('data-' + attr) === val; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
    function render() {
      var one = st.krila === 'Jednokrilni';
      box.querySelectorAll('[data-wframe]').forEach(function (el) { el.className = el.className.replace(/\bsw-[a-z0-9-]+/g, '').replace(/\s+/g, ' ').trim() + ' sw-' + st.color; });
      var w = box.querySelector('[data-wwin]');
      if (w) { w.classList.toggle('k1', one); w.classList.toggle('k2', !one); w.classList.toggle('ol', one && st.strana === 'Levo'); w.classList.toggle('or', one && st.strana === 'Desno'); }
      var side = box.querySelector('[data-wside]'); if (side) side.classList.toggle('off', !one);
      box.querySelectorAll('[data-wcolor]').forEach(function (b) { var on = b.getAttribute('data-wcolor') === st.color; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      chips('wprof', st.prof); chips('wglass', st.glass); chips('wkrila', st.krila); chips('wstrana', st.strana);
      lbl('color', st.label); lbl('prof', st.prof); lbl('glass', st.glass); lbl('krila', st.krila); lbl('strana', st.strana);
      var c = box.querySelector('[data-wcapt]'); if (c) c.textContent = st.prof + ' - ' + st.label;
      var t = box.querySelector('[data-wtag]'); if (t) t.textContent = (one ? 'Jednokrilni, otvara se ' + st.strana.toLowerCase() : 'Dvokrilni') + ', ' + st.glass.toLowerCase() + ' staklo';
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wcolor],[data-wprof],[data-wglass],[data-wkrila],[data-wstrana]'); if (!b) return;
      if (b.hasAttribute('data-wcolor')) { st.color = b.getAttribute('data-wcolor'); st.label = b.getAttribute('data-label'); }
      else if (b.hasAttribute('data-wprof')) st.prof = b.getAttribute('data-wprof');
      else if (b.hasAttribute('data-wglass')) st.glass = b.getAttribute('data-wglass');
      else if (b.hasAttribute('data-wkrila')) st.krila = b.getAttribute('data-wkrila');
      else st.strana = b.getAttribute('data-wstrana');
      render();
    });
    var cta = box.querySelector('[data-wcta]');
    if (cta) cta.addEventListener('click', function (e) {
      e.preventDefault();
      function dim(k) { var i = box.querySelector('[data-wdim="' + k + '"]'); return i ? i.value.trim() : ''; }
      var q = new URLSearchParams({ proizvod: 'Prozori', p_vrsta: box.getAttribute('data-kind'), p_profil: st.prof, p_boja: st.label, p_krila: st.krila,
        p_strana: st.krila === 'Jednokrilni' ? st.strana : '', p_staklo: st.glass, p_sirina: dim('w'), p_visina: dim('h') });
      location.href = 'kontakt.html?' + q.toString() + '#ponuda';
    });
  });

  // Kontakt: popuni formu ako je stigao izbor iz konfiguratora
  (function () {
    var q = new URLSearchParams(location.search);
    if ((q.get('proizvod') === 'Vrata' && q.get('model')) || (q.get('proizvod') === 'Prozori' && q.get('p_profil'))) {
      document.querySelectorAll('form.ponuda-form').forEach(function (f) {
        ['proizvod', 'vrsta', 'model', 'boja', 'staklo', 'sirina', 'visina', 'p_vrsta', 'p_profil', 'p_boja', 'p_krila', 'p_strana', 'p_staklo', 'p_sirina', 'p_visina'].forEach(function (k) { if (q.get(k) && f.elements[k]) f.elements[k].value = q.get(k); });
        if (f._syncVr) f._syncVr();
        var t = f.elements['poruka'];
        if (t && f.offsetParent) setTimeout(function () { window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - (document.querySelector('.hdr') ? document.querySelector('.hdr').offsetHeight + 16 : 16)); t.focus({ preventScroll: true }); }, 80);
      });
      return;
    }
    var upit = q.get('upit');
    if (upit) {
      document.querySelectorAll('form.ponuda-form').forEach(function (f) {
        var sel = f.elements['proizvod']; if (sel && q.get('proizvod')) sel.value = q.get('proizvod');
        var t = f.elements['poruka'];
        if (t) {
          t.value = upit;
          if (f.offsetParent) setTimeout(function () { window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - (document.querySelector('.hdr') ? document.querySelector('.hdr').offsetHeight + 16 : 16)); t.focus({ preventScroll: true }); t.setSelectionRange(t.value.length, t.value.length); }, 80);
        }
      });
      return;
    }
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
