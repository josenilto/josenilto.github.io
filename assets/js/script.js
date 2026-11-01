if (window.AOS) {
    AOS.init({ offset: 0 });
    // O AOS mede as posições no DOMContentLoaded, antes de fontes/imagens e do
    // salto para o #hash; sem recalcular, seções mais abaixo (ex.: /#education
    // no celular) ficavam sem animar. Recalcula quando tudo carregou.
    window.addEventListener('load', () => AOS.refresh());
}

// Typewriter Effect

const texts = [
    "DevOps",
    "SRE",
    "SysAdmin",
    "CloudOps",
    "ITOps",
    "FinOps",
    "AIOps",
]

let speed  =100;
const textElements = document.querySelector(".typewriter-text");

let textIndex = 0;
let charcterIndex = 0;

function typeWriter(){
    if (charcterIndex < texts[textIndex].length){
        textElements.innerHTML += texts[textIndex].charAt(charcterIndex);
        charcterIndex++;
        setTimeout(typeWriter, speed); 
    }
    else{
        setTimeout(eraseText, 1000)
    }
}

function eraseText(){
    if(textElements.innerHTML.length > 0){
        textElements.innerHTML = textElements.innerHTML.slice(0,-1);
        setTimeout(eraseText, 50)
    }
    else{
        textIndex = (textIndex + 1) % texts.length;
        charcterIndex = 0;
        setTimeout(typeWriter, 500)
    }
}

window.onload = typeWriter;

// Contagem animada dos números da carreira (.career__stat-num).
// O HTML já traz o valor final (SEO / sem JS); aqui ele recomeça do zero
// quando o card entra na tela. Sem animação com prefers-reduced-motion.
(function () {
    const nums = document.querySelectorAll('.career__stat-num[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const run = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                io.unobserve(e.target);
                run(e.target);
            }
        });
    }, { threshold: 0.6 });

    nums.forEach((el) => io.observe(el));
})();

// Experience: mostra as 6 mais recentes e um botão "Ver todas"; sem JS tudo
// aparece. Também posiciona o brilho dos cards (--mx/--my) sob o mouse.
(function () {
    const section = document.getElementById('experience');
    const btn = section && section.querySelector('.experience__toggle');
    if (!section || !btn) return;

    const label = btn.querySelector('.experience__toggle-label');
    section.classList.add('is-collapsible');

    btn.addEventListener('click', () => {
        const expanded = section.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', expanded);
        label.textContent = expanded ? btn.dataset.labelLess : btn.dataset.labelMore;
        if (!expanded && section.getBoundingClientRect().top < 0) {
            // ao recolher estando mais abaixo, volta para o início da seção
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (window.AOS) window.AOS.refresh();
    });

    section.querySelectorAll('.experience__card').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });
})();

// Benefits: inclinação 3D leve que acompanha o mouse (só com mouse/caneta e
// sem prefers-reduced-motion). Usa a variável --tilt do CSS (propriedade rotate).
(function () {
    const cards = document.querySelectorAll('.benefit__card');
    if (!cards.length || !window.matchMedia) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const MAX = 6; // graus
    cards.forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            // eixo perpendicular ao deslocamento do mouse; ângulo proporcional à distância do centro
            const angle = Math.min(Math.hypot(x, y) * 2, 1) * MAX;
            card.style.setProperty('--tilt', `${(-y).toFixed(3)} ${x.toFixed(3)} 0 ${angle.toFixed(2)}deg`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--tilt', '0 0 1 0deg');
        });
    });
})();

// Labs: filtro por categoria (pílulas). Sem JS, todas as categorias aparecem.
(function () {
    const pills = document.querySelectorAll('.labs__pill');
    const cards = document.querySelectorAll('.labs__card');
    if (!pills.length || !cards.length) return;

    pills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const filter = pill.dataset.filter;
            pills.forEach((p) => {
                const on = p === pill;
                p.classList.toggle('is-active', on);
                p.setAttribute('aria-pressed', on);
            });
            cards.forEach((card) => {
                const show = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-filtered', !show);
                card.classList.remove('is-revealed');
                if (show) {
                    void card.offsetWidth; // reinicia a animação de entrada
                    card.classList.add('is-revealed');
                }
            });
            if (window.AOS) window.AOS.refresh();
        });
    });
})();

// Voltar ao topo: anel de progresso da rolagem e decolagem do foguete 🚀.
// O main.js mostra/esconde o botão (.show-scroll); aqui só o efeito.
(function () {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ticking = false;
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
        btn.style.setProperty('--progress', pct.toFixed(1));
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    let busy = false;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (reduce) { window.scrollTo(0, 0); return; }
        if (busy) return;
        busy = true;
        btn.classList.add('is-launching');
        // a página sobe logo depois da ignição
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 150);
        setTimeout(() => {
            btn.classList.remove('is-launching');
            btn.classList.add('is-landing');
            setTimeout(() => { btn.classList.remove('is-landing'); busy = false; }, 500);
        }, 950);
    });
})();
