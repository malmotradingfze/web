// Year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Basic contact form handler (no backend yet)
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    alert(`Thanks, ${data.name}! We'll contact you at ${data.email}.`);
    form.reset();
  });
}

// ---------- HERO SLIDER ----------
(function () {
  const root = document.querySelector(".hero-slider");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".slide"));
  const dotsWrap = root.querySelector(".dots");
  const dots = Array.from(root.querySelectorAll(".dot"));
  const btnPrev = root.querySelector(".prev");
  const btnNext = root.querySelector(".next");

  // lazy set background from data-src
  function ensureBg(fig) {
    const src = fig.getAttribute("data-src");
    if (src && !fig.style.backgroundImage) {
      fig.style.backgroundImage = `url('${src}')`;
    }
  }

  let i = 0;
  let timer = null;
  let firstTimeout = null;
  let firstRun = true;

  // === Adjust your timings here ===
  const AUTOPLAY_MS   = 5000; // time between slides after the first switch
  const FIRST_DELAY_MS = 5000; // initial hold on slide #1 before first switch
  // ================================

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.innerWidth < 900;

  // preload first and trigger initial animation
  ensureBg(slides[0]);
  dots[0]?.classList.add("is-active");

  // Trigger first slide animation on load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      slides[0].classList.add("is-active");
    });
  });

  // If only one slide, keep it clean
  if (slides.length < 2) {
    btnPrev && (btnPrev.style.display = "none");
    btnNext && (btnNext.style.display = "none");
    dotsWrap && (dotsWrap.style.display = "none");
    return;
  }

  function show(idx) {
    if (idx === i) return;
    slides[i].classList.remove("is-active");
    dots[i]?.classList.remove("is-active");
    i = (idx + slides.length) % slides.length;
    ensureBg(slides[i]);
    slides[i].classList.add("is-active");
    dots[i]?.classList.add("is-active");
  }

  const next = () => show(i + 1);
  const prev = () => show(i - 1);

  btnNext?.addEventListener("click", next);
  btnPrev?.addEventListener("click", prev);
  dots.forEach((d, di) => d.addEventListener("click", () => show(di)));

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    if (firstTimeout) { clearTimeout(firstTimeout); firstTimeout = null; }
  }

  function start() {
    if (reduced || isMobile()) return; // respect accessibility & mobile
    stop();
    if (firstRun) {
      firstTimeout = setTimeout(() => {
        next();
        timer = setInterval(next, AUTOPLAY_MS);
        firstRun = false;
      }, FIRST_DELAY_MS);
    } else {
      timer = setInterval(next, AUTOPLAY_MS);
    }
  }

  // pause on hover / when tab hidden
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  start();
})();

// ---------- SCROLL-IN ANIMATIONS ----------
(function () {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
})();
