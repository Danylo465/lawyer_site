(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  const setMenu = (open) => {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1181px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // На телефоні нижня кнопка з'являється лише після того, як основна зникла з екрана.
  const mobileCta = document.querySelector(".mobile-cta");
  const heroActions = document.querySelector(".hero-actions");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      mobileCta.classList.toggle("is-shown", !entry.isIntersecting);
    }).observe(heroActions);
  } else {
    mobileCta.classList.add("is-shown");
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Шолом із мечем повертаються за курсором, відблиск проходить по них одночасно.
  const hero = document.querySelector(".hero");
  const emblem = document.querySelector(".hero-emblem");
  const shine = document.querySelector(".hero-shine");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const maxTilt = 12;
    const maxShift = 7;
    const clamp = (value) => Math.min(1, Math.max(-1, value));
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let lastFlash = 0;
    let resetTimer = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      const settled = Math.abs(targetX - currentX) < 0.002 && Math.abs(targetY - currentY) < 0.002;
      if (settled) {
        currentX = targetX;
        currentY = targetY;
      }
      emblem.style.setProperty("--tilt-x", (-currentY * maxTilt).toFixed(3));
      emblem.style.setProperty("--tilt-y", (currentX * maxTilt).toFixed(3));
      emblem.style.setProperty("--shift-x", (-currentX * maxShift).toFixed(2));
      emblem.style.setProperty("--shift-y", (-currentY * maxShift).toFixed(2));
      frame = settled ? 0 : requestAnimationFrame(render);
    };
    const setTarget = (x, y) => {
      targetX = x;
      targetY = y;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const aim = (event) => {
      const box = emblem.getBoundingClientRect();
      setTarget(
        clamp((event.clientX - (box.left + box.width / 2)) / (box.width * 0.9)),
        clamp((event.clientY - (box.top + box.height / 2)) / (box.height * 0.9))
      );
    };
    const flash = () => {
      const now = performance.now();
      if (now - lastFlash < 1600) return;
      lastFlash = now;
      shine.style.animationName = "none";
      void shine.offsetWidth;
      shine.style.animationDelay = "0s";
      shine.style.animationName = "";
    };

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "mouse") aim(event);
    });
    hero.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") setTarget(0, 0);
    });
    emblem.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") flash();
    });
    emblem.addEventListener("pointerdown", (event) => {
      aim(event);
      flash();
      if (event.pointerType !== "mouse") {
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => setTarget(0, 0), 700);
      }
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
