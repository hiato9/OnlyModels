---
description: Fluxo Básico de Criação de Feature (End-to-End)
---
# Como Criar uma Nova Feature Intergrada
1. **Modelagem & Banco:** Comece construindo os Models e schemas necessários de dados (Ex: Prisma Schema, Mongoose, SQL).
// turbo
2. Execute a migração via script.
3. **Casca do Backend:** Crie os Endpoints, e a Validação Inicial utilizando o framework de tipagem.
4. **Cérebro de Domínio:** Inicie o Service/Use-case contendo em si a integridade das operações e regras.
5. **Tipagem Externa Frontend:** Espelhe ou extraia em pacote os schemas da API para uso do sistema Client e React.
6. **Integração UI Frontend:** Escreva Hooks otimistas usando as devidas ferramentas e integre-os à UI principal.
7. **📋 OBRIGATÓRIO — Registrar no Changelog:** Ao concluir, execute o workflow `/16-atualizar-changelog` registrando TODOS os arquivos criados/alterados no `CHANGELOG.md`. Sem essa etapa a task NÃO está concluída.
