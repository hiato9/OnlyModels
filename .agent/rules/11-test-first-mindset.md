---
description: Regra Estrita de TDD e Orientação a Testes
---

# Mindset "Test-First" e Qualidade Inegociável

Para atingir nível Enterprise, **código não testado é código não finalizado.**

## Princípios
1. **Regra de Ouro:** Não entregue código funcional sem fornecer as instruções ou arquivos reais para testá-lo automatizadamente.
2. **Mocking e Side-Effects:** Isole efeitos colaterais (banco de dados, APIs externas) usando injeção de dependência e mocks apropriados.
3. **Casos de Borda (Edge Cases):** Sempre teste pelo menos:
   - O "Caminho Feliz".
   - Um cenário de input inválido/incompleto.
   - Um cenário de falha de serviço externo/banco de dados.
4. **Sem Regressões:** Antes de alterar uma lógica de negócio central (ex: cálculo de fatura, lógica de carrinho), o agente DEVE garantir ou sugerir a verificação dos testes existentes.

## Padrão Esperado
Sempre que o usuário pedir uma "nova regra de negócio", o agente deve **proativamente** perguntar ou arquitetar os testes de fluxo para proteger a funcionalidade antes mesmo de o usuário perceber a necessidade.
