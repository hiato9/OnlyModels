---
description: Como Criar Webhooks Inquebráveis e Fluxos de Compra Financeiros
---
# Integração de Pagamento Segura e Inviolável
1. Centralizar em Arquivos Especializados e Ambientes as Chaves Privadas da Payment API, sem contaminar escopos em tela de interface ou cliente inseguro.
2. No Backend as Informações de Valores (ex: Preço de Produto), jamais devem descer em requisições de FrontEnd feitas pelo visitante visivelmente alteráveis. Mande o Serviço checar os valores no DB.
3. Assinatura de Webhooks precisa ser calculada nos Controllers pra aceitar exclusivamente callbacks legítimos assinados do gateway financeiro.
4. Tráfego Idempotente de DB: Trate duplos acionamentos vindos de Gateways marcando que o Banco já confirmou esse Recibo antes de entregar as Licenças e os Acessos duplamente para o cliente.
5. **📋 OBRIGATÓRIO — Registrar no Changelog:** Execute `/16-atualizar-changelog` registrando a integração de pagamento com detalhes do provider, endpoints, e schema de webhook no `CHANGELOG.md`.
