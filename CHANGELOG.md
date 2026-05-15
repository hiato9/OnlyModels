# 📝 CHANGELOG — OnlyModels

> Log das mudanças relevantes do projeto. Entradas mais recentes no topo.
> Formato: Data, Impacto, Módulos Afetados, O Que, Por Que, Diff Físico.

---

### [2026-05-12] — "Fix: model-profile.html ainda pedia dados do comprador"
**Impacto:** Médio | **Módulos Afetados:** `model-profile.html`
- **O que foi feito:** Removido o bloco "Dados Pessoais" (3 inputs: nome completo, email, CPF) do modal de checkout em `model-profile.html`. Texto do botão atualizado de "PAGAR E DESBLOQUEAR SEGREDO" → "GERAR PIX AGORA" pra alinhar com o `index.html`.
- **Por que foi feito:** A sprint anterior (migração Mercado Pago → Wiinpay) removeu o form do `index.html` mas esqueceu do `model-profile.html`. Como o fluxo real de compra passa por "VER PERFIL" → modal de assinatura, o usuário continuava sendo solicitado a preencher os dados. Bug detectado em produção pelo dono.
- **Validação:** Deploy `dpl_8vUv8zRMbfbPNM3RWx3hYnkQPoqL` em production. `curl https://onlymodels-five.vercel.app/model-profile.html` confirma ausência dos inputs e novo copy do botão.
- **Diff Físico:**
  - [MODIFY] `model-profile.html` (removidas linhas 75-83; trocado texto do botão na linha 99)

---

### [2026-05-12] — "Migration: Mercado Pago → Wiinpay (gateway PIX único)"
**Impacto:** Crítico | **Módulos Afetados:** `api/create-pix.js`, `app.js`, `index.html`, `package.json`, Vercel env vars
- **O que foi feito:** Migração definitiva do gateway de pagamento. Mercado Pago removido por completo do projeto (SDK, env vars, token); Wiinpay adotada como gateway único. UX simplificada: usuário não preenche mais nada (nome/email/CPF) — clica em "GERAR PIX AGORA" e recebe imediatamente o QR Code + código PIX copia-e-cola.
  - **Backend (`api/create-pix.js`):** Reescrito do zero. Sem SDK — HTTP fetch nativo direto para `https://api-v2.wiinpay.com.br/payment/create`. Body com `api_key` + `amount` (centavos) + `value` + `valor` (reais — 3 campos redundantes exigidos pela Wiinpay) + `name`/`email` fixos internos ("Cliente OnlyModels"/"cliente@onlymodels.com"). Auto-recovery via login + `api-key/list` quando a key principal é rejeitada (422 com "chave api"). Geração de imagem do QR delegada para `api.qrserver.com` (Wiinpay retorna só BR Code string, não base64).
  - **Frontend (`app.js`):** Função `processPayment()` simplificada — sem leitura de DOM de dados do comprador, sem validação de CPF (função `isValidCPF()` deletada). `API_BASE_URL` corrigido para rota relativa `/api` (antes apontava para `onlygrupos-api.vercel.app`, projeto separado herdado de quando OnlyModels era subproduto do onlygrupos). Usa `data.qr_code_image_url` no `<img>` em vez do antigo `data.qr_code_base64` do Mercado Pago.
  - **Frontend (`index.html`):** Removido bloco "Dados Pessoais" (3 inputs).
  - **`package.json`:** Removida dependência `mercadopago` (~5MB). Nenhuma dep nova necessária — Node 18+ do Vercel já tem `fetch` global e `AbortSignal.timeout`.
  - **Vercel env vars:** Adicionadas `WIINPAY_API_KEY` (JWT permanente da chave dedicada `op onlymodels`, criada no painel Wiinpay), `WIINPAY_EMAIL`, `WIINPAY_PASSWORD`, `WIINPAY_KEY_NAME=op onlymodels` (auto-recovery). Removida `MERCADOPAGO_ACCESS_TOKEN`.
  - **Segurança:** Token Mercado Pago hardcoded no código (`APP_USR-5238277782838185-...`) revogado pelo dono no painel deles. Ficava como fallback na linha 4 do antigo `create-pix.js`, exposto no histórico Git.
- **Por que foi feito:**
  - Unificação de gateway com as outras operações do dono (já validado em produção no Emerald Office).
  - Eliminação do atrito de checkout — coleta de dados pessoais derrubava conversão sem ganho operacional (Wiinpay não exige dados do pagador reais, aceita strings genéricas).
  - Wiinpay backend (Woovi whitelabel) é mais previsível para o caso de uso (PIX BR Code padrão Bacen).
- **Riscos / Pontos de Quebra Resolvidos:**
  - Auto-recovery via login: se `WIINPAY_API_KEY` for revogada no painel, o backend tenta 1x recuperar via `/user/login` + `/api-key/list`. Se falhar duas vezes, erro propaga.
  - Quirk dos 3 campos de valor (`amount`/`value`/`valor`): validação interna da Wiinpay usa `value`/`valor` em reais; mandar só `amount` em centavos retorna 422 "valor mínimo 3 reais". Mandar os 3 é o caminho seguro descoberto em reverse-engineering.
  - Valor mínimo R$ 3,00 — abaixo disso a Wiinpay rejeita. Códigos chamadores devem garantir isso.
  - CORS aberto em `*` — considerar restringir para `https://onlymodels-five.vercel.app` (domínio público real do projeto) depois que estabilizar.
- **Validação end-to-end:**
  - `curl -X POST /api/create-pix` com `transactionAmount: 3.00` → 200 com `qr_code` BR Code válido (apontando para `qr.woovi.com`).
  - Teste manual no site: clicar em "Assinar Premium" → modal abre direto com botão; clicar em "GERAR PIX AGORA" → QR Code + código copia-cola aparecem.
- **Diff Físico:**
  - [REWRITE] `api/create-pix.js` (~70 linhas → ~115 linhas, sem SDK, com auto-recovery)
  - [MODIFY] `app.js` (deleted `isValidCPF`, rewrite `processPayment`, fix `API_BASE_URL`)
  - [MODIFY] `index.html` (removido bloco de inputs do comprador)
  - [MODIFY] `package.json` (removida dep `mercadopago`)
  - [VERCEL ENV] +`WIINPAY_API_KEY`, +`WIINPAY_EMAIL`, +`WIINPAY_PASSWORD`, +`WIINPAY_KEY_NAME`, -`MERCADOPAGO_ACCESS_TOKEN`
  - [MERCADO PAGO] token vazado revogado no painel

---

## Formato Obrigatório de Entradas

Sempre que finalizar uma sessão de trabalho ou refatoração, insira um sub-bloco seguindo o padrão, obrigatoriamente nesta ordem de relevância (mais novos acima):

```markdown
### [YYYY-MM-DD] — "Título da Feature"
**Impacto:** [Baixo/Médio/Crítico] | **Módulos Afetados:** `[lista]`
- **O que foi feito:** O processo mental e técnico.
- **Por que foi feito:** A dor ou ganho de escala.
- **Riscos / Pontos de Quebra Resolvidos:** Se o script travar, o que impede a paneta de explodir?
- **Diff Físico (Arquivos afetados):**
  - [MODIFY] path/file1.js
  - [NEW] path/file2.js
```
