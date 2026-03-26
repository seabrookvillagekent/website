document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile nav toggle
  const topBar = document.querySelector(".top-bar");
  const nav = document.querySelector("nav");

  if (topBar && nav) {
    const toggle = document.createElement("button");
    toggle.className = "menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Toggle menu");
    toggle.textContent = "Menu";

    topBar.appendChild(toggle);

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "Close" : "Menu";
    });
  }

  // Reveal animation targets
  const revealTargets = document.querySelectorAll(
    ".hero-inner > div, .card, .sidebar section, footer"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  // Mark active nav link by current file
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // Smooth scrolling for internal anchors only
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
        const toggle = document.querySelector(".menu-toggle");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          toggle.textContent = "Menu";
        }
      }
    });
  });

  // Build label chips from data-labels
  const cards = document.querySelectorAll("#Places\\ of\\ Interest .card");

  cards.forEach((card) => {
    const labelsAttr = card.getAttribute("data-labels");
    if (!labelsAttr) return;

    const labels = labelsAttr
      .split(" ")
      .map((label) => label.trim())
      .filter(Boolean);

    if (!labels.length) return;

    const existingMeta = card.querySelector(".meta");
    const labelWrap = document.createElement("div");
    labelWrap.className = "card-labels";

    labels.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "card-label";
      chip.textContent = formatLabel(label);
      labelWrap.appendChild(chip);
    });

    if (existingMeta) {
      existingMeta.insertAdjacentElement("afterend", labelWrap);
    } else {
      const heading = card.querySelector("h3");
      if (heading) {
        heading.insertAdjacentElement("afterend", labelWrap);
      } else {
        card.prepend(labelWrap);
      }
    }
  });

  // Filter cards
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      cards.forEach((card) => {
        const labels = (card.getAttribute("data-labels") || "")
          .split(" ")
          .map((label) => label.trim())
          .filter(Boolean);

        const matches = filter === "all" || labels.includes(filter);
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });

  // Proper lightbox
  setupLightbox();

  function setupLightbox() {
    const images = document.querySelectorAll(".card img");
    if (!images.length) return;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-hidden", "true");

    lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="lightbox-close" type="button" aria-label="Close image">×</button>
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    `;

    document.body.appendChild(lightbox);

    const backdrop = lightbox.querySelector(".lightbox-backdrop");
    const panel = lightbox.querySelector(".lightbox-panel");
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const caption = lightbox.querySelector(".lightbox-caption");
    const closeButton = lightbox.querySelector(".lightbox-close");

    let lastFocused = null;

    images.forEach((img) => {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Open image: ${img.alt || "Image"}`);

      img.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img);
      });

      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });

    function openLightbox(img) {
      lastFocused = document.activeElement;

      const fullSrc = img.getAttribute("data-full") || img.currentSrc || img.src;

      lightboxImage.src = fullSrc;
      lightboxImage.alt = img.alt || "";
      caption.textContent = img.alt || "";

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeButton.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");

      lightboxImage.src = "";
      lightboxImage.alt = "";
      caption.textContent = "";

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    closeButton.addEventListener("click", closeLightbox);
    backdrop.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
      if (!panel.contains(e.target)) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  function formatLabel(label) {
    return label
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
});