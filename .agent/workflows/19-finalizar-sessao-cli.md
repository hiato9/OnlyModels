# ⚙️ Workflow: `/finalizar-sessao`

Este workflow deve ser acionado nos momentos finais do desenvolvimento, antes de fechar os arquivos ou entregar os commits principais.

## 📌 Objetivo
Realizar o clean-up, consolidar o que foi feito na memória do projeto (`CHANGELOG.md`), e proteger a próxima iteração assegurando que o código da branch atual está estável.

## 🔄 Passos da Rotina

1.  **Revisão Geral e Auditoria (Self-Review)**
    *   O Agente revisa os arquivos modificados durante a sessão (via diff se possível ou abstração da memória recente).
    *   Confirmação rápida para garantir que logs sensíveis, variáveis ou códigos mortos (ex: `console.log('teste')`) não foram deixados no `.ts` / `.html`.

2.  **Atualização de Registros**
    *   Modificar obrigatoriamente o `CHANGELOG.md` descrevendo em Bullet Points técnicos (profissionais) o que foi alcançado nesta sessão.
    *   Documentar decisões arquiteturais importantes tomadas durante o percurso (se houver).

3.  **Checklist de Entrega**
    *   O app está compilando/buildando?
    *   Foram criados novos componentes de UI que precisam de testes futuramente?
    *   A persistência de banco sofreu alterações estruturais?

4.  **Resumo de Handoff**
    *   Apresentar ao usuário a confirmação de sucesso de sessão, sugerindo o comando de commit/push e já indicando os "Next Steps" óbvios no próximo `/iniciar-sessao`.
