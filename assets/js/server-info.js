(function () {
    function el(id) { return document.getElementById(id); }
    function ms(n)  { return isFinite(n) && n >= 0 ? Math.round(n) + ' ms' : '—'; }

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

    // ── Access counter (localStorage) ────────────────────────────
    (function visitCounter() {
        var prevCount  = parseInt(localStorage.getItem('si_count') || '0');
        var prevLast   = localStorage.getItem('si_last');
        var first      = localStorage.getItem('si_first') || new Date().toISOString();
        var now        = new Date();
        var todayStr   = now.toISOString().slice(0, 10);
        var todayCount = localStorage.getItem('si_today_date') === todayStr
            ? parseInt(localStorage.getItem('si_today_count') || '0') + 1
            : 1;
        var count = prevCount + 1;

        localStorage.setItem('si_count',       count);
        localStorage.setItem('si_first',       first);
        localStorage.setItem('si_last',        now.toISOString());
        localStorage.setItem('si_today_date',  todayStr);
        localStorage.setItem('si_today_count', todayCount);

        el('v-total').textContent = count;
        el('v-today').textContent = todayCount + ' visit' + (todayCount !== 1 ? 's' : '');
        el('v-first').textContent = new Date(first).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
        el('v-last').textContent  = prevLast
            ? new Date(prevLast).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
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
