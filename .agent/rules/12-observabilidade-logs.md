---
description: Regra de Registro de Erros, Telemetria e Tracing
---

# Observabilidade e Logs Estruturados

Um sistema SaaS complexo não sobrevive a `console.log("deu erro")`.

## Princípios
1. **Nunca Engolir Exceções:** Jamais use um bloco `try-catch` sem logar o erro com contexto completo (Payload da requisição, User ID, Stack trace).
2. **Logs Estruturados:** Prefira sempre logs no formato JSON puro (`pino`, `winston`) do que logs de string concatenada.
3. **Traceability (Rastreabilidade):** Toda série de operações de uma requisição deve compartilhar um `correlation_id` ou `request_id` para fins investigativos.
4. **Níveis Corretos:** 
   - `error`: Falhas que quebram a experiência e o time precisa olhar AGORA.
   - `warn`: Cenários que o sistema recuperou ou uso indevido que deve ser acompanhado.
   - `info`: Marcos importantes do fluxo de negócios (ex: "Assinatura ativada").

## Padrão Esperado
O Agente sempre construirá *Catch blocks* que formatam o erro corretamente para sistemas como Sentry, passando a mensagem amigável para o cliente HTTP e omitindo detalhes sensíveis (stack trace) em produção.
