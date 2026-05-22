---
description: Construindo webhooks, pagamentos e APIs inquebráveis.
---

# Workflow: Implementação Resiliente (Pagamentos & Gateways)

Fundamental para qualquer recurso Financeiro.

1. **Design de Idempotência:**
   Se um front-end ou webhook der Retry em uma rota POST com as mesmas cargas úteis, sua rota não pode criar dados em dobro. Você deve identificar uma Transaction ID no corpo ou gerar um Idempotency-Key.
   Verificar primeiro: `Opa, este TX_ID já existe? Se sim, retorne 200/OK imediatamente e não rode de novo.`
2. **Estratégia Retry-Catch:**
   Existem recursos cruciais dentro da rota (como Email, Gerar Pix Externo)? Tente envolver falhas disso sem quebrar toda a transação HTTP ou jogar o cliente pra fora, logando o incidente e criando Fallback.
3. **Transação de Banco ACID:**
   Duas inserções fundamentais que precisam existir em conjunto devem sempre estar encapsuladas num `prisma.$transaction()`, evite estados mutilados em produção.
4. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` documentando a implementação resiliente com detalhes de idempotência e retry no `CHANGELOG.md`.
