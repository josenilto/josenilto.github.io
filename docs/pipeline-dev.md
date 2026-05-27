# 🛠️ Pipeline DEV — Resumo Completo

> **Workflow:** `.github/workflows/pipeline-dev.yml`
> **Documentação relacionada:** [`docs/pipeline-prd.md`](./pipeline-prd.md)
> **Data:** 2026-05-27
> **Autor:** Josenilto L da Silva
> **Commit:** `ecea981` → branch `prd` → `origin/josenilto.github.io`

---

## 📌 O que foi feito

### Arquivos criados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `.github/workflows/pipeline-dev.yml` | ✅ Novo | Pipeline completa para o ambiente DEV |
| `docs/pipeline-dev.md` | ✅ Novo | Esta documentação |

### Por que foi criado

O projeto já possuía `pipeline-prd.yml` (deploy em produção).
Foi solicitado criar uma pipeline equivalente para o ambiente **DEV** com:
- Testes de pacotes (`npm audit`)
- Verificação de links (`linkinator`)
- Deploy automático na URL `https://josenilto.github.io/dev`

---

## 📋 Visão Geral da Pipeline

Pipeline de CI/CD para o ambiente de desenvolvimento do portfólio `josenilto.github.io`.
Executa em todo push na branch `dev`, valida qualidade do código e publica
o site na subpasta `/dev` do GitHub Pages via branch `gh-pages`.

**Stack do projeto:** Vite 6 · React 18 · TypeScript 5 · Tailwind CSS 3 · shadcn/ui

---

## ⚡ Gatilhos (Triggers)

| Evento | Condição |
|--------|----------|
| `push` | branch `dev` |
| `pull_request` | branch `dev` |
| `workflow_dispatch` | Manual — parâmetro `skip_link_check: true` disponível |

---

## 🗺️ Fluxo dos Jobs

```
push dev
    │
    ▼
┌─────────────────────────────────────────────┐
│  JOB 1 — 🔍 Auditoria de Pacotes            │
│  npm audit --audit-level=moderate            │
│  → bloqueia moderate / high / critical       │
└──────────────────────┬──────────────────────┘
                       │ needs: audit
                       ▼
┌─────────────────────────────────────────────┐
│  JOB 2 — 🔨 Lint & Build (modo dev)         │
│  npm run lint                                │
│  npm run build:dev -- --base /dev/           │
│  → artefato dist-dev (retenção 1 dia)        │
└──────────────────────┬──────────────────────┘
                       │ needs: build
                       ▼
┌─────────────────────────────────────────────┐
│  JOB 3 — 🔗 Verificação de Links            │
│  linkinator index.html + dev/dist/           │
│  → todos os erros são ⚠️ avisos              │
│  → nunca bloqueia o deploy                   │
└──────────────────────┬──────────────────────┘
                       │ needs: build + link-check
                       ▼
┌─────────────────────────────────────────────┐
│  JOB 4 — 🌐 Deploy /dev (automático)        │
│  peaceiris/actions-gh-pages@v4               │
│  gh-pages branch → destination_dir: dev      │
│  URL: https://josenilto.github.io/dev        │
└─────────────────────────────────────────────┘
```

---

## 🔍 JOB 1 — Auditoria de Pacotes

**Working directory:** `dev/`
**Nível:** `moderate` — mais rigoroso que o PRD (`high`), detecta problemas cedo

| Etapa | Comando | Comportamento |
|-------|---------|---------------|
| Instalar | `npm ci` | Cache por `dev/package-lock.json` |
| Segurança | `npm audit --audit-level=moderate` | ❌ Bloqueia se `moderate`, `high` ou `critical` |
| Outdated | `npm outdated \|\| true` | ⚠️ Informativo, não bloqueia |
| Resumo | `npm list --depth=0` | Listagem no Step Summary do Actions |

> **Decisão:** usar `moderate` em DEV (vs `high` no PRD) permite pegar
> vulnerabilidades médias antes que cheguem à produção.

---

## 🔨 JOB 2 — Lint & Build (modo development)

**Working directory:** `dev/`

