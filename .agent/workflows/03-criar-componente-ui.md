---
description: Criação Modular de Componentes para a Interface UI
---
# Estruturando Interface UI Consistente
1. Crie o diretório do seu componente mantendo ele semânticamente num local de Domínio do Front (`/features/` ou pastas genéricas tipo `/components/ui` para primitivos puros).
2. O arquivo principal se chamará `index.tsx` contendo Componente.
3. Comece SEMPRE e primariamente nomeando firmemente sua `interface NomeComponenteProps {}` tipando estritamente.
4. Evite usar classes monolíticas avulsas para estilo, garanta integração com o Padrão do Repositório (seja Tailwind, CSS Modules etc).
5. O componente não deve puxar dados globais. Os receba através dos `Props` para preservar alta adaptabilidade testável da sua UI.
6. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando o novo componente e suas props no `CHANGELOG.md`.
