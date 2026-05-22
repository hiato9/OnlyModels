---
description: Lidando com Mutações Monstruosas de Arquivos Pesados
---
# Como Refatorar e Quebrar Arquivos Massivos
> **Regra Matriz**: Se passa de 200/300 linhas, é hora de agir.

1. Identifique os escopos do arquivo. É um Component UI contendo muita lógica? Ou é um Backend Service com manipulação violenta de dados?
2. **Corte Lateral (Utilidades Puras)**: Tudo que serve apenas pra mapeamento de dado, sanitização ou pequenas condições repetitivas crie o arquivo vizinho `[Name].utils.ts` e despache pra lá.
3. **Corte Lógico (Abstração Cérebro)**: Extraia manipulações complexas exclusivas num sub-módulo interno, como Custom Hooks para frontends, ou subclasses / functions em injeção pra backend.
4. Transforme seu arquivo matriz que era gigantesco, num poderoso Orquestrador elegante.
5. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando a refatoração com tag 🔄 no `CHANGELOG.md`, citando o arquivo original e os novos arquivos extraídos.
