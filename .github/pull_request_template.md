## Descrição

<!-- O que essa PR faz? Por que é necessário? -->

## Tipo de mudança

- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Correção de segurança / CVE
- [ ] Refatoração / limpeza
- [ ] CI/CD / infra
- [ ] Documentação

## Checklist

### Geral
- [ ] Testei localmente com `docker compose up --build`
- [ ] Não há secrets ou credenciais no código

### Docker / Infra (se aplicável)
- [ ] `docker build` finaliza sem erros
- [ ] Health-check responde 200 em `/health`
- [ ] Portfólio acessível em `http://localhost:8080/`
- [ ] React app acessível em `http://localhost:8080/app/`

### Segurança (se aplicável)
- [ ] CVEs novos foram avaliados e documentados em `.trivyignore` / `vex.json`
- [ ] Nenhum segredo novo sem gestão via GitHub Secrets
- [ ] Headers de segurança nginx não foram removidos

### CI/CD (se aplicável)
- [ ] Pipeline `pipeline-prd.yml` passa localmente (lint + build)
- [ ] Workflow `docker-build.yml` não quebra em dry-run

## Evidência / Screenshots

<!-- Print ou log do teste local -->
