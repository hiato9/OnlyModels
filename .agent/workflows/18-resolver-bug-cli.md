# ⚙️ Workflow: `/resolver-bug`

Este workflow entra em ação quando o usuário reportar um erro crítico, exceção no console ou bug de UI/UX. Exige rigor de "QA Engineer".

## 📌 Objetivo
Impedir "tentativas e erros" cegas. Determinar a raiz causal original (Root Cause Analysis - RCA) e corrigir o problema sem gerar novos efeitos colaterais.

## 🔄 Passos da Rotina

1.  **Contenção & Isolamento**
    *   Peça ou analise o stack trace exato.
    *   Não adivinhe. Isole o código faltoso lendo os arquivos e módulos atrelados.
    
2.  **Hipóteses e Validação**
    *   Formule pelo menos 2 (duas) hipóteses para o bug antes de alterar o código.
    *   Escreva no console/chat qual a teoria principal (ex: *"Acredito ser um problema de lock no Prisma durante o update concorrente."*).

3.  **Desenvolvimento do Fix**
    *   Adote a Persona apropriada (Backend, Frontend ou Arquiteto dependendo da stack do bug).
    *   Implemente o fix com menor raio de blast (impacto colateral) possível.
    *   Adicione o tratamento de erro necessário caso fosse uma exceção não-tratada.

4.  **Verificação & Prevenção**
    *   Descreva como testar o fix para confirmar que está resolvido.
    *   (Opcional) Propor um teste unitário/E2E para evitar regressão futura.
