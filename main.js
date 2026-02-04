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

// ---------- HERO SLIDER ----------
(function () {
  const root = document.querySelector(".hero-slider");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".slide"));
  const dotsWrap = root.querySelector(".dots");
  const dots = Array.from(root.querySelectorAll(".dot"));
  const btnPrev = root.querySelector(".prev");
  const btnNext = root.querySelector(".next");

  // Preload all slide images so they are ready before first show
  slides.forEach((slide) => {
    const src = slide.getAttribute("data-src");
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      slide.style.backgroundImage = `url('${src}')`;
    };
    img.src = src;
  });

  function ensureBg(fig) {
    const src = fig.getAttribute("data-src");
    if (src && !fig.style.backgroundImage) {
      fig.style.backgroundImage = `url('${src}')`;
    }
  }

  let i = 0;

  const AUTOPLAY_MS = 6500;
  const FIRST_DELAY_MS = 6500;

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let autoplayTimeout = null;
  let isFirstCycle = true;
  let isHovered = false;
  let pendingSwitch = false;

  if (slides.length < 1) return;

  function deactivateSlide(index) {
    const s = slides[index];
    if (!s) return;
    s.classList.remove("is-active");
  }

  function activateSlide(index) {
    const s = slides[index];
    if (!s) return;
    ensureBg(s);
    s.classList.add("is-active");
  }

  function setActiveIndex(newIndex) {
    if (newIndex === i) return;
    deactivateSlide(i);
    dots[i]?.classList.remove("is-active");

    i = (newIndex + slides.length) % slides.length;

    activateSlide(i);
    dots[i]?.classList.add("is-active");
  }

  const next = () => setActiveIndex(i + 1);
  const prev = () => setActiveIndex(i - 1);

  function clearAutoplay() {
    if (autoplayTimeout) {
      clearTimeout(autoplayTimeout);
      autoplayTimeout = null;
    }
  }

  function scheduleNext(delay) {
    if (reduced) return;

    clearAutoplay();
    autoplayTimeout = setTimeout(() => {
      autoplayTimeout = null;

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

  // Initial state
  slides.forEach((s) => s.classList.remove("is-active"));
  dots.forEach((d) => d.classList.remove("is-active"));

  ensureBg(slides[0]);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      activateSlide(0);
      dots[0]?.classList.add("is-active");
    });
  });

  if (slides.length < 2) {
    btnPrev && (btnPrev.style.display = "none");
    btnNext && (btnNext.style.display = "none");
    dotsWrap && (dotsWrap.style.display = "none");
    return;
  }

  btnNext?.addEventListener("click", () => {
    pendingSwitch = false;
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
      setActiveIndex(di);
      isFirstCycle = false;
      startAutoplay();
    })
  );

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
      startAutoplay();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearAutoplay();
    } else if (!isHovered) {
      startAutoplay();
    }
  });

  if (!reduced) {
    startAutoplay();
  }
})();

// ---------- FEATURED PRODUCTS CAROUSELS ----------
(function () {
  const carousels = document.querySelectorAll(".product-carousel");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector(".product-viewport");
    const track = viewport?.querySelector(".cards-3");
    const btnPrev = carousel.querySelector(".prod-prev");
    const btnNext = carousel.querySelector(".prod-next");

    if (!viewport || !track || !btnPrev || !btnNext) return;

    let current = 0;

    function scrollByDirection(dir) {
  const totalWidth = track.scrollWidth;
  const viewWidth = viewport.clientWidth;

  if (totalWidth <= viewWidth + 4) return;

  const step = viewWidth; // scroll by full viewport
  const max = Math.max(0, totalWidth - viewWidth);

  current += dir * step;

  // clamp first
  if (current < 0) current = 0;
  if (current > max) current = max;

  // wrap ONLY if already at the edge
  if (dir > 0 && current === max) {
    viewport.scrollTo({ left: current, behavior: "smooth" });
    setTimeout(() => {
      current = 0;
      viewport.scrollTo({ left: 0, behavior: "smooth" });
    }, 350);
    return;
  }

  if (dir < 0 && current === 0) {
    viewport.scrollTo({ left: 0, behavior: "smooth" });
    setTimeout(() => {
      current = max;
      viewport.scrollTo({ left: max, behavior: "smooth" });
    }, 350);
    return;
  }

  viewport.scrollTo({
    left: current,
    behavior: "smooth",
  });
}


    btnPrev.addEventListener("click", () => scrollByDirection(-1));
    btnNext.addEventListener("click", () => scrollByDirection(1));

    window.addEventListener("resize", () => {
      const totalWidth = track.scrollWidth;
      const viewWidth = viewport.clientWidth;
      const max = Math.max(0, totalWidth - viewWidth);

      if (current > max) {
        current = Math.max(0, Math.min(current, max));
        viewport.scrollTo({ left: current });
      }
    });
  });
})();

// ---------- SCROLL-IN ANIMATIONS ----------
(function () {
  const els = document.querySelectorAll(".fade-in");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => io.observe(el));
})();
