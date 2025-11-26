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

  // --- NEW: preload all slide images up front so they are ready
  slides.forEach((slide) => {
    const src = slide.getAttribute("data-src");
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      // once loaded, set as background; avoids visible loading on first show
      slide.style.backgroundImage = `url('${src}')`;
    };
    img.src = src;
  });

  // keep ensureBg as a safety net (in case anything fails)
  function ensureBg(fig) {
    const src = fig.getAttribute("data-src");
    if (src && !fig.style.backgroundImage) {
      fig.style.backgroundImage = `url('${src}')`;
    }
  }

  let i = 0;

  // timings (already adjusted slower by +1.5s)
  const AUTOPLAY_MS = 6500;    // time between slides after first
  const FIRST_DELAY_MS = 6500; // initial hold on slide #1

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // autoplay state
  let autoplayTimeout = null;
  let isFirstCycle = true;
  let isHovered = false;
  let pendingSwitch = false;

  // make sure first slide has a background as a fallback
  ensureBg(slides[0]);
  dots[0]?.classList.add("is-active");

  // Trigger first slide animation on load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      slides[0].classList.add("is-active");
    });
  });

  // If only one slide, hide controls
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

    // safety in case background not set yet for some reason
    ensureBg(slides[i]);
    slides[i].classList.add("is-active");
    dots[i]?.classList.add("is-active");
  }

  const next = () => show(i + 1);
  const prev = () => show(i - 1);

  function clearAutoplay() {
    if (autoplayTimeout) {
      clearTimeout(autoplayTimeout);
      autoplayTimeout = null;
    }
  }

  function scheduleNext(delay) {
    if (reduced) return; // ONLY respect reduced motion, not screen size

    clearAutoplay();
    autoplayTimeout = setTimeout(() => {
      autoplayTimeout = null;

      // When timer finishes:
      // - If hovered, mark a pending switch but do NOT change yet.
      // - If not hovered, switch now and schedule next cycle.
      if (isHovered) {
        pendingSwitch = true;
      } else {
        next();
        isFirstCycle = false;
        scheduleNext(AUTOPLAY_MS);
      }
    }, delay);
  }

  function startAutoplay() {
    if (reduced) return;
    const delay = isFirstCycle ? FIRST_DELAY_MS : AUTOPLAY_MS;
    scheduleNext(delay);
  }

  // controls
  btnNext?.addEventListener("click", () => {
    pendingSwitch = false; // clear any queued auto-switch
    next();
    isFirstCycle = false;
    startAutoplay();
  });

  btnPrev?.addEventListener("click", () => {
    pendingSwitch = false;
    prev();
    isFirstCycle = false;
    startAutoplay();
  });

  dots.forEach((d, di) =>
    d.addEventListener("click", () => {
      if (di === i) return;
      pendingSwitch = false;
      show(di);
      isFirstCycle = false;
      startAutoplay();
    })
  );

  // hover behavior:
  // 1) Timer continues running in background.
  // 2) When it finishes while hovered, it does NOT switch.
  // 3) The moment mouse leaves, if a switch is pending, it switches once.
  root.addEventListener("mouseenter", () => {
    isHovered = true;
  });

  root.addEventListener("mouseleave", () => {
    isHovered = false;

    if (pendingSwitch) {
      pendingSwitch = false;
      next();
      isFirstCycle = false;
      startAutoplay();
    } else if (!autoplayTimeout) {
      // no timer currently scheduled (e.g., after tab visibility change)
      startAutoplay();
    }
  });

  // pause/resume on tab visibility
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearAutoplay();
    } else if (!isHovered) {
      startAutoplay();
    }
  });

  // initial autoplay start — runs on all screen sizes
  if (!reduced) {
    startAutoplay();
  }
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
