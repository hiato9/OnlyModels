---
description: Fluxo Estrito e Estado Previsível
---
# Imutabilidade e Estados
- **Prevenção de Mutações Violentas:** Jamais execute mutações diretas em listas (`push`, `splice`, `pop`) ou em objetos dentro de fluxos. Construa um novo espelho de alteração em cima através do Spred operator (`...`), métodos `map`, `filter`, e `reduce` para manter a previsibilidade na ram do Client e Node.
- **Data Flow do React:** Dados fluem invariavelmente pro fundo (Props viajam down) e modificações viajam invariavelmente pra cima (callbacks ativam functions parentais).
