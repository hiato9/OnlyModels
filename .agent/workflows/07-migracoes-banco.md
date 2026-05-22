---
description: Regras Inflexíveis de Atualização de Esquema do Banco de Dados
---
# Fluxo de Integridade nos Databases
1. Trate Arquivos Antigos de Migration como sagrados e cimentados. Qualquer nova mudança nunca deve tocar neles. Eles já foram aplicados e são parte da história mundial do seu schema.
2. Planeje antes de alterar esquemas. Criar novas restrições pode esmagar os dados do atual ambiente de produção ou corrompê-los integralmente.
// turbo
3. Gere o script e nova migração e assegure-se de aplicar usando apenas os scripts CLI formais (ex. `npx prisma migrate dev` e `deploy` na subida).
4. No instante que o Banco de Banco for sincronizado, recompile todas os bindings (Geradores de ORM) para quebrar o Typescript assim que uma query relacional estiver deficiente baseada na atualização.
5. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando a migração com nome exato, alterações de schema, e impacto nas tabelas no `CHANGELOG.md`.
