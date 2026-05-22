---
description: Como escrever, mockar e executar um ciclo de Test-Driven Development.
---

# Workflow: Implementação Otimizada de Testes

Utilize este workflow sempre que for solicitada a prova de funcionamento de código através de testes unitários ou TDD.

1. **Entendimento Automático:**
   Leia o arquivo do Controller ou Service alvo. Entenda suas dependências externas.
2. **Criação do Arquivo de Teste:**
   Crie ou edite o arquivo com o sufixo `*.spec.ts` ou `*.test.ts` ao lado do arquivo sendo testado de acordo com a filosofia do projeto.
3. **Isolamento de Side-Effects (Mocks):**
   Utilize frameworks de mock da library preferida (jest.mock / vitest) para interceptar DB, chamadas APIs, Email Providers.
4. **Casos de Testes Essenciais:**
   - [ ] Caso Esperado (Happy Path) -> Assert que Retorna X e chamou banco 1 vez.
   - [ ] Edge Case Simples -> Null, Strings Vazias, Ids errados.
   - [ ] Caso de Falha da Dependência -> Mockar rejeição de banco ou API e assertar formato de erro correto.
5. **Execução:**
   Sugira ao usuário ou rode no terminal a execução específica deste arquivo para validar verde `npm test -- <caminho da pasta/arquivo>`.
6. **📋 OBRIGATÓRIO — Registrar no Changelog (se houver correções):** Se os testes revelaram bugs que foram corrigidos, execute `/16-atualizar-changelog` com tag 🐛 para os fixes e 📝 para os testes adicionados.
