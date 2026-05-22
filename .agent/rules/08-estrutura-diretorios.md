---
description: Organização e Diretrizes Estruturais de Diretórios
---
# Estrutura Inteligente de Domínios
- **Agrupamento por Contexto e Feature:** Em um sistema em crescimento, não agrupe tudo por responsabilidades genéricas (`controllers`, `models`, `views`). Migre/Utilize separações de Feature Based Architecture (Arquitetura por Domínio). Ex: A feature de "Authentication" deve ter seus próprios subdiretórios restritos a Controllers, Services, e Utilities nela.
- **Exportações Explícitas (Barrels):** Utilize arquivos `index.ts` propositalmente para construir as barreiras públicas do que deve ser importado daquela feature de fora. Todo o resto no diretório será implementação privada da mesma.
