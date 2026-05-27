# 🚀 Pipeline PRD — Documentação Completa

> **Arquivo:** `.github/workflows/pipeline-prd.yml`
> **Data de criação:** 2026-05-27
> **Projeto:** [josenilto.github.io](https://josenilto.github.io)

---

## 📋 Visão Geral

Pipeline de CI/CD completa para o portfólio pessoal `josenilto.github.io`.
Responsável por auditar pacotes, validar o build, verificar links e realizar o deploy automático no **GitHub Pages (PRD)**.

---

## ⚡ Gatilhos (Triggers)

| Evento | Branch/Condição |
|--------|-----------------|
| `push` | `prd`, `master`, `main` |
| `pull_request` | `prd`, `master`, `main` |
| `workflow_dispatch` | Manual via GitHub Actions UI |

> **Parâmetro manual:** `skip_link_check: true` permite pular a verificação de links (útil em deploys emergenciais).

---

## 🗺️ Fluxo dos Jobs

```
push prd / master / main
           │
           ▼
┌────────────────────────┐
│  JOB 1 — 🔍 Auditoria  │
│       de Pacotes       │
└────────────┬───────────┘
             │ needs: audit
             ▼
┌────────────────────────┐
│  JOB 2 — 🔨 Lint       │
│       & Build          │
└────────────┬───────────┘
             │ needs: build
             ▼
┌────────────────────────┐
│  JOB 3 — 🔗 Link       │
│       Check            │
└────────────┬───────────┘
             │ needs: build + link-check
             ▼
┌────────────────────────┐
│  JOB 4 — 🌐 Deploy     │
│       GitHub Pages PRD │
└────────────────────────┘
```

---

## 🔍 JOB 1 — Auditoria de Pacotes

**Working directory:** `dev/`

| Etapa | Comando | Comportamento |
|-------|---------|---------------|
| Instalar dependências | `npm ci` | Usa `dev/package-lock.json` |
| Auditoria de segurança | `npm audit --audit-level=high` | **Bloqueia** se houver vulnerabilidade `high` ou `critical` |
| Dependências desatualizadas | `npm outdated` | Apenas informativo, não bloqueia |

> **Cache:** `~/.npm` vinculado ao hash do `dev/package-lock.json` — reutilizado entre execuções.

---

## 🔨 JOB 2 — Lint & Build (Vite + React)

**Working directory:** `dev/`

| Etapa | Comando | Comportamento |
|-------|---------|---------------|
| Instalar dependências | `npm ci` | Cache via `actions/setup-node` |
| Lint | `npm run lint` | ESLint — **bloqueia** se houver erros |
| Build de produção | `npm run build` | Vite — gera `dev/dist/` |
| Upload artefato | `actions/upload-artifact@v4` | Salvo como `dist-prd`, retido por 3 dias |

> **Stack:** Vite 6 + React 18 + TypeScript 5 + Tailwind CSS 3 + shadcn/ui

---

## 🔗 JOB 3 — Verificação de Links

Utiliza **[linkinator](https://github.com/JustinBeckwith/linkinator)** para checar todos os links do projeto.

### Escopo de verificação

| Alvo | Tipo | Falha na pipeline? |
|------|------|--------------------|
| `index.html` — links locais (`./assets/`, `./`) | Arquivos locais | ✅ **Sim** |
| `index.html` — links externos (`https://`) | GitHub, LinkedIn, CDN... | ⚠️ Aviso (`continue-on-error`) |
| `dev/dist/` — links locais | Arquivos gerados pelo Vite | ✅ **Sim** |
| `dev/dist/` — links externos | Links no React compilado | ⚠️ Aviso (`continue-on-error`) |

### Links ignorados (externos problemáticos)

```
api.whatsapp.com       → rate-limit e auth
josenilto.slack.com    → requer autenticação
web.telegram.org       → requer autenticação
unpkg.com              → CDN (verificado separadamente)
cdn.jsdelivr.net       → CDN (verificado separadamente)
cdnjs.cloudflare.com   → CDN (verificado separadamente)
```

---

## 🌐 JOB 4 — Deploy GitHub Pages (PRD)

**Ambiente:** `prd` | **URL:** https://josenilto.github.io

### Estrutura publicada

```
_site/                    ← raiz do GitHub Pages
├── index.html            ← portfólio estático principal
├── assets/
│   ├── css/styles.css
│   ├── img/
│   ├── js/
│   └── fonts/
└── app/                  ← React app compilada (futuro)
    ├── index.html
    └── assets/
```

### Etapas do deploy

| Etapa | Action | Descrição |
|-------|--------|-----------|
| Preparar `_site/` | `run` | Copia static + React build |
| Configurar Pages | `actions/configure-pages@v5` | Setup do GitHub Pages |
| Upload artefato | `actions/upload-pages-artifact@v3` | Empacota `_site/` |
| Deploy | `actions/deploy-pages@v4` | Publica no GitHub Pages |

### Permissões necessárias

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Condição de execução

O deploy **só roda** quando:
- Push na branch `prd`, `master` ou `main`
- **OU** execução manual (`workflow_dispatch`)
- **E** o job `build` terminou com sucesso
- **E** o job `link-check` terminou com sucesso **ou foi pulado**

---

## ⚙️ Variáveis de Ambiente

| Variável | Valor | Motivo |
|----------|-------|--------|
| `NODE_VERSION` | `20` | LTS estável |
| `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` | `true` | Obrigatório a partir de junho/2026 |

---

## 🔒 Concurrency (Anti-conflito)

```yaml
concurrency:
  group: pipeline-prd-${{ github.ref }}
  cancel-in-progress: false
```

- Agrupa por branch — evita deploys paralelos na mesma branch
- `cancel-in-progress: false` — garante que o deploy atual sempre termine

---

## 🚫 Workflows Desativados

Os workflows abaixo foram desativados para evitar **conflito de deploy no GitHub Pages**:

| Arquivo | Motivo da desativação |
|---------|----------------------|
| `static.yml` | Fazia deploy do repo inteiro no Pages via `master` |
| `jekyll-gh-pages.yml` | Fazia deploy Jekyll no Pages via `prd` |
| `deploy-ci-cd-v2.yml` | Rodava `npm ci` sem `working-directory: dev/` |

> Os arquivos foram preservados com `[DEPRECATED]` no nome e push automático comentado.
> Ainda podem ser executados manualmente se necessário.

---

## 🛠️ Configuração Necessária no GitHub

### 1. GitHub Pages Source

```
Repositório → Settings → Pages → Source → GitHub Actions
```

### 2. Environment `prd`

```
Repositório → Settings → Environments → New environment → "prd"
```

Opcional: adicionar **Reviewers** para exigir aprovação antes do deploy em produção.

### 3. Secrets (se necessário no futuro)

| Secret | Uso |
|--------|-----|
| `GITHUB_TOKEN` | Automático — já disponível nas Actions |

---

## 📦 Dependências do Projeto (`dev/`)

### Runtime

| Pacote | Versão | Uso |
|--------|--------|-----|
| `react` | `^18.3.1` | UI framework |
| `react-dom` | `^18.3.1` | DOM renderer |
| `react-router-dom` | `^6.30.1` | Roteamento |
| `@tanstack/react-query` | `^5.83.0` | Data fetching |
| `tailwind-merge` | `^2.6.0` | CSS utilitário |
| `lucide-react` | `^0.462.0` | Ícones |
| `zod` | `^3.25.76` | Validação de schema |
| `recharts` | `^2.15.4` | Gráficos |

### DevDependencies

| Pacote | Versão | Uso |
|--------|--------|-----|
| `vite` | `^6.4.2` | Build tool |
| `typescript` | `^5.8.3` | Type checking |
| `eslint` | `^9.32.0` | Linting |
| `tailwindcss` | `^3.4.17` | CSS framework |
| `@vitejs/plugin-react-swc` | `^3.11.0` | React transform |

---

## 📊 Resumo de Gates de Qualidade

```
Código              →  ESLint (sem erros)
Segurança           →  npm audit (sem high/critical)
TypeScript          →  tsc sem erros de tipo
Build               →  vite build bem-sucedido
Links locais        →  nenhum link 404 nos arquivos
Deploy              →  GitHub Pages publicado com sucesso
```

---

*Documentação gerada em 2026-05-27 por Claude Code (claude-sonnet-4-6).*
