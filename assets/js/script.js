if (window.AOS) AOS.init({ offset: 0 });

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
