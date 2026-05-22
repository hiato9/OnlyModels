---
description: Código Focado na Alta Testabilidade
---
# Testabilidade
- **Funções Puras são Príncipes:** Sempre que a lógica apresentar complexidade calculística, desvincule-a de estados de Banco de Dados ou Framework e coloque-a numa função pura externa.
- **Ocultação de Dependências Globais:** Evite o acesso aleatório de objetos globais (`window`, `localStorage`, `process.env`) direto nas funções. Repasse como parâmetros para viabilizar testes ou zombarias (mocking).
- **Caixa Preta:** Em testes, verifique comportamentos de saída de acordo com a entrada, e jamais espelhe e acople o teste em cima do comportamento do código de fato.
