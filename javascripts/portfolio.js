/* =========================================================
   Portafolio de Actividades — interacciones propias
   - Anima tarjetas y encabezados al entrar en pantalla
   ========================================================= */
(function () {
  "use strict";

  function init() {
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
