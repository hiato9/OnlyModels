---
description: Critério de Revisão de Si Mesmo
---
# Fluxo de Code Review Independente 
1. Realize o self-diff e responda e justifique logicamente nas cabeças se resolveu a Task fundamentalmente da melhor forma.
2. Identifique loggers sujos abandonados para debug local e elimine.
3. Garanta nomes impecáveis. É este o momento para dar um find-replace nas funções que você batizou as 2h da manhã.
4. Execute os Tests em paralelo com a build TypeScript total do projeto pra afastar possíveis dependências globais quebradas pelas alterações locais de tipagem.
5. Se assegure de não ter desrespeitado as 10 Leis de Arquitetura do projeto.
6. **📋 Verificação Changelog:** Confirme que TODAS as mudanças da Task atual estão devidamente registradas no `CHANGELOG.md`. Se faltarem entradas, execute `/16-atualizar-changelog` antes de prosseguir.
