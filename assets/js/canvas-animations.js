// Shared utilities
function isDark() {
    return document.body.classList.contains('dark-theme');
}

// Agendador das animações de canvas:
// - só desenha canvases visíveis na viewport (IntersectionObserver);
// - começa após o carregamento, quando o navegador estiver ocioso,
//   para não disputar a thread principal com a renderização inicial;
// - não anima nada com prefers-reduced-motion (acessibilidade / economia).
const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvasVisible = new WeakMap();
const pendingDraw   = new WeakMap();
const canvasObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const e of entries) {
            canvasVisible.set(e.target, e.isIntersecting);
            const fn = pendingDraw.get(e.target);
            if (e.isIntersecting && fn) {
                pendingDraw.delete(e.target);
                requestAnimationFrame(fn);
            }
        }
    })
    : null;

function whenIdle(fn) {
    const run = () => ('requestIdleCallback' in window)
        ? requestIdleCallback(fn, { timeout: 2000 })
        : setTimeout(fn, 200);
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
}

function nextFrame(canvas, draw) {
    if (reduceMotion) return;
    if (!canvasObserver) {
        requestAnimationFrame(draw);
        return;
    }
    if (!canvasVisible.has(canvas)) {
        // 1º quadro: aguarda ociosidade + visibilidade antes de desenhar
        canvasVisible.set(canvas, false);
        pendingDraw.set(canvas, draw);
        whenIdle(() => canvasObserver.observe(canvas));
        return;
    }
    if (canvasVisible.get(canvas) === false) {
        pendingDraw.set(canvas, draw);
        return;
    }
    requestAnimationFrame(draw);
}

function resizeCanvasToSection(canvas, sectionId) {
    const s = document.getElementById(sectionId);
    if (!s) return;
    canvas.width  = s.offsetWidth;
    canvas.height = s.offsetHeight;
}

// greeting/clock: real-time greeting, date, and clock display
(function () {
    const greetingEl = document.getElementById('greeting-text');
    const dateEl     = document.getElementById('greeting-date');
    const clockEl    = document.getElementById('greeting-clock');
    if (!greetingEl) return;

    const isPt = document.documentElement.lang.toLowerCase().startsWith('pt');

    const DAYS   = isPt
        ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
        : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = isPt
        ? ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
        : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const GREETINGS = isPt
        ? ['Bom dia','Boa tarde','Boa noite']
        : ['Good morning','Good afternoon','Good evening'];

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
        const now  = new Date();
        const h    = now.getHours();
        const greeting = h < 12 ? GREETINGS[0] : h < 18 ? GREETINGS[1] : GREETINGS[2];
        greetingEl.textContent = greeting;
        dateEl.textContent     = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
        clockEl.textContent    = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
})();

// career-particles: particle system with connecting lines
(function () {
    const canvas = document.getElementById('career-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PARTICLE_COUNT = 30;
    const MAX_DIST = 110;
    let particles = [];

    function resize() { resizeCanvasToSection(canvas, 'career'); }
    resize();
    window.addEventListener('resize', () => { resize(); init(); });

    function particleColor() {
        return isDark() ? 'rgba(0,200,80,' : 'rgba(0,100,0,';
    }

    function init() {
        particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 1.5,
        }));
    }
    init();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const base = particleColor();

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = base + '0.3)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = base + alpha + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        nextFrame(canvas, draw);
    }
    nextFrame(canvas, draw);
})();

