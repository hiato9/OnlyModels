---
description: Princípios de Fatoração e DRY
---
# Princípios de Fatoração
- **DRY (Don't Repeat Yourself):** Identifique padrões de código repetidos e extraia-os para funções utilitárias ou hooks abstratos. Não reescreva a mesma lógica em dois lugares diferentes.
- **Composição sobre Herança:** Use composição para construir objetos e UIs ricas, combinando lógicas menores ao invés de criar árvores de herança complexas.
- **Isolamento de Estado:** Mantenha estados puros separados de efeitos colaterais (side effects). Regras de negócio essenciais devem ser funções puras que apenas recebem e retornam dados.
