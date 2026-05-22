---
description: Procedimento para criar Front-End Premium React e SaaS level.
---

# Workflow: Elaborando UI Premium (UX de Alto Nível)

Não crie páginas web com HTML crú dos anos 90 ou cores estáticas e sólidas sem refinamento tátil. Mantenha os níveis estéticos altíssimos.

1. **Uso de Design System:**
   Entenda os tokens da aplicação. Se não houver Tailwind ou CSS variáveis, assuma um design visual consistente (fontes modernas como Inter/Outfit, border radios uniformes, paleta de cor secundária de background/border sutil vs cor primária brand, backgrounds suaves #FAFAFA, Dark Mode em #1A1A1A).
2. **Transições de Feedback Constantes:**
   Todos os botões desenvolvidos necessitam de `.btn { transition: all 0.2s }` e mudança de hover para mostrar interatividade, mais estados como ":disabled" opacos. Não devolva código "jogado".
3. **Microinterações:**
   Implemente Skeletons para áreas de busca, para não pular Layout (Refluxo de Render).
4. **Sem Componentes Espaguetes:**
   Se a div chegou na indentação nível 5 ou 6, pause, e abstraia aquele miolo num micro-componente (E.g. `<UserSidebarStatus />`).
5. **Ergonomic e Responsividade Default:**
   Garanta no CSS que grid e flex layouts façam colapso correto para telas min-640px de celulares.
6. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando os componentes criados e páginas estilizadas no `CHANGELOG.md`.
