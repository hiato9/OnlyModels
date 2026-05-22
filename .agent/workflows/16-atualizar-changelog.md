---
description: Regra Obrigatória de Registro de Alterações no CHANGELOG.md
---
# Workflow: Atualizar Changelog Após Toda Edição

// turbo-all

Este workflow é **OBRIGATÓRIO** e se aplica a **TODAS as operações** que modifiquem código-fonte, schemas, configurações, dependências ou workflows neste repositório.

## Regra Fundamental

> **NUNCA** finalize uma task sem antes registrar as alterações no arquivo `CHANGELOG.md` na raiz do projeto.
> Se você editou um arquivo, você DEVE registrar o que mudou. Sem exceções.

## Quando Executar

Este workflow deve ser executado como **último passo** de qualquer uma das seguintes ações:

1. Criação de nova feature, componente, rota, model, service, worker, ou página
2. Correção de bug (bugfix)
3. Refatoração de código existente
4. Alteração de schema do banco (Prisma, SQL)
5. Adição, remoção ou atualização de dependências (`package.json`)
6. Mudanças em configurações (`tsconfig.json`, `vite.config.ts`, `.env.example`, etc.)
7. Criação ou edição de workflows (`.agent/workflows/`)
8. Correções de segurança
9. Otimizações de performance
10. Remoção de código, features ou arquivos

## Como Registrar

### Passo 1 — Determinar o Tipo da Mudança

Use a tag correta conforme a legenda definida no final do `CHANGELOG.md`:

| Tag | Quando Usar |
|-----|-------------|
| 🏗️ **Adicionado** | Algo novo foi criado (feature, arquivo, rota, model) |
| 🔄 **Alterado** | Algo existente foi modificado (refactor, extensão, re-design) |
| 🐛 **Corrigido** | Um bug foi resolvido |
| 🗑️ **Removido** | Código, feature ou dependência foi removida |
| 🔒 **Segurança** | Melhoria ou correção de segurança |
| 📝 **Documentado** | Documentação adicionada ou atualizada |
| ⚡ **Performance** | Otimização de velocidade, memória, ou queries |
| 💥 **Breaking** | Mudança que quebra compatibilidade retroativa |

### Passo 2 — Localizar a Seção Correta

1. Abra `CHANGELOG.md` na raiz do projeto.
2. Localize a seção `## [Unreleased]` no topo (crie se não existir, logo abaixo do cabeçalho).
3. Adicione sua entrada sob a tag correta dentro da seção `[Unreleased]`.

### Passo 3 — Escrever a Entrada

Cada entrada DEVE seguir este formato rigoroso:

```markdown
### 🏗️ Adicionado
- **Nome Descritivo da Mudança** (`caminho/relativo/do/arquivo.ts`): Explicação clara e concisa do que foi feito, por quê, e qual o impacto. Cite campos, funções, endpoints, e componentes específicos.
```

**Regras de Escrita:**
- Comece com o **nome do que mudou** em negrito.
- Inclua o **caminho do arquivo** entre parênteses com backtick.
- Descreva o **quê**, **porquê**, e **como** impacta o sistema.
- Cite nomes de **funções**, **endpoints**, **models**, e **componentes** por nome.
- Se a mudança envolve migração de banco, cite o nome da migration.
- Se a mudança quebra algo, use a tag 💥 **Breaking** e explique a migração.

### Passo 4 — Bumpar Versão (Quando Aplicável)

Ao fechar um conjunto coerente de mudanças (ex: fim de um sprint, merge de branch, deploy):

1. Renomeie `## [Unreleased]` para `## [X.Y.Z] — YYYY-MM-DD`
2. Crie uma nova seção `## [Unreleased]` vazia acima
3. Siga SemVer:
   - **MAJOR** (X): Mudanças breaking ou redesign fundamental
   - **MINOR** (Y): Nova feature ou capacidade
   - **PATCH** (Z): Bugfix ou melhoria pequena

## Exemplo Completo de Entrada

```markdown
## [Unreleased]

### 🏗️ Adicionado
- **Rate Limiting Global** (`backend/src/middlewares/rateLimitMiddleware.ts`): Middleware Express que limita a 100 requests por minuto por IP usando Map in-memory. Aplicado globalmente em `index.ts` antes de todas as rotas. Protege endpoints críticos `/api/transactions/process` e `/api/merchants/login`.

### 🔄 Alterado
- **`index.ts`** (`backend/src/index.ts`): Adicionado `app.use(rateLimiter)` antes do registro de rotas. Import do novo middleware adicionado na seção de middlewares.

### 🐛 Corrigido
- **Race Condition no Saque** (`backend/src/controllers/walletController.ts`): `createWithdrawal` agora usa `prisma.$transaction()` para envolver check de saldo + decrement + criação do withdrawal. Anteriormente, duas requests simultâneas podiam debitar o dobro do saldo.
```

## Checklist Anti-Esquecimento

Antes de considerar qualquer tarefa como concluída, responda mentalmente:

- [ ] Eu editei algum arquivo de código-fonte? → Registrar no CHANGELOG
- [ ] Eu adicionei/removi alguma dependência? → Registrar no CHANGELOG
- [ ] Eu alterei o schema do banco? → Registrar no CHANGELOG
- [ ] Eu criei ou editei um workflow? → Registrar no CHANGELOG
- [ ] Eu corrigi um bug? → Registrar no CHANGELOG
- [ ] A entrada no CHANGELOG cita os arquivos corretos? → Verificar paths
- [ ] A entrada descreve o impacto da mudança? → Não apenas "o quê", mas "por quê"
