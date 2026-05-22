---
description: Regras de Modularização e Limites de Arquivo
---
# Regras de Modularização
- **Limites de Linhas:** Nenhum arquivo deve ultrapassar 200-300 linhas. Caso isso ocorra, identifique responsabilidades que podem ser extraídas para outros componentes, hooks ou utils.
- **Responsabilidade Única:** Cada módulo, classe ou arquivo deve fazer apenas uma coisa e fazê-la bem.
- **Separação de Preocupações:** Mantenha a camada de rede (rotas/controllers), a regra de negócio (services/use cases) e o acesso a dados (repositories/DAOs) estritamente separados. O frontend deve isolar chamadas de API dos da camada de apresentação (React).
