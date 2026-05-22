---
description: Prevenção Diacrônica à Erosão Arquitetural Diária do Projeto (Boy Scout Pattern)
---
# Manutenção Corriqueira Constante
1. Ao tocar numa funcionalidade pra correção que você não via a 60 dias e reparar funções ineficazes, arrume logicamente e imediatamente O Ambiente Antes da Operação Final, em pequenos blocos e commits separados de ajuste pra despoluir área.
2. Atualizações profundas e grandes alterações não devem ser atreladas e misturadas as Branchs que criam lógicas singelas novas.
3. Atualização de libs de dependência sempre devem ser lidas minuciosamente em logs pra previenir depreciações e avisar no changelog de seu próprio time qual library precisou de adaptações de syntax nas views da plataforma.
4. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando cada refatoração e atualização de dependência no `CHANGELOG.md`.
