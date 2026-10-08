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
})();
