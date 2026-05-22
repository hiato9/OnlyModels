---
description: Regra de Performance e Otimização de Banco de Dados
---

# Performance e Consulta de Banco de Dados (Prisma)

No nível Enterprise SaaS, o banco de dados é o gargalo mais comum.

## Princípios
1. **Zero N+1 Queries:** Ao buscar listas (ex: `findMany`), nunca itere sobre os resultados para buscar relações adicionais linha a linha em um loop. Utilize estritamente `include` ou `select` do Prisma.
2. **Selects Explícitos:** Não traga todas as colunas se você precisa de apenas duas. O uso de `select: { id: true, name: true }` reduz drasticamente o tráfego de rede e uso de memória.
3. **Paginação Obrigatória:** Qualquer rota que retorne uma coleção de itens deve ter `limit` / `take` e `offset` / `skip` obrigatoriamente.
4. **Índices Precisos:** Caso crie uma feature que busque itens frequentemente por uma coluna específica (ex: buscar um User por `stripe_customer_id`), deve-se pensar e sugerir a adição de `@index` no `schema.prisma`.

## Padrão Esperado
Antes de propor ou fazer o commit de uma operação complexa com o BD, o agente deve justificar por que aquela estratégia de acesso a dados escala mesmo se houverem 1.000.000 de registros na respectiva tabela.
