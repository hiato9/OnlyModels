---
description: Uso Compulsório do TypeScript Strict
---
# Tipagem Estrita
- **Proibição do Qualquer (No Any):** O uso de `any` no ecosisstema é tratado como falha grave. Use `unknown` se o tipo for desconhecido inicialmente, forçando verificação `typeof` após.
- **Contratos Claros (Schemas):** Entenda e defina limites claros usando validadores agressivos (ex: Zod, Valibot) no momento que requisições atingem nossos endpoints, webhooks ou campos de formulário.
- **TypeScript Opcodes:** O arquivo de configuração `tsconfig.json` deve conter `"strict": true`, `"noImplicitAny": true`, e `"strictNullChecks": true` sempre ativos.
