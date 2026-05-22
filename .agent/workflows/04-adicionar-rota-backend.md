---
description: Rota Node Backend Sem Dor-de-Cabeça
---
# Criando uma Endpoint/Rota Nova
1. Projete com segurança: Defina primeiro o que a Rota *recebe* e *cospe*, monte seu Input Schema (Zod Schema ou similar).
2. Escreva testes do Service, a pura Regra de Negócio desacoplada sem ter ideia sobre requests e responses do servidor HTTP.
3. Crie os Controles que pegam o body providenciado pelo framework, jogam na validação estrita, e passam os dados purificados em TypeScript para nosso Cérebro de Domínio (Service).
4. Acople perfeitamente na sua camada indexadora de rotas da aplicação (Router, Api Gateway).
5. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` documentando a rota criada, seu controller, service, e schema de validação no `CHANGELOG.md`.
