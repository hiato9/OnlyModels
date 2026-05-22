---
description: Metodologia Científica Pró-bugs em Sistemas
---
# Como Caçar e Eliminar Erros Estruturais ou Bugs Mortais
1. **Comprovar Reprodução:** Não altere nenhum arquivo do app antes de garantir o caminho exato e isolado para fazer o erro espocar.
2. **Corte Célere de Investigação:** Adicione os Logs temporários no exato ponto e investigue imediatamente e unicamente se o problema é tipagem de entrada com corrupção ou erro de lógica relacional no corpo principal.
3. **Escudo de Retorno:** Descreva um Teste Automatizado minímo ou script reprodutor. Faça ficar vermelho rodando (Failing state provando o Bug).
4. **Cirurgia Focal:** Aplique a solução que atenda 100% dos cenários corrompidos e rode novamente as proteções do sistema. Elimine lixos que introduziu.
5. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando o bugfix com tag 🐛 no `CHANGELOG.md`, citando o sintoma, a causa raiz, e o arquivo corrigido.
