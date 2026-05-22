---
description: Passos Para Liberação Em Nuvem, CI/CD ou Servidores de Execução
---
# Checklist Frio de Produção Global
1. Tenha todas e restritamente as variáveis de ambientes validadas e apontando pro escopo correto no seu `.env.production`.
2. Garanta a Compilação sem nenhum aviso vital (Typecheck impecável) em `npm build` e certifique de Buildar FrontEnd se ele consumir Envs Globais Estáticas na geração da aplicação SSG/SPA.
3. Proteja os Cronjobs e Fluxos e mantenha logs de acesso se possível pra ter tranquilidade de observar nas 24h as OOM (Out Of Memory problems) iniciais que surgem.
4. Certifique-se de as migrations foram implementadas, caso contrário os deployes vão colapsar no instante base tentando referenciar entidades invisíveis no ORM.
5. **📋 OBRIGATÓRIO — Bumpar Versão no Changelog:** Antes do deploy, renomeie `## [Unreleased]` no `CHANGELOG.md` para `## [X.Y.Z] — YYYY-MM-DD` seguindo SemVer. Crie nova seção `[Unreleased]` vazia acima.
