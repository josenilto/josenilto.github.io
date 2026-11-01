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
// Rótulos vêm do HTML (data-label-open/close) para seguir o idioma da página
const menuLabel = (toggle, isOpen) =>
  toggle.dataset[isOpen ? "labelClose" : "labelOpen"] ||
  (isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação");

const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("show-menu");
      toggle.setAttribute("aria-expanded", isOpen);
      toggle.setAttribute("aria-label", menuLabel(toggle, isOpen));
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
      navToggle.setAttribute("aria-label", menuLabel(navToggle, false));
    }
  }
};

navLinks.forEach((link) => link.addEventListener("click", linkAction));
document.querySelectorAll(".nav__cta").forEach((link) => link.addEventListener("click", linkAction));

// Esc fecha o menu mobile e devolve o foco ao botão
document.addEventListener("keydown", (e) => {
  const navMenu = document.getElementById("nav-menu");
  if (e.key === "Escape" && navMenu && navMenu.classList.contains("show-menu")) {
    linkAction();
    const navToggle = document.getElementById("nav-toggle");
    if (navToggle) navToggle.focus();
  }
});

// Função para destacar o link ativo baseado na rolagem
const sections = document.querySelectorAll("section[id]");

// Item ativo do menu = última seção cujo topo já passou de uma "linha de
// leitura" a ~35% da altura da tela. Leva em conta o header fixo e o
// scroll-padding (ao abrir /#story o navegador para um pouco acima do topo
// da seção) e roda também no carregamento, em hashchange e resize — antes
// só rodava após um scroll, então /#story abria com "Career" ativo.
const scrollActive = () => {
  const probe = window.scrollY + window.innerHeight * 0.35;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  let current = null;

  sections.forEach((section) => {
    if (section.offsetTop <= probe) current = section;
  });
  if (atBottom && sections.length) current = sections[sections.length - 1];

  document.querySelectorAll(".nav__menu .nav__link").forEach((link) => {
    const isActive = !!current && link.getAttribute("href") === `#${current.id}`;
    link.classList.toggle("active-link", isActive);
    if (isActive) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
};

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

// Atualiza no máximo uma vez por quadro (sem o atraso de 100 ms do debounce)
let activeTicking = false;
window.addEventListener("scroll", () => {
  if (activeTicking) return;
  activeTicking = true;
  requestAnimationFrame(() => {
    scrollActive();
    activeTicking = false;
  });
}, { passive: true });
window.addEventListener("hashchange", scrollActive);
window.addEventListener("resize", debounce(scrollActive, 150));
window.addEventListener("load", scrollActive);
scrollActive();

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
