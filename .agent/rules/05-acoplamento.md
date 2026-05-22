---
description: Baixo Acoplamento e Inversão de Dependência
---
# Acoplamento
- **Inversão e Injeção de Dependências:** Componentes de alto nível (Lógica de Negócios) não devem criar ou instanciar dependências base (como Bancos ou APIs externas). Repasse esses módulos via construtores, parâmetros ou Contexts.
- **Isolamento de Integrações Externas:** Encapsule chamadas para APIs de terceiros (Stripe, Twilio, OpenAI) dentro de adaptadores sob interfaces que seu sistema dita. Se o Stripe mudar a API deles hoje, apenas UM ÚNICO arquivo do projeto deve ser modificado (o Adapter).
