/* La SimBox — interactions du site */

(function () {
  "use strict";

  /* ----- Menu mobile ----------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav-principal");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".sr-only").textContent = open ? "Fermer le menu" : "Ouvrir le menu";
    });

    // Refermer après un clic sur un lien d'ancre.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ----- Bordure de l'en-tête au défilement ------------------------------ */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----- Apparition progressive des blocs --------------------------------
     Les blocs .reveal partent à opacité 0. Il est donc essentiel qu'aucun
     scénario ne les laisse invisibles : on double l'observateur d'un contrôle
     direct, car IntersectionObserver ne se déclenche pas tant que la page
     n'est pas réellement peinte (onglet ouvert en arrière-plan, par exemple).  */

  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  var revealAll = function () {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  };

  // Affiche sans attendre tout ce qui se trouve déjà dans la fenêtre.
  // Si la hauteur de fenêtre est inconnue (page pas encore peinte, pré-rendu,
  // capture automatisée), on préfère tout afficher plutôt que risquer une page vide.
  var revealWhatIsOnScreen = function () {
    var h = window.innerHeight;
    if (!h) { revealAll(); return; }

    revealables.forEach(function (el) {
      if (!el.classList.contains("is-visible") &&
          el.getBoundingClientRect().top < h * 0.95) {
        el.classList.add("is-visible");
      }
    });
  };

  if (!("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealables.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 4, 3) * 70 + "ms";
      observer.observe(el);
    });

    revealWhatIsOnScreen();
    window.addEventListener("load", revealWhatIsOnScreen);
    window.addEventListener("scroll", revealWhatIsOnScreen, { passive: true });

    // Dernier recours : au bout de 3 s, plus rien ne doit rester masqué.
    setTimeout(revealAll, 3000);
  }

  /* ----- Boutons d'appel sur ordinateur -----------------------------------
     Un lien tel: lance l'appel sur un téléphone, mais ne fait rien sur un
     ordinateur sans application d'appel. Sur les appareils à souris, on
     amène donc le visiteur au numéro, on le met en évidence et on le copie. */

  var NUMERO = "07 77 46 49 59";
  var estOrdinateur = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  var toastTimer;

  var afficherToast = function (message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 4500);
  };

  var copier = function (texte) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texte);
    }
    return Promise.reject();
  };

  if (estOrdinateur) {
    document.addEventListener("click", function (event) {
      var lien = event.target.closest('a[href^="tel:"]');
      if (!lien) { return; }
      event.preventDefault();

      var panneau = document.querySelector(".phone-panel");
      if (panneau && !panneau.contains(lien)) {
        panneau.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (panneau) {
        panneau.classList.remove("is-highlighted");
        void panneau.offsetWidth;
        panneau.classList.add("is-highlighted");
      }

      copier(NUMERO).then(
        function () { afficherToast("Appelez le " + NUMERO + " pour réserver — numéro copié."); },
        function () { afficherToast("Appelez le " + NUMERO + " pour réserver."); }
      );
    });
  }

  /* ----- Jour en cours dans le calendrier des horaires ------------------- */
  var aujourdhui = document.querySelector('.jour[data-jour="' + new Date().getDay() + '"]');
  if (aujourdhui) {
    aujourdhui.classList.add("est-aujourdhui");
    var badge = document.createElement("span");
    badge.className = "jour-badge";
    badge.textContent = "Aujourd\u2019hui";
    aujourdhui.appendChild(badge);
  }

  /* ----- Année courante dans le pied de page ----------------------------- */
  var annee = document.getElementById("annee");
  if (annee) { annee.textContent = new Date().getFullYear(); }
})();
