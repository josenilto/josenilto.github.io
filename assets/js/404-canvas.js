// Ajusta o href do botão "Back to Home" conforme o sub-path (movido do inline do 404.html)
(function () {
    var p = window.location.pathname;
    var btn = document.querySelector('a.btn');
    if (!btn) return;
    if (p.indexOf('/hmg') === 0)      btn.href = '/hmg/';
    else if (p.indexOf('/dev') === 0) btn.href = '/dev/';
    // else stays '/' para PRD
})();

(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const NODE_COUNT = 45;
    const MAX_DIST   = 150;
    let nodes  = [];
    let pulses = [];

    function buildNetwork() {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            act: Math.random() * 0.15,
            r:   Math.random() * 2 + 1.5,
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
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        buildNetwork();
    }
    resize();
    window.addEventListener('resize', resize);

    setInterval(() => {
        if (pulses.length >= 28) return;
        const fi = Math.floor(Math.random() * nodes.length);
        const n  = nodes[fi];
        if (!n.conns.length) return;
        const ti = n.conns[Math.floor(Math.random() * n.conns.length)];
        const t  = nodes[ti];
        const d  = Math.sqrt((t.x - n.x) ** 2 + (t.y - n.y) ** 2);
        pulses.push({ fi, ti, prog: 0, spd: 1.8 / d });
        n.act = Math.min(1, n.act + 0.5);
    }, 180);

    function isDark() {
        var stored = localStorage.getItem('selected-theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const dark = isDark();
        const [r, g, b] = dark ? [0, 220, 90] : [0, 130, 10];

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (const j of a.conns) {
                if (j <= i) continue;
                const bn = nodes[j];
                const alpha = 0.04 + (a.act + bn.act) * 0.10;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(bn.x, bn.y);
                ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.lineWidth = 0.6;
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
            const grd = ctx.createRadialGradient(px, py, 0, px, py, 7);
            grd.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(px, py, 7, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
            if (t >= 1) tn.act = Math.min(1, tn.act + 0.55);
        }

        for (const n of nodes) {
            n.act = Math.max(0, n.act - 0.007);
            const nr    = n.r + n.act * 2.5;
            const alpha = 0.15 + n.act * 0.75;
            if (n.act > 0.08) {
                const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, nr * 5);
                glow.addColorStop(0, `rgba(${r},${g},${b},${n.act * 0.25})`);
                glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
                ctx.beginPath();
                ctx.arc(n.x, n.y, nr * 5, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();
})();
