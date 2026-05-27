# 🛠️ Pipeline → josenilto-dev.github.io

> **Workflow:** `.github/workflows/pipeline-josenilto-dev.yml`
> **Documentação relacionada:** [`docs/pipeline-dev.md`](./pipeline-dev.md) · [`docs/pipeline-prd.md`](./pipeline-prd.md)
> **Data:** 2026-05-27
> **Autor:** Josenilto L da Silva

---

## 📌 Objetivo

Publicar a branch `dev` em um domínio independente:

| Ambiente | URL | Branch origem | Branch destino |
|----------|-----|---------------|----------------|
| PRD | `https://josenilto.github.io` | `prd` | GitHub Pages API |
| DEV (subpasta) | `https://josenilto.github.io/dev` | `dev` | `gh-pages/dev/` |
| **DEV (domínio próprio)** | **`https://josenilto-dev.github.io`** | **`dev`** | **`josenilto-dev.github.io gh-pages`** |

---

## 🏗️ Arquitetura

```
Repositório ORIGEM                   Repositório DESTINO
josenilto/josenilto.github.io        josenilto-dev/josenilto-dev.github.io
branch: dev                          branch: gh-pages
         │                                    │
         │   pipeline-josenilto-dev.yml        │
         │   (PAT: DEV_DEPLOY_TOKEN)           │
         └──────────────────────────────────→  ├── index.html   (portfólio estático)
                                               ├── assets/      (CSS, JS, imagens)
                                               └── app/         (React app compilada)
```

### URLs resultantes

| Conteúdo | URL |
|----------|-----|
| Portfólio estático | `https://josenilto-dev.github.io` |
| App React (modo dev) | `https://josenilto-dev.github.io/app` |

---

## ⚙️ Configuração Inicial (única vez — passos manuais)

### 1. Criar Organização GitHub `josenilto-dev`

```
https://github.com/organizations/new
  Nome: josenilto-dev
  Plano: Free
```

> ✅ Organizações são gratuitas no GitHub.

### 2. Criar repositório `josenilto-dev.github.io`

```
https://github.com/organizations/josenilto-dev/repositories/new
  Nome:       josenilto-dev.github.io
  Visibilidade: Public
  (não inicializar com README)
```

### 3. Ativar GitHub Pages no repositório destino

```
josenilto-dev/josenilto-dev.github.io
  → Settings → Pages
  → Source: "Deploy from a branch"
  → Branch: gh-pages
  → Folder: / (root)
```

> ⚠️ A branch `gh-pages` será criada automaticamente pelo primeiro deploy.
> Antes do primeiro deploy, essa opção pode não aparecer — configure depois.

### 4. Criar Personal Access Token (PAT)

```
https://github.com/settings/tokens/new
  Note: DEV Deploy Token - josenilto-dev.github.io
  Expiration: No expiration (ou 1 ano)
  Scopes:
    ✅ repo (acesso completo — necessário para push no repo da org)
```

> Copie o token gerado — ele aparece apenas uma vez.

### 5. Adicionar secret no repositório ORIGEM

```
josenilto/josenilto.github.io
  → Settings → Secrets and variables → Actions → New repository secret
  → Name:  DEV_DEPLOY_TOKEN
  → Value: <cole o PAT>
```

### 6. Permissões da Organização (se necessário)

```
josenilto-dev (Organização)
  → Settings → Member privileges
  → Base permissions: Write (ou garanta que josenilto é membro Admin)
```

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
│  npm run build:dev -- --base /app/           │
│  → artefato dist-josenilto-dev (1 dia)       │
└──────────────────────┬──────────────────────┘
                       │ needs: build
                       ▼
┌─────────────────────────────────────────────┐
│  JOB 3 — 🔗 Verificação de Links            │
│  → todos os erros são ⚠️ avisos              │
│  → nunca bloqueia o deploy                   │
└──────────────────────┬──────────────────────┘
                       │ needs: build + link-check
                       ▼
┌─────────────────────────────────────────────┐
│  JOB 4 — 🌐 Deploy josenilto-dev.github.io  │
│  peaceiris/actions-gh-pages@v4               │
│  external_repository: josenilto-dev/...      │
│  personal_token: DEV_DEPLOY_TOKEN            │
│  URL: https://josenilto-dev.github.io        │
└─────────────────────────────────────────────┘
```

---

## 🔨 JOB 2 — Por que `--base /app/`?

A React app é publicada em `/app/` na raiz do site. O `--base /app/` garante que os assets apontem para o caminho correto:

```html
<!-- ❌ sem --base: aponta para raiz — quebra em /app -->
<script src="/assets/index-abc123.js"></script>

<!-- ✅ com --base /app/: aponta para subpasta correta -->
<script src="/app/assets/index-abc123.js"></script>
```

**Diferença entre os pipelines DEV:**

| Pipeline | Base path | URL da App |
|----------|-----------|------------|
| `pipeline-dev.yml` | `/dev/` | `josenilto.github.io/dev` |
| `pipeline-josenilto-dev.yml` | `/app/` | `josenilto-dev.github.io/app` |

---

## 🌐 JOB 4 — Deploy Externo

| Campo | Valor |
|-------|-------|
| Action | `peaceiris/actions-gh-pages@v4` |
| Token | `DEV_DEPLOY_TOKEN` (PAT) |
| Repositório destino | `josenilto-dev/josenilto-dev.github.io` |
| Branch destino | `gh-pages` |
| URL pública | `https://josenilto-dev.github.io` |
| App React | `https://josenilto-dev.github.io/app` |
| Deploy gate | Automático (sem aprovação manual) |

