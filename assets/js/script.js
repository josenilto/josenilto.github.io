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
