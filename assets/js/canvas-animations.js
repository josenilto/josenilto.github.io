// Shared utilities
function isDark() {
    return document.body.classList.contains('dark-theme');
}

function resizeCanvasToSection(canvas, sectionId) {
    const s = document.getElementById(sectionId);
    if (!s) return;
    canvas.width  = s.offsetWidth;
    canvas.height = s.offsetHeight;
}

// contact-matrix: node network with pulsing connections
(function () {
    const canvas = document.getElementById('contact-matrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const NODE_COUNT = 52;
    const MAX_DIST   = 165;
    let nodes  = [];
    let pulses = [];

    function buildNetwork() {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
            x:    Math.random() * canvas.width,
            y:    Math.random() * canvas.height,
            act:  Math.random() * 0.18,
            r:    Math.random() * 2 + 1.5,
            conns: []
        }));
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].conns = [];
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                if (dx * dx + dy * dy < MAX_DIST * MAX_DIST) nodes[i].conns.push(j);
            }
        }
    }

    function resize() {
        resizeCanvasToSection(canvas, 'contact');
        buildNetwork();
    }
    resize();
    window.addEventListener('resize', resize);

    setInterval(() => {
        if (pulses.length >= 32) return;
        const fi = Math.floor(Math.random() * nodes.length);
        const n  = nodes[fi];
        if (!n.conns.length) return;
        const ti = n.conns[Math.floor(Math.random() * n.conns.length)];
        const t  = nodes[ti];
        const d  = Math.sqrt((t.x - n.x) ** 2 + (t.y - n.y) ** 2);
        pulses.push({ fi, ti, prog: 0, spd: 1.9 / d });
        n.act = Math.min(1, n.act + 0.5);
    }, 160);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [cr, cg, cb] = isDark() ? [0, 230, 100] : [0, 140, 10];

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (const j of a.conns) {
                if (j <= i) continue;
                const b = nodes[j];
                const alpha = 0.04 + (a.act + b.act) * 0.11;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
                ctx.lineWidth = 0.65;
                ctx.stroke();
            }
        }

        pulses = pulses.filter(p => p.prog <= 1);
        for (const p of pulses) {
            p.prog += p.spd;
            const t  = Math.min(p.prog, 1);
            const fn = nodes[p.fi], tn = nodes[p.ti];
            const px = fn.x + (tn.x - fn.x) * t;
            const py = fn.y + (tn.y - fn.y) * t;
            const grd = ctx.createRadialGradient(px, py, 0, px, py, 8);
            grd.addColorStop(0, `rgba(${cr},${cg},${cb},0.9)`);
            grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
            if (t >= 1) tn.act = Math.min(1, tn.act + 0.55);
        }

        for (const n of nodes) {
            n.act = Math.max(0, n.act - 0.007);
            const nr    = n.r + n.act * 2.5;
            const alpha = 0.15 + n.act * 0.78;
            if (n.act > 0.08) {
                const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, nr * 5);
                glow.addColorStop(0, `rgba(${cr},${cg},${cb},${n.act * 0.28})`);
                glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
                ctx.beginPath();
                ctx.arc(n.x, n.y, nr * 5, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();
})();

// greeting/clock: real-time greeting, date, and clock display
(function () {
    const greetingEl = document.getElementById('greeting-text');
    const dateEl     = document.getElementById('greeting-date');
    const clockEl    = document.getElementById('greeting-clock');
    if (!greetingEl) return;

    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
        const now  = new Date();
        const h    = now.getHours();
        const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
        greetingEl.textContent = greeting;
        dateEl.textContent     = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
        clockEl.textContent    = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
})();

