(function () {
    function el(id) { return document.getElementById(id); }
    function ms(n)  { return isFinite(n) && n >= 0 ? Math.round(n) + ' ms' : '—'; }

    // ── Real-time charts — métricas reais do servidor ─────────────
    // Fonte: GET /metrics.json (entrypoint.sh → /proc/stat + /proc/meminfo)
    // Em GitHub Pages (sem container) retorna 404 → exibe "n/a"
    (function realtimeCharts() {
        var MAX = 60;
        var cpuData = new Array(MAX).fill(0);
        var memData = new Array(MAX).fill(0);

        var cpuCanvas = document.getElementById('cpu-chart');
        var memCanvas = document.getElementById('mem-chart');
        if (!cpuCanvas || !memCanvas) return;
        var cpuCtx = cpuCanvas.getContext('2d');
        var memCtx = memCanvas.getContext('2d');

        function colors() {
            var dark = document.body.classList.contains('dark-theme') ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
            return dark
                ? { line: '#00c853', fill0: 'rgba(0,200,80,0.18)', fill1: 'rgba(0,200,80,0.02)', grid: 'rgba(0,200,80,0.1)' }
                : { line: '#006400', fill0: 'rgba(0,100,0,0.15)',  fill1: 'rgba(0,100,0,0.01)',  grid: 'rgba(0,100,0,0.08)' };
        }

        function draw(canvas, ctx, data) {
            var dpr = window.devicePixelRatio || 1;
            var w = canvas.offsetWidth, h = canvas.offsetHeight;
            if (!w || !h) return;
            canvas.width  = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            var c = colors(), pad = 4, ih = h - pad * 2;

            ctx.strokeStyle = c.grid; ctx.lineWidth = 0.5;
            for (var g = 1; g <= 3; g++) {
                ctx.beginPath();
                ctx.moveTo(0, pad + ih * g / 4);
                ctx.lineTo(w, pad + ih * g / 4);
                ctx.stroke();
            }

            var step = w / (data.length - 1);
            function pt(i) { return { x: i * step, y: pad + ih * (1 - data[i] / 100) }; }

            var grad = ctx.createLinearGradient(0, pad, 0, h);
            grad.addColorStop(0, c.fill0); grad.addColorStop(1, c.fill1);
            ctx.beginPath();
            var p = pt(0); ctx.moveTo(p.x, h); ctx.lineTo(p.x, p.y);
            for (var i = 1; i < data.length; i++) { p = pt(i); ctx.lineTo(p.x, p.y); }
            ctx.lineTo(p.x, h); ctx.fillStyle = grad; ctx.fill();

            ctx.beginPath(); ctx.strokeStyle = c.line; ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round'; ctx.lineCap = 'round';
            p = pt(0); ctx.moveTo(p.x, p.y);
            for (var i = 1; i < data.length; i++) { p = pt(i); ctx.lineTo(p.x, p.y); }
            ctx.stroke();

            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = c.line; ctx.fill();
        }

        function tick() {
            fetch('/metrics.json', { cache: 'no-store' })
                .then(function (res) { return res.json(); })
                .then(function (d) {
                    var cpu = Math.min(100, Math.max(0, d.cpu || 0));
                    cpuData.push(cpu); if (cpuData.length > MAX) cpuData.shift();
                    var cpuVal = el('cpu-val');
                    if (cpuVal) cpuVal.textContent = cpu + '%';
                    draw(cpuCanvas, cpuCtx, cpuData);

                    var mem = Math.min(100, Math.max(0, d.mem_pct || 0));
                    memData.push(mem); if (memData.length > MAX) memData.shift();
                    var memVal = el('mem-val');
                    if (memVal) memVal.textContent = (d.mem_used_mb || 0) + ' MB  ' + mem + '%';
                    draw(memCanvas, memCtx, memData);
                })
                .catch(function () {
                    var cpuVal = el('cpu-val');
                    var memVal = el('mem-val');
                    if (cpuVal && cpuVal.textContent !== 'n/a') cpuVal.textContent = 'n/a';
                    if (memVal && memVal.textContent !== 'n/a') memVal.textContent = 'n/a';
                });
        }

        window.addEventListener('resize', function () {
            draw(cpuCanvas, cpuCtx, cpuData);
            draw(memCanvas, memCtx, memData);
        });
        setInterval(tick, 1000);
        setTimeout(tick, 200);
    })();

    // ── Origin ────────────────────────────────────────────────────
    el('i-protocol').textContent = location.protocol.replace(':', '');
    el('i-host').textContent     = location.hostname;

    // ── Health check ──────────────────────────────────────────────
    (function healthCheck() {
        var t0 = performance.now();
        fetch('/health', { cache: 'no-store' })
            .then(function (res) {
                var latency = performance.now() - t0;
                var ok = res.status === 200;
                el('h-code').textContent    = res.status;
                el('h-label').textContent   = ok ? 'healthy' : 'degraded';
                el('h-latency').textContent = Math.round(latency) + ' ms';
                el('h-ts').textContent      = new Date().toLocaleTimeString();
                el('status-dot').className  = 'status-dot ' + (ok ? 'ok' : 'err');
                el('status-text').textContent = ok ? 'online' : 'degraded';
                if (!ok) el('h-code').style.color = '#c62828';
            })
            .catch(function () {
                el('h-code').textContent    = 'ERR';
                el('h-label').textContent   = 'unreachable';
                el('h-ts').textContent      = new Date().toLocaleTimeString();
                el('status-dot').className  = 'status-dot err';
                el('status-text').textContent = 'offline';
            });
    })();

    // ── Access counter — leitura dos dados gravados pelo index.html ─
    (function visitCounter() {
        var count      = parseInt(localStorage.getItem('si_count') || '0');
        var first      = localStorage.getItem('si_first');
        var last       = localStorage.getItem('si_last');
        var todayStr   = new Date().toISOString().slice(0, 10);
        var todayCount = localStorage.getItem('si_today_date') === todayStr
            ? parseInt(localStorage.getItem('si_today_count') || '0') : 0;

        el('v-total').textContent = count || '—';
        el('v-today').textContent = todayCount + ' visit' + (todayCount !== 1 ? 's' : '');
        el('v-first').textContent = first
            ? new Date(first).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
            : '—';
        el('v-last').textContent  = last
            ? new Date(last).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
            : '—';

        var sessionStart = Date.now();
        setInterval(function () {
            var s = Math.floor((Date.now() - sessionStart) / 1000);
            var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
            el('v-session').textContent = h > 0
                ? h + 'h ' + m + 'm ' + sec + 's'
                : m > 0 ? m + 'm ' + sec + 's' : sec + 's';
        }, 1000);
    })();

    // ── Index.html probe ──────────────────────────────────────────
    (function indexProbe() {
        var t0 = performance.now();
        fetch('/', { cache: 'no-store' })
            .then(function (res) {
                el('idx-status').textContent = res.status;
                el('idx-ttfb').textContent   = Math.round(performance.now() - t0) + ' ms';
                el('idx-ct').textContent     = (res.headers.get('content-type') || '—').split(';')[0].trim();
                el('idx-lm').textContent     = res.headers.get('last-modified') || '—';
                el('idx-cc').textContent     = res.headers.get('cache-control') || '—';
                return res.text();
            })
            .then(function (body) {
                el('idx-size').textContent =
                    (body.length / 1024).toFixed(1) + ' KB (' + body.length.toLocaleString() + ' chars)';
            })
            .catch(function () {
                el('idx-status').textContent = 'error';
                el('idx-ttfb').textContent   = '—';
            });
    })();

    // ── Performance timing ────────────────────────────────────────
    window.addEventListener('load', function () {
        var nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
            el('p-dns').textContent  = ms(nav.domainLookupEnd - nav.domainLookupStart);
            el('p-tcp').textContent  = ms(nav.connectEnd - nav.connectStart);
            el('p-tls').textContent  = nav.secureConnectionStart > 0
                ? ms(nav.connectEnd - nav.secureConnectionStart)
                : 'n/a';
            el('p-ttfb').textContent = ms(nav.responseStart - nav.requestStart);
            el('p-dom').textContent  = ms(nav.domContentLoadedEventEnd);
            el('p-load').textContent = ms(nav.loadEventEnd);
        } else if (performance.timing) {
            var t = performance.timing;
            el('p-dns').textContent  = ms(t.domainLookupEnd - t.domainLookupStart);
            el('p-tcp').textContent  = ms(t.connectEnd - t.connectStart);
            el('p-tls').textContent  = t.secureConnectionStart > 0
                ? ms(t.connectEnd - t.secureConnectionStart)
                : 'n/a';
            el('p-ttfb').textContent = ms(t.responseStart - t.requestStart);
            el('p-dom').textContent  = ms(t.domContentLoadedEventEnd - t.navigationStart);
            el('p-load').textContent = ms(t.loadEventEnd - t.navigationStart);
        }

        // ── Deploy info ───────────────────────────────────────────
        var modified = new Date(document.lastModified);
        el('d-modified').textContent = isNaN(modified.getTime())
            ? '—'
            : modified.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        el('d-https').textContent = location.protocol === 'https:' ? 'yes' : 'no';
        el('d-nodes').textContent = document.querySelectorAll('*').length + ' nodes';

        // ── Resource timing ───────────────────────────────────────
        var res     = performance.getEntriesByType('resource');
        var cached  = res.filter(function (r) { return r.transferSize === 0; }).length;
        var txBytes = res.reduce(function (a, r) { return a + (r.transferSize || 0); }, 0);
        var scripts = res.filter(function (r) { return r.initiatorType === 'script'; }).length;
        var styles  = res.filter(function (r) { return /\.css(\?|$)/.test(r.name); }).length;
        var images  = res.filter(function (r) { return r.initiatorType === 'img'; }).length;

        el('r-total').textContent   = res.length + ' files';
        el('r-cached').textContent  = cached + ' / ' + res.length;
        el('r-size').textContent    = txBytes >= 1024
            ? (txBytes / 1024).toFixed(1) + ' KB'
            : txBytes + ' B';
        el('r-scripts').textContent = scripts;
        el('r-styles').textContent  = styles;
        el('r-images').textContent  = images;

        // ── Capabilities ──────────────────────────────────────────
        el('cap-cpu').textContent   = navigator.hardwareConcurrency || '—';
        el('cap-mem').textContent   = navigator.deviceMemory
            ? navigator.deviceMemory + ' GB'
            : 'n/a';
        el('cap-dpr').textContent   = (window.devicePixelRatio || 1).toFixed(1) + 'x';
        el('cap-tz').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
        el('cap-online').textContent = navigator.onLine ? 'yes' : 'no';
        el('cap-sw').textContent     = 'serviceWorker' in navigator ? 'yes' : 'no';
        el('cap-ls').textContent     = (function () {
            try { return localStorage ? 'yes' : 'no'; } catch (e) { return 'blocked'; }
        })();
        var mem = performance.memory;
        el('cap-heap').textContent = mem
            ? (mem.usedJSHeapSize / 1048576).toFixed(1) + ' / ' +
              (mem.totalJSHeapSize / 1048576).toFixed(1) + ' MB'
            : 'n/a';
    });

    // ── Client info ───────────────────────────────────────────────
    (function clientInfo() {
        var ua = navigator.userAgent;

        var browser = 'unknown';
        if      (/Edg\//.test(ua))     browser = 'Edge';
        else if (/OPR\//.test(ua))     browser = 'Opera';
        else if (/Chrome\//.test(ua))  browser = 'Chrome';
        else if (/Safari\//.test(ua))  browser = 'Safari';
        else if (/Firefox\//.test(ua)) browser = 'Firefox';

        var os = 'unknown';
        if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
        else if (/Windows NT/.test(ua))    os = 'Windows';
        else if (/Mac OS X/.test(ua))      os = 'macOS';
        else if (/Android/.test(ua))       os = 'Android';
        else if (/iPhone|iPad/.test(ua))   os = 'iOS';
        else if (/Linux/.test(ua))         os = 'Linux';

        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var connStr = conn
            ? [conn.effectiveType, conn.downlink ? conn.downlink + ' Mbps' : null]
                .filter(Boolean).join(' · ')
            : 'unknown';

        el('c-browser').textContent  = browser;
        el('c-os').textContent       = os;
        el('c-conn').textContent     = connStr;
        el('c-viewport').textContent = window.innerWidth + ' × ' + window.innerHeight + ' px';
        el('c-lang').textContent     = navigator.language || '—';
        el('c-cookies').textContent  = navigator.cookieEnabled ? 'enabled' : 'disabled';
    })();

    // ── Live UTC clock ────────────────────────────────────────────
    (function clock() {
        function tick() {
            var liveEl = el('live-time');
            if (liveEl) liveEl.textContent = new Date().toUTCString().replace(' GMT', '');
        }
        tick();
        setInterval(tick, 1000);
    })();
})();
