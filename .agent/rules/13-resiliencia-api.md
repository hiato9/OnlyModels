---
description: Design à Prova de Falhas (Resiliência)
---

# Resiliência de APIs e Tratamento de Falhas Focados no SaaS

No nível Enterprise SaaS (Especialmente no Gateway de Pagamentos), o mundo externo **vai** falhar.

## Princípios
1. **Idempotência Suprema:** Toda rota transacional (cobrar, criar assinatura, processar webhook) DEVE ser feita de forma que ser chamada com os mesmos dados N vezes produza o mesmo resultado sem efeitos colaterais multiplicados (ex: gerar duas faturas em vez de uma).
2. **Timeouts Inegociáveis:** Nenhum `axios.get` ou conexão externa no sistema roda sem um Timeout explícito configurado (máx. 5s a 15s dependendo do caso).
3. **Retries com Backoff:** Se uma chamada a terceiro falhar (ex: envio de email, webhook), prever retries com Exponential Backoff ou jogar para filas (RabbitMQ/BullMQ/Redis) e nunca bloquear o client-side na espera.
4. **Circuit Breaking:** Ter noção de quando um recurso externo está sobrecarregado e parar de sobrecarregá-lo imediatamente, retornando "Service Unavailable" limpo via padrão Fail-Fast.

## Padrão Esperado
Sempre que for sugerido o uso de chamadas de rede API a terceiros pelo Agent, o Agent fará isso pensando ativamente: *"E se esse serviço falhar? Como o sistema Solitary Telescope lida com a inconsistência parcial?"*
