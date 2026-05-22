---
description: Como decompor problemas colossais em arquitetura limpa em SaaS.
---

# Workflow: Arquitetura de Feature Complexa (A-Z)

Sempre que a solicitação for ampla demais (Ex: "Crie um módulo inteiro de assinaturas e recorrência"), não jogue tudo no Controller. Adote este workflow.

1. **Separação de Camadas (Domain-Driven Leve):**
   Pense no design e o separe em `routes -> controllers -> interfaces/DTOS -> services -> entities/prisma`.
2. **Projete os Modelos/Dados:**
   Comece sugerindo os modelos do `schema.prisma`. Obtenha aprovação antes de codar a lógica.
3. **Escrita do Serviço Central (Brain):**
   Implemente a regra de negócio num serviço isolado, 100% puro e que apenas recebe strings, IDs ou objetos, processa-os e devolve um output. NADA DE Request/Response do Express ou DB Direto aqui dentro (inverta dependências se for possível).
4. **Integração:**
   Exponha no Controller chamando esse serviço. E então crie as rotas e exporte.
5. **Worker em Segundo Plano (Se for tarefa pesada):**
   O fluxo afeta tempo real da API? Traga pro RabbitMQ ou SetInterval como um *Worker* externo, assim como já faz os workers de abandono e dunning do projeto.
6. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando cada camada criada (models, services, controllers, routes, workers) no `CHANGELOG.md`.