// story-hex: hexagonal grid with animated glow
(function () {
    const canvas = document.getElementById('story-hex');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const R = 26;

    function resize() { resizeCanvasToSection(canvas, 'story'); }
    resize();
    window.addEventListener('resize', resize);

    function hexPath(cx, cy) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = Math.PI / 3 * i - Math.PI / 6;
            const px = cx + (R - 1) * Math.cos(a);
            const py = cy + (R - 1) * Math.sin(a);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    const W = R * Math.sqrt(3);
    const H = R * 2;
    const COLS_PAD = 2, ROWS_PAD = 2;

    const waypoints = [
        [0.15, 0.25], [0.65, 0.15], [0.85, 0.55],
        [0.55, 0.80], [0.20, 0.70], [0.40, 0.40],
    ];
    let wp = 0, t = 0;

    function lerp(a, b, x) { return a + (b - a) * x; }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.004;
        if (t >= 1) { t = 0; wp = (wp + 1) % waypoints.length; }

        const cur  = waypoints[wp];
        const next = waypoints[(wp + 1) % waypoints.length];
        const gx   = lerp(cur[0]  * canvas.width,  next[0] * canvas.width,  t);
        const gy   = lerp(cur[1] * canvas.height, next[1] * canvas.height, t);
        const GLOW = 200;

        const cols = Math.ceil(canvas.width  / W) + COLS_PAD;
        const rows = Math.ceil(canvas.height / (H * 0.75)) + ROWS_PAD;

        for (let row = -ROWS_PAD; row < rows; row++) {
            for (let col = -COLS_PAD; col < cols; col++) {
                const cx = col * W + (row % 2 !== 0 ? W / 2 : 0);
                const cy = row * H * 0.75;
                const dist = Math.hypot(cx - gx, cy - gy);
                const base  = 0.045;
                const boost = dist < GLOW ? (1 - dist / GLOW) * 0.22 : 0;

                hexPath(cx, cy);
                ctx.strokeStyle = `rgba(0,100,0,${base + boost})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                if (boost > 0) {
                    ctx.fillStyle = `rgba(0,130,0,${boost * 0.18})`;
                    ctx.fill();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// career-particles: particle system with connecting lines
(function () {
    const canvas = document.getElementById('career-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PARTICLE_COUNT = 55;
    const MAX_DIST = 130;
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
            ctx.fillStyle = base + '0.5)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = base + alpha + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// skills-canvas: falling keyword rain
(function () {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const WORDS = [
        'kubectl','docker','terraform','ansible','helm','argocd',
        'git','bash','python','yaml','linux','CI/CD','IaC','SRE',
        'azure','aws','gcp','kubernetes','nginx','prometheus',
        'grafana','vault','redis','agile','scrum','devops',
        'k8s','ssh','tls','dns','HPA','VPC','rbac','ingress'
    ];

    let cols = [];

    function resize() {
        resizeCanvasToSection(canvas, 'skills');
        init();
    }

    function init() {
        const n = Math.max(8, Math.floor(canvas.width / 88));
        cols = Array.from({ length: n }, (_, i) => ({
            x:   (i + 0.5) * (canvas.width / n),
            y:   Math.random() * canvas.height,
            spd: Math.random() * 0.28 + 0.1,
            w:   WORDS[Math.floor(Math.random() * WORDS.length)],
            sz:  Math.floor(Math.random() * 3) + 9
        }));
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [r, g, b] = isDark() ? [0, 200, 80] : [0, 120, 0];

        for (const c of cols) {
            c.y += c.spd;
            if (c.y > canvas.height + 30) {
                c.y = -20;
                c.w = WORDS[Math.floor(Math.random() * WORDS.length)];
                c.spd = Math.random() * 0.28 + 0.1;
            }
            const fadeY = Math.min(c.y / 80, 1) * Math.min((canvas.height - c.y) / 80, 1);
            const alpha = 0.09 * Math.max(fadeY, 0);
            ctx.font      = `${c.sz}px 'Courier New', monospace`;
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fillText(c.w, c.x - ctx.measureText(c.w).width / 2, c.y);
        }
    }
    draw();
})();

// engagement-canvas: horizontal data streams
(function () {
    const canvas = document.getElementById('engagement-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const STREAMS = [
        'TCP  SYN > ACK', 'SSH  AUTH OK', 'HTTPS 443 > 200',
        'GIT  PUSH OK', 'K8S  POD RUNNING', '0xFF:4A:C0 > HOST',
        'DEPLOY > LIVE', 'CI/CD PASS', 'DNS RESOLVED',
        'VPN CONNECTED', 'TLS 1.3 HS OK', 'GET /api/v2 200',
        'HPA SCALE 2→4', 'CERT VALID 2026', 'INGRESS ROUTED',
        'ANSIBLE OK 12/12', 'PROM ALERT CLEAR', 'KUBECTL APPLY OK'
    ];

    let streams = [];

    function resize() {
        resizeCanvasToSection(canvas, 'engagement');
        init();
    }

    function init() {
        const n = Math.max(6, Math.floor(canvas.height / 58));
        streams = Array.from({ length: n }, (_, i) => ({
            x:     -Math.random() * canvas.width,
            y:     (i + 0.5) * (canvas.height / n),
            spd:   Math.random() * 0.38 + 0.15,
            txt:   STREAMS[Math.floor(Math.random() * STREAMS.length)],
            alpha: Math.random() * 0.05 + 0.04
        }));
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [r, g, b] = isDark() ? [0, 200, 80] : [0, 120, 0];
        ctx.font = "10px 'Courier New', monospace";

        for (const s of streams) {
            s.x += s.spd;
            const w = ctx.measureText(s.txt).width;
            if (s.x > canvas.width + w) {
                s.x    = -w - 10;
                s.txt  = STREAMS[Math.floor(Math.random() * STREAMS.length)];
                s.spd  = Math.random() * 0.38 + 0.15;
                s.alpha = Math.random() * 0.05 + 0.04;
            }
            const fadeIn  = Math.min((s.x + w) / 90, 1);
            const fadeOut = Math.min((canvas.width - s.x) / 90, 1);
            const alpha   = s.alpha * Math.max(Math.min(fadeIn, fadeOut), 0);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fillText(s.txt, s.x, s.y);
        }
    }
    draw();
})();

// jbos-canvas: floating CLI commands
(function () {
    const canvas = document.getElementById('jbos-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CMDS = [
        '$ kubectl apply -f deployment.yaml',
        '$ terraform plan --out tfplan',
        '$ ansible-playbook -i hosts site.yml',
        '$ docker build -t app:v2.1 .',
        '$ git push origin main --tags',
        '$ helm upgrade --install app ./chart',
        '$ kubectl rollout status deploy/api',
        '$ aws eks update-kubeconfig --name prod',
        '$ az aks get-credentials --name cluster',
        '$ systemctl restart nginx.service',
        '$ prometheus --config.file=prom.yml',
        '$ vault kv put secret/app token=...',
        '$ kubectl get pods -n production',
        '$ terraform apply -auto-approve tfplan',
        '$ ssh -i ~/.ssh/key user@10.0.1.42'
    ];

    let items = [];

    function resize() {
        resizeCanvasToSection(canvas, 'jbos');
        init();
    }

    function init() {
        items = CMDS.map(txt => ({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            vx:    (Math.random() - 0.5) * 0.22,
            vy:    (Math.random() - 0.5) * 0.16,
            txt,
            alpha: Math.random() * 0.055 + 0.025
        }));
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [r, g, b] = isDark() ? [0, 200, 80] : [0, 120, 0];
        ctx.font = "10px 'Courier New', monospace";

        for (const c of items) {
            c.x += c.vx;
            c.y += c.vy;
            const w = ctx.measureText(c.txt).width;
            if (c.x > canvas.width + w)  c.x = -w;
            if (c.x < -w)                c.x = canvas.width + w;
            if (c.y > canvas.height + 14) c.y = -14;
            if (c.y < -14)               c.y = canvas.height + 14;

            ctx.fillStyle = `rgba(${r},${g},${b},${c.alpha})`;
            ctx.fillText(c.txt, c.x, c.y);
        }
    }
    draw();
})();