| Etapa | Comando | Comportamento |
|-------|---------|---------------|
| Instalar | `npm ci` | Cache via `actions/setup-node` |
| Lint | `npm run lint` | ESLint — ❌ bloqueia se houver erros |
| Build | `npm run build:dev -- --base /dev/` | ❌ bloqueia se falhar |
| Artefato | `actions/upload-artifact@v4` | `dist-dev`, retido **1 dia** |

### Por que `--base /dev/`?

Sem esta flag, o Vite gera assets apontando para `/`:

```html
<!-- ❌ sem --base: aponta para raiz — quebra em /dev -->
<script src="/assets/index-abc123.js"></script>

<!-- ✅ com --base /dev/: aponta para subpasta correta -->
<script src="/dev/assets/index-abc123.js"></script>
```

### Diferença entre os scripts de build

| Script | Comando Vite | Quando usar |
|--------|-------------|-------------|
| `build` | `vite build` | PRD — produção, minificado, otimizado |
| `build:dev` | `vite build --mode development` | DEV — source maps, logs de debug |

---

## 🔗 JOB 3 — Verificação de Links (permissivo)

Em DEV **todos os erros de link são avisos** — nunca bloqueiam o deploy.

| Alvo | O que verifica | Bloqueia? |
|------|----------------|-----------|
| `index.html` — links locais | `./assets/`, `./js/`, `./css/` | ⚠️ Aviso |
| `index.html` — links externos | GitHub, LinkedIn, YouTube... | ⚠️ Aviso |
| `dev/dist/` — links locais | Build React local | ⚠️ Aviso |
| `dev/dist/` — links externos | Links no React compilado | ⚠️ Aviso |

### Links ignorados (todos os ambientes)

```
api.whatsapp.com       → requer autenticação / rate-limit
josenilto.slack.com    → requer autenticação
web.telegram.org       → requer autenticação
unpkg.com              → CDN — verificado pelo PRD
cdn.jsdelivr.net       → CDN — verificado pelo PRD
cdnjs.cloudflare.com   → CDN — verificado pelo PRD
```

> **Filosofia DEV:** iteração rápida > rigor de links.
> Problemas são reportados no Step Summary para análise,
> mas não impedem o deploy de chegar ao ambiente de teste.

---

## 🌐 JOB 4 — Deploy GitHub Pages (`/dev`)

| Campo | Valor |
|-------|-------|
| Action | `peaceiris/actions-gh-pages@v4` |
| Branch destino | `gh-pages` |
| Subpasta | `dev/` |
| URL pública | `https://josenilto.github.io/dev` |
| React app | `https://josenilto.github.io/dev/app` |
| Deploy gate | Automático (sem aprovação manual) |
| Permissão | `contents: write` |

### Estrutura publicada no `gh-pages` branch

```
gh-pages/
├── (raiz — gerenciada pelo pipeline-prd.yml)
│   ├── index.html
│   └── assets/
│
└── dev/                          ← publicado pelo pipeline-dev.yml
    ├── index.html                ← portfólio estático
    ├── assets/
    │   ├── css/styles.css
    │   ├── img/profile-josenilto.webp
    │   ├── img/computador.webp
    │   ├── js/main.js
    │   └── fonts/
    └── app/                      ← React app (modo dev, --base /dev/)
        ├── index.html
        └── assets/
            ├── index-[hash].js   ← prefixo /dev/ nos imports
            └── index-[hash].css
```

### `keep_files: true` — coexistência com outros ambientes

```yaml
keep_files: true
```

Sem esta opção, cada deploy limparia o branch `gh-pages` inteiro,
apagando os arquivos da raiz (PRD) ou de `/hmg` (futuro pipeline HMG).
Com `keep_files: true`, apenas a pasta `/dev` é atualizada.

---

## 🔀 DEV × PRD — Comparação completa

