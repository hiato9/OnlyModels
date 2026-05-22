---
description: Como auditar gargalos do prisma e queries N+1 do banco.
---

# Workflow: Auditoria de Performance do Prisma

Ative este workflow antes de finalização de features de grande busca ou relatórios.

1. **Revisão de Loops de Negócio:**
   Leia o Service responsável por varrer uma lista de itens. Se houver um comando do Banco ou de serviço de terceiros dento do `forEach`, `map` ou laço de repetição, pare e corrija imediatamente utilizando `in, chunking`, `Promise.all` ou DB Views.
2. **Análise de Inclusão (`include` vs `select`):**
   Varra o esquema para checar se o `prisma.model.find` pode ser otimizado apenas puxando `select` em vez de carregar relações inteiras do array (`include`).
3. **Índices do Prisma Schema:**
   Se as colunas principais de Where não forem PRIMARY ou UNIQUE, avalie sugerir a inserção de `@@index([campo1, campo2])` no Prisma Schema para o usuário.
4. **Relatório Visual:** Informe como o tempo assintótico foi suprimido e os ganhos matematicos da substituição.
5. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` com tag ⚡ Performance, descrevendo as queries otimizadas e índices adicionados no `CHANGELOG.md`.
