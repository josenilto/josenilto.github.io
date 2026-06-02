// Contador de visitas via localStorage (movido do inline do index.html)
(function () {
  try {
    var n = parseInt(localStorage.getItem('si_count') || '0') + 1;
    var now = new Date().toISOString();
    var td = now.slice(0, 10);
    var tc = localStorage.getItem('si_today_date') === td
      ? parseInt(localStorage.getItem('si_today_count') || '0') + 1
      : 1;
    if (!localStorage.getItem('si_first')) localStorage.setItem('si_first', now);
    localStorage.setItem('si_count', n);
    localStorage.setItem('si_last', now);
    localStorage.setItem('si_today_date', td);
    localStorage.setItem('si_today_count', tc);
  } catch (e) {}
})();

// Função para mostrar/ocultar o menu de navegação
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("show-menu");
      toggle.setAttribute("aria-expanded", isOpen);
      toggle.setAttribute("aria-label", isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação");
    });
  }
};
showMenu("nav-toggle", "nav-menu");

// Função para ocultar o menu ao clicar em um link
const navLinks = document.querySelectorAll(".nav__link");

const linkAction = () => {
  const navMenu = document.getElementById("nav-menu");
  const navToggle = document.getElementById("nav-toggle");
  if (navMenu) {
    navMenu.classList.remove("show-menu");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menu de navegação");
    }
  }
};

navLinks.forEach((link) => link.addEventListener("click", linkAction));

// Função para destacar o link ativo baseado na rolagem
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    const sectionId = current.getAttribute("id");

    const link = document.querySelector(`.nav__menu a[href*='${sectionId}']`);
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
};

// Debounce para otimizar a função de rolagem
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

window.addEventListener("scroll", debounce(scrollActive, 100));

// Função para adicionar/remover classe ao cabeçalho ao rolar
const scrollHeader = () => {
  const nav = document.getElementById("header");
  if (nav) {
    if (window.scrollY >= 200) {
      nav.classList.add("scroll-header");
    } else {
      nav.classList.remove("scroll-header");
    }
  }
};

window.addEventListener("scroll", debounce(scrollHeader, 100));

// Função para mostrar/esconder o botão de rolar para o topo
const scrollTop = () => {
  const scrollTopBtn = document.getElementById("scroll-top");
  if (scrollTopBtn) {
    if (window.scrollY >= 560) {
      scrollTopBtn.classList.add("show-scroll");
    } else {
      scrollTopBtn.classList.remove("show-scroll");
    }
  }
};

window.addEventListener("scroll", debounce(scrollTop, 100));

// Gerenciamento de tema (claro/escuro)
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "bx-sun";

const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "bx-moon" : "bx-sun";

// Aplicar tema armazenado
if (selectedTheme) {
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "bx-moon" ? "add" : "remove"](
    iconTheme
  );
}

// Alternar tema ao clicar no botão
themeButton.addEventListener("click", () => {
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);

  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});

// ScrollReveal para animações
const sr = ScrollReveal({
  origin: "top",
  distance: "40px",
  duration: 2000,
  reset: true,
});

sr.reveal(
  `.home__data, .home__img,
            .story__data, .story__img,
            .about__data, .about__img,
            .services__content, .menu__content,
            .app__data, .app__img,
            .contact__data, .contact__button,
            .footer__content`,
  {
    interval: 50,
  }
);