| Aspecto | 🛠️ DEV | 🚀 PRD |
|---------|--------|--------|
| **Arquivo** | `pipeline-dev.yml` | `pipeline-prd.yml` |
| **Branch trigger** | `dev` | `prd`, `master`, `main` |
| **Auditoria** | `--audit-level=moderate` | `--audit-level=high` |
| **Build script** | `build:dev -- --base /dev/` | `build` |
| **Build mode** | `development` | `production` |
| **Base path** | `/dev/` | `/` |
| **Links locais** | ⚠️ Aviso | ❌ Bloqueia |
| **Links externos** | ⚠️ Aviso | ⚠️ Aviso |
| **Deploy action** | `peaceiris/actions-gh-pages@v4` | `actions/deploy-pages@v4` |
| **Deploy destino** | `gh-pages` branch `/dev/` | GitHub Pages API → `/` |
| **Cancel in-progress** | ✅ Sim | ❌ Não |
| **Aprovação manual** | ❌ Não | ✅ Opcional |
| **Retenção artefato** | 1 dia | 3 dias |
| **URL** | `josenilto.github.io/dev` | `josenilto.github.io` |

---

## ⚙️ Configurações necessárias no GitHub

### 1. GitHub Pages Source → `gh-pages` branch

```
Repositório → Settings → Pages
  Source  →  "Deploy from a branch"
  Branch  →  gh-pages
  Folder  →  / (root)
```

> ⚠️ O `pipeline-prd.yml` usa `actions/deploy-pages@v4` (Pages API).
> Para os dois pipelines coexistirem sem conflito, o PRD também deve
> migrar para `peaceiris/actions-gh-pages@v4` publicando na raiz do `gh-pages`.

### 2. Permissões do workflow

```
Repositório → Settings → Actions → General
  Workflow permissions → "Read and write permissions" ✅
```

### 3. Environment `dev`

```
Repositório → Settings → Environments → New environment
  Nome: dev
  (sem reviewers — deploy automático)
```

---

## 🔒 Concurrency

```yaml
concurrency:
  group: pipeline-dev-${{ github.ref }}
  cancel-in-progress: true
```

- Pushes rápidos na branch `dev` cancelam automaticamente a run anterior
- Garante que apenas o estado mais recente é deployado
- Economiza minutos do GitHub Actions

---

## 📦 Variáveis de ambiente globais

```yaml
env:
  NODE_VERSION: '20'               # Node LTS
  DEPLOY_PATH: 'dev'               # subpasta no gh-pages
  SITE_URL: 'https://josenilto.github.io/dev'
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'  # obrigatório jun/2026
```

---

## 🛠️ Troubleshooting

### Assets com 404 após deploy

**Causa:** Build sem `--base /dev/` — assets apontam para `/` em vez de `/dev/`.
**Solução:** Confirmar que o step de build contém `-- --base /dev/`.

### Deploy não aparece em `/dev`

**Causa:** Pages source configurado para "GitHub Actions" em vez de `gh-pages` branch.
**Solução:** `Settings → Pages → Source → Deploy from a branch → gh-pages`.

### `peaceiris/actions-gh-pages` falha com 403

**Causa:** Token sem permissão de escrita.
**Solução:** `Settings → Actions → General → Read and write permissions`.

### Deploy DEV sobrescreve arquivos PRD

**Causa:** `keep_files: false` (padrão).
**Solução:** Confirmar `keep_files: true` no step de deploy.

### Link check bloqueando o deploy

**Causa:** Algum step de link-check sem `continue-on-error: true`.
**Solução:** Todos os steps do JOB 3 em DEV têm `continue-on-error: true`.

---

## 🔗 Referências

| Recurso | Link |
|---------|------|
| Documentação PRD | [`docs/pipeline-prd.md`](./pipeline-prd.md) |
| Workflow DEV | [`.github/workflows/pipeline-dev.yml`](../.github/workflows/pipeline-dev.yml) |
| Workflow PRD | [`.github/workflows/pipeline-prd.yml`](../.github/workflows/pipeline-prd.yml) |
| peaceiris/actions-gh-pages | https://github.com/peaceiris/actions-gh-pages |
| Vite `--base` docs | https://vitejs.dev/config/shared-options.html#base |
| linkinator | https://github.com/JustinBeckwith/linkinator |
| GitHub Pages Environments | https://docs.github.com/en/pages |

---

*Documentação gerada em 2026-05-27 por Claude Code (claude-sonnet-4-6).*
