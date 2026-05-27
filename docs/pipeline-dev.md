# 🛠️ Pipeline DEV — Documentação Completa

> **Arquivo:** `.github/workflows/pipeline-dev.yml`
> **Data de criação:** 2026-05-27
> **Projeto:** [josenilto.github.io/dev](https://josenilto.github.io/dev)

---

## 📋 Visão Geral

Pipeline de CI/CD para o ambiente de desenvolvimento do portfólio.
Responsável por auditar pacotes com critério mais rigoroso, validar o build em modo dev,
verificar links (como aviso) e publicar na subpasta `/dev` do GitHub Pages via branch `gh-pages`.

---

## ⚡ Gatilhos (Triggers)

| Evento | Branch/Condição |
|--------|-----------------|
| `push` | `dev` |
| `pull_request` | `dev` |
| `workflow_dispatch` | Manual via GitHub Actions UI |

> **Parâmetro manual:** `skip_link_check: true` pula a verificação de links.

---

## 🔀 Diferenças DEV × PRD

| Aspecto | DEV (`pipeline-dev.yml`) | PRD (`pipeline-prd.yml`) |
|---------|--------------------------|--------------------------|
| **Branch** | `dev` | `prd` / `master` / `main` |
| **Build mode** | `npm run build:dev -- --base /dev/` | `npm run build` |
| **Base path** | `/dev/` | `/` (raiz) |
| **Auditoria** | `--audit-level=moderate` (mais rigorosa) | `--audit-level=high` |
| **Link check — locais** | ⚠️ Aviso (não bloqueia) | ❌ Bloqueia |
| **Link check — externos** | ⚠️ Aviso (não bloqueia) | ⚠️ Aviso (não bloqueia) |
| **Concurrency** | `cancel-in-progress: true` | `cancel-in-progress: false` |
| **Deploy método** | `peaceiris/actions-gh-pages@v4` | `actions/deploy-pages@v4` |
| **Deploy destino** | `gh-pages` branch → `/dev/` | GitHub Pages API → raiz |
| **Aprovação manual** | ❌ Não (deploy automático) | ✅ Opcional (via environment) |
| **Retenção artefato** | 1 dia | 3 dias |

---

## ⚙️ Configuração Necessária no GitHub

### 1. GitHub Pages Source

Para o deploy DEV funcionar no branch `gh-pages`:

```
Repositório → Settings → Pages
  Source → "Deploy from a branch"
  Branch → gh-pages
  Folder → / (root)
```

> ⚠️ **Atenção:** O pipeline PRD usa `actions/deploy-pages@v4` (via Pages API).
> O pipeline DEV usa `peaceiris/actions-gh-pages@v4` (via branch `gh-pages`).
> Para ambos coexistirem, configure o Pages source para `gh-pages branch`.
> Atualize também o `pipeline-prd.yml` para usar `peaceiris/actions-gh-pages@v4`
> se quiser que o PRD também publique via branch.

### 2. Environment `dev`

```
Repositório → Settings → Environments → New environment → "dev"
```

Nenhum reviewer necessário (deploy automático).

### 3. Permissões do GITHUB_TOKEN

O `peaceiris/actions-gh-pages@v4` precisa de permissão de escrita no repositório.
Verifique:

```
Repositório → Settings → Actions → General
  Workflow permissions → "Read and write permissions" ✅
```

---

## 🗺️ Fluxo dos Jobs

```
push dev
    │
    ▼
┌──────────────────────────┐
│  JOB 1 — 🔍 Auditoria    │  npm audit --audit-level=moderate
│       de Pacotes         │  (mais rigorosa que PRD)
└────────────┬─────────────┘
             │ needs: audit
             ▼
┌──────────────────────────┐
│  JOB 2 — 🔨 Lint & Build │  eslint + vite build:dev --base /dev/
│       (modo dev)         │  → artefato dist-dev
└────────────┬─────────────┘
             │ needs: build
             ▼
┌──────────────────────────┐
│  JOB 3 — 🔗 Link Check   │  linkinator (tudo como ⚠️ aviso)
│       (permissivo)       │  não bloqueia o deploy
└────────────┬─────────────┘
             │ needs: build + link-check (sempre continua)
             ▼
┌──────────────────────────┐
│  JOB 4 — 🌐 Deploy /dev  │  gh-pages branch → /dev/
│  (automático, sem gate)  │  URL: josenilto.github.io/dev
└──────────────────────────┘
```

---

## 🔍 JOB 1 — Auditoria de Pacotes

**Working directory:** `dev/`
**Nível de auditoria:** `moderate` (pega vulnerabilidades médias antes de chegarem ao PRD)

| Etapa | Comando | Comportamento |
|-------|---------|---------------|
| Instalar | `npm ci` | Usa `dev/package-lock.json` + cache |
| Auditoria | `npm audit --audit-level=moderate` | **Bloqueia** se `moderate`, `high` ou `critical` |
| Outdated | `npm outdated` | Informativo, não bloqueia |

---

## 🔨 JOB 2 — Lint & Build (modo development)

**Working directory:** `dev/`

| Etapa | Comando | Detalhe |
|-------|---------|---------|
| Instalar | `npm ci` | |
| Lint | `npm run lint` | ESLint — **bloqueia** se houver erros |
| Build | `npm run build:dev -- --base /dev/` | Vite em modo development com base path `/dev/` |
| Upload | `actions/upload-artifact@v4` | `dist-dev`, retido por **1 dia** |

### Por que `--base /dev/`?

O Vite gera referências de assets com base no path configurado.
Sem `--base /dev/`, os assets seriam gerados como `/assets/index.js`,
mas precisam ser `/dev/assets/index.js` para funcionar na subpasta.

```html
<!-- Sem --base /dev/ (errado para subpasta) -->
<script src="/assets/index-abc123.js"></script>

<!-- Com --base /dev/ (correto) -->
<script src="/dev/assets/index-abc123.js"></script>
```

---

## 🔗 JOB 3 — Verificação de Links (permissivo)

Em DEV, **todos os erros de link são avisos** — nunca bloqueiam o deploy.

| Alvo | Tipo | Falha na pipeline? |
|------|------|--------------------|
| `index.html` — links locais | Arquivos locais | ⚠️ Aviso apenas |
| `index.html` — links externos | GitHub, LinkedIn... | ⚠️ Aviso apenas |
| `dev/dist/` — links locais | Build React | ⚠️ Aviso apenas |
| `dev/dist/` — links externos | Links no React | ⚠️ Aviso apenas |

> **Filosofia:** DEV é para iteração rápida. Links quebrados são reportados
> no Step Summary para análise, mas não impedem o deploy para teste.

---

## 🌐 JOB 4 — Deploy GitHub Pages (`/dev`)

**Action:** `peaceiris/actions-gh-pages@v4`
**Branch destino:** `gh-pages`
**Subpasta:** `/dev`
**URL:** https://josenilto.github.io/dev

### Estrutura publicada

```
gh-pages branch
└── dev/                           ← publicado pelo pipeline-dev.yml
    ├── index.html                 ← portfólio estático
    ├── assets/
    │   ├── css/styles.css
    │   ├── img/
    │   └── js/
    └── app/                       ← React app compilada (modo dev)
        ├── index.html
        └── assets/
            └── (com prefix /dev/)
```

> O `keep_files: true` preserva outros diretórios no `gh-pages` branch
> (como `/hmg/` ou a raiz gerenciada pelo PRD).

### Permissões necessárias

```yaml
permissions:
  contents: write   # para push no gh-pages branch
```

---

## 📊 Comparação de Gates de Qualidade

```
              DEV              PRD
              ────             ────
npm audit    moderate ❌       high ❌
ESLint       ❌ bloqueia       ❌ bloqueia
vite build   ❌ bloqueia       ❌ bloqueia
links locais ⚠️ aviso          ❌ bloqueia
links ext.   ⚠️ aviso          ⚠️ aviso
deploy gate  automático        automático*

* PRD pode ter aprovação manual configurada no Environment
```

---

## 🔒 Concurrency

```yaml
concurrency:
  group: pipeline-dev-${{ github.ref }}
  cancel-in-progress: true   # ← DEV cancela runs antigas
```

Em DEV, pushes frequentes cancelam a run anterior automaticamente,
economizando minutos do Actions e mantendo apenas o estado mais recente.

---

## 🛠️ Troubleshooting

### Assets com 404 após deploy

**Causa:** Build gerado sem `--base /dev/`.
**Solução:** Confirme que o step de build usa `-- --base /dev/`.

### Deploy não aparece em `/dev`

**Causa:** Pages source não está configurado para o branch `gh-pages`.
**Solução:** `Settings → Pages → Source → gh-pages branch`.

### `peaceiris/actions-gh-pages` failing com 403

**Causa:** Permissão de escrita não habilitada.
**Solução:** `Settings → Actions → General → Read and write permissions`.

### Link check bloqueando o deploy

**Causa:** `continue-on-error` não está definido em algum step.
**Solução:** Todos os steps de link-check em DEV têm `continue-on-error: true`.

---

*Documentação gerada em 2026-05-27 por Claude Code (claude-sonnet-4-6).*
