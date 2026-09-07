/* =========================================================
   Portafolio de Actividades — interacciones propias
   - Resalta la sección activa en el menú del hero
   - Anima tarjetas y encabezados al entrar en pantalla
   ========================================================= */
(function () {
  "use strict";

  function init() {
    var navLinks = document.querySelectorAll(".hero__nav a");
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute("href");
      if (id && id.charAt(0) === "#") {
        var target = document.querySelector(id);
        if (target) sections.push({ link: link, target: target });
      }
    });

    // Resaltado del enlace activo según la sección visible
    if (sections.length && "IntersectionObserver" in window) {
      var navObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = sections.filter(function (s) {
              return s.target === entry.target;
            })[0];
            if (!match) return;
            if (entry.isIntersecting) {
              navLinks.forEach(function (l) { l.classList.remove("is-active"); });
              match.link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { navObserver.observe(s.target); });
    }

    // Animación de aparición para tarjetas y encabezados
    var revealTargets = document.querySelectorAll(
      ".section__header, .profile-card, .practice-card"
    );

    if (!revealTargets.length) return;

    revealTargets.forEach(function (el) { el.classList.add("reveal"); });

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry, index) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () {
              el.classList.add("is-visible");
            }, (index % 4) * 90);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