### Estrutura publicada no repositório destino

```
josenilto-dev/josenilto-dev.github.io  (branch: gh-pages)
├── index.html                ← portfólio estático
├── assets/
│   ├── css/styles.css
│   ├── img/profile-josenilto.webp
│   ├── img/computador.webp
│   ├── js/main.js
│   └── fonts/
└── app/                      ← React app (modo dev, --base /app/)
    ├── index.html
    └── assets/
        ├── index-[hash].js   ← prefixo /app/ nos imports
        └── index-[hash].css
```

---

## 🔀 Comparação dos três ambientes

| Aspecto | 🛠️ DEV (subpasta) | 🛠️ DEV (domínio) | 🚀 PRD |
|---------|-------------------|------------------|--------|
| **Workflow** | `pipeline-dev.yml` | `pipeline-josenilto-dev.yml` | `pipeline-prd.yml` |
| **Branch trigger** | `dev` | `dev` | `prd` |
| **URL** | `josenilto.github.io/dev` | `josenilto-dev.github.io` | `josenilto.github.io` |
| **Base path React** | `/dev/` | `/app/` | `/` |
| **Build mode** | `development` | `development` | `production` |
| **Token** | `GITHUB_TOKEN` | `DEV_DEPLOY_TOKEN` (PAT) | `GITHUB_TOKEN` |
| **Repo destino** | mesmo repo (gh-pages) | `josenilto-dev/josenilto-dev.github.io` | mesmo repo |
| **Auditoria** | `moderate` | `moderate` | `high` |
| **Erros de link** | ⚠️ Aviso | ⚠️ Aviso | ❌ Bloqueia (local) |
| **Aprovação manual** | ❌ | ❌ | ✅ Opcional |

---

## 🛠️ Troubleshooting

### Deploy falha com `Error: Not Found` (404)

**Causa:** Repositório `josenilto-dev/josenilto-dev.github.io` não existe ou o PAT não tem acesso.
**Solução:**
1. Verificar se o repositório foi criado
2. Verificar se o PAT tem escopo `repo`
3. Verificar se `josenilto` tem acesso de escrita na org `josenilto-dev`

### Deploy falha com `Error: 403 Forbidden`

**Causa:** PAT sem permissão de escrita no repositório destino.
**Solução:** Regenerar o PAT com escopo `repo` completo e atualizar o secret `DEV_DEPLOY_TOKEN`.

### Assets com 404 após deploy (`/assets/index-abc.js` não encontrado)

**Causa:** Build sem `--base /app/` — assets apontam para `/` em vez de `/app/`.
**Solução:** Confirmar que o step de build contém `-- --base /app/`.

### Site não aparece em `josenilto-dev.github.io`

**Causa:** GitHub Pages não está ativado no repo destino.
**Solução:**
```
josenilto-dev/josenilto-dev.github.io
  → Settings → Pages → Source → Deploy from a branch
  → Branch: gh-pages
```

### Primeiro deploy: branch `gh-pages` não existe

**Causa:** `peaceiris/actions-gh-pages` cria automaticamente a branch `gh-pages`.
**Solução:** Executar o workflow uma vez — a branch é criada no primeiro push.
Só depois configurar GitHub Pages no repo destino.

### `DEV_DEPLOY_TOKEN` expired

**Causa:** PAT expirou.
**Solução:**
1. `github.com/settings/tokens` → regenerar o token
2. Atualizar o secret `DEV_DEPLOY_TOKEN` no repo origem

---

## 🔒 Segurança do PAT

O `DEV_DEPLOY_TOKEN` é um Personal Access Token com acesso de escrita ao repositório destino. Boas práticas:

- **Não logar o token** — o GitHub Actions já o mascara automaticamente
- **Rotacionar periodicamente** — defina expiração de 1 ano
- **Escopo mínimo** — use apenas `repo` (evite `admin:org`, `delete_repo`, etc.)
- **Secret apenas no repo origem** — nunca expor no código

---

## 📋 Checklist de implantação

```
□ 1. Organização josenilto-dev criada no GitHub
□ 2. Repositório josenilto-dev.github.io criado (público)
□ 3. PAT criado com escopo repo
□ 4. Secret DEV_DEPLOY_TOKEN adicionado no repo origem
□ 5. Workflow pipeline-josenilto-dev.yml commitado na branch prd
□ 6. Primeiro push na branch dev → workflow executa
□ 7. GitHub Pages ativado no repo destino (gh-pages branch)
□ 8. Verificar https://josenilto-dev.github.io (aguardar ~2 min)
□ 9. Verificar https://josenilto-dev.github.io/app (React app)
```

---

## 🔗 Referências

| Recurso | Link |
|---------|------|
| Workflow | [`.github/workflows/pipeline-josenilto-dev.yml`](../.github/workflows/pipeline-josenilto-dev.yml) |
| Pipeline DEV (subpasta) | [`docs/pipeline-dev.md`](./pipeline-dev.md) |
| Pipeline PRD | [`docs/pipeline-prd.md`](./pipeline-prd.md) |
| peaceiris/actions-gh-pages | https://github.com/peaceiris/actions-gh-pages |
| GitHub — Criar Organização | https://github.com/organizations/new |
| GitHub — Personal Access Tokens | https://github.com/settings/tokens/new |
| Vite `--base` docs | https://vitejs.dev/config/shared-options.html#base |

---

*Documentação gerada em 2026-05-27 por Claude Code (claude-sonnet-4-6).*
