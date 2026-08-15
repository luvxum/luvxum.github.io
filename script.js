(() => {
  const TOTAL = 12;
  const pad = n => String(n).padStart(2, "0");
  const scroller = document.getElementById("scroller");
  const loader = document.getElementById("loader");

  const images = [];

  for (let i = 1; i <= TOTAL; i++) {
    const section = document.createElement("section");
    section.className = "page";

    const img = document.createElement("img");
    img.src = `assets/pages/page-${pad(i)}.jpg`;
    img.alt = `Portfolio – strana ${i}`;
    img.draggable = false;
    if (i > 2) img.loading = "lazy";

    section.appendChild(img);
    scroller.appendChild(section);
    images.push(img);
  }

  const sections = Array.from(document.querySelectorAll(".page"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { root: scroller, threshold: 0.35 });
  sections.forEach(s => observer.observe(s));

  // scroll hints: down-arrow (right, mobile+desktop) and up-arrow (left, desktop only)
  const scrollHint = document.getElementById("scrollHint");
  const scrollHintUp = document.getElementById("scrollHintUp");
  const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

  const lastShake = new WeakMap();
  function shakeHint(hint) {
    const img = hint.querySelector("img");
    const now = Date.now();
    if (now - (lastShake.get(hint) || 0) < 500) return;
    lastShake.set(hint, now);
    img.classList.remove("shake");
    void img.offsetWidth; // restart the animation
    img.classList.add("shake");
  }

  scrollHint.addEventListener("click", () => {
    shakeHint(scrollHint);
    if (isMobile()) {
      sections[1].scrollIntoView({ behavior: "smooth" });
    } else {
      const current = Math.round(scroller.scrollTop / scroller.clientHeight);
      const next = sections[current + 1];
      if (next) next.scrollIntoView({ behavior: "smooth" });
    }
  });
  scrollHintUp.addEventListener("click", () => {
    shakeHint(scrollHintUp);
    const current = Math.round(scroller.scrollTop / scroller.clientHeight);
    const prev = sections[current - 1];
    if (prev) prev.scrollIntoView({ behavior: "smooth" });
  });

  scroller.addEventListener("scroll", () => {
    if (isMobile()) {
      scrollHint.classList.toggle("hidden", scroller.scrollTop > 40);
    } else {
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 20;
      scrollHint.classList.toggle("hidden", atEnd);
      scrollHintUp.classList.toggle("hidden", scroller.scrollTop <= 40);
    }
  }, { passive: true });

  // only shake on actual user-driven scrolling (wheel/touch), not the
  // automatic snap settle that follows — down shakes the right arrow,
  // up shakes the left arrow
  function maybeShake(direction) {
    if (direction > 0 && !scrollHint.classList.contains("hidden")) shakeHint(scrollHint);
    else if (direction < 0 && !scrollHintUp.classList.contains("hidden")) shakeHint(scrollHintUp);
  }
  scroller.addEventListener("wheel", (e) => {
    maybeShake(e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0);
  }, { passive: true });

  let lastTouchY = null;
  scroller.addEventListener("touchstart", (e) => {
    lastTouchY = e.touches[0].clientY;
  }, { passive: true });
  scroller.addEventListener("touchmove", (e) => {
    if (lastTouchY === null) return;
    const y = e.touches[0].clientY;
    const dy = lastTouchY - y; // finger moving up means scrolling down
    lastTouchY = y;
    maybeShake(dy > 0 ? 1 : dy < 0 ? -1 : 0);
  }, { passive: true });

  // loader: wait for the first couple of images (rest load lazily as you scroll)
  let loaded = 0;
  const NEEDED = Math.min(2, TOTAL);
  const markLoaded = () => {
    loaded += 1;
    if (loaded >= NEEDED) hideLoader();
  };
  images.slice(0, NEEDED).forEach(img => {
    if (img.complete) markLoaded();
    else {
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markLoaded);
    }
  });
  function hideLoader() {
    loader.classList.add("hidden");
  }
  setTimeout(hideLoader, 3000);
})();
