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

  // scroll-down hint: visible on the first page only
  const scrollHint = document.getElementById("scrollHint");
  scrollHint.addEventListener("click", () => {
    sections[1].scrollIntoView({ behavior: "smooth" });
  });
  scroller.addEventListener("scroll", () => {
    scrollHint.classList.toggle("hidden", scroller.scrollTop > 40);
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
