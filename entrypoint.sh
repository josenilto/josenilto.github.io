#!/bin/sh
# Coleta métricas de CPU e memória do container e escreve /tmp/metrics.json a cada ~5 s.
# Compatível com ash/dash (Alpine). Requer: awk, grep, date, printf.

metrics_loop() {
    while true; do

        # ── Memória (/proc/meminfo, valores em kB) ────────────────
        mem_total=$(awk '/^MemTotal:/{print $2}'     /proc/meminfo)
        mem_avail=$(awk '/^MemAvailable:/{print $2}' /proc/meminfo)
        mem_used=$(( mem_total - mem_avail ))
        mem_pct=$(( mem_used * 100 / mem_total ))

        # ── CPU (duas leituras com 1 s de intervalo) ──────────────
        # /proc/stat linha cpu: user nice system idle iowait irq softirq steal ...
        line1=$(grep '^cpu ' /proc/stat)
        sleep 1
        line2=$(grep '^cpu ' /proc/stat)

        # total = soma de todos os campos; idle = campo 5 (idle) + campo 6 (iowait)
        t1=$(echo "$line1" | awk '{s=0; for(i=2;i<=NF;i++) s+=$i; print s, $5+$6}')
        t2=$(echo "$line2" | awk '{s=0; for(i=2;i<=NF;i++) s+=$i; print s, $5+$6}')

        total1=$(echo "$t1" | cut -d' ' -f1)
        idle1=$(echo  "$t1" | cut -d' ' -f2)
        total2=$(echo "$t2" | cut -d' ' -f1)
        idle2=$(echo  "$t2" | cut -d' ' -f2)

        dt=$(( total2 - total1 ))
        di=$(( idle2  - idle1  ))
        if [ "$dt" -gt 0 ]; then
            cpu_pct=$(( (dt - di) * 100 / dt ))
        else
            cpu_pct=0
        fi

        # ── Escreve JSON em tmpfs ─────────────────────────────────
        printf '{"cpu":%d,"mem_pct":%d,"mem_used_mb":%d,"mem_total_mb":%d,"ts":"%s"}\n' \
            "$cpu_pct" "$mem_pct" \
            "$(( mem_used  / 1024 ))" \
            "$(( mem_total / 1024 ))" \
            "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            > /tmp/metrics.json

        sleep 4
    done
}

metrics_loop &
exec nginx -g "daemon off;"
