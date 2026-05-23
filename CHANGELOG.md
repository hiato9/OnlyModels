# 📝 CHANGELOG — OnlyModels

> Log das mudanças relevantes do projeto. Entradas mais recentes no topo.
> Formato: Data, Impacto, Módulos Afetados, O Que, Por Que, Diff Físico.

---

### [2026-05-23] — "Bloco C / sub-fase 1 do OnlyCoins — módulo client + HUD + consumo de mensagem"
**Impacto:** Crítico | **Módulos Afetados:** `funnels/credits.js` (novo), `funnels/engine.js`, `chat.html`
- **O que foi feito:** Primeiro pedaço do frontend do sistema de créditos. Foco: ligar a UI ao bucket free e ao consumo por mensagem. OTP e pack picker ficam pras sub-fases C.2 e C.3.
  - **`funnels/credits.js` (novo, ~190 LoC):** Módulo `window.OnlyCoins` com API `getBalance/canAfford/spend/refreshFromServer/setSession/clearSession/onChange`. Free bucket em `localStorage` (`omcoins:free`, `{balance, dateUTC}`) com reset diário UTC e inicial de `FREE_DAILY=10`. Paid balance em cache local (`omcoins:session`), sincroniza com `GET /api/credits-balance` quando há token (`omcoins:token`). `spend()` consome free primeiro e paid depois, emite evento e dispara `credits_spent` no `ChatAnalytics`. 401 do servidor → `clearSession('token_expired')` automático.
  - **HUD no header do chat (`chat.html`):** chip dourado clicável `🪙 N` reflete `free + paid`. Vira vermelho quando saldo ≤ 2 (`.is-low`). Click hoje só dispara `coins_hud_clicked` no analytics — modal de paywall + pack picker chegam na C.2/C.3.
  - **Consumo no engine (`funnels/engine.js`):** `handleUserSubmit` cobra 1 crédito antes de processar. Se `canAfford(1)` falha, chama `openOutOfCreditsPaywall()` (stub com `alert` + `out_of_credits` no analytics — placeholder até C.2). Cache busters: `engine.js?v=4 → v=5`.
- **Por que foi feito:** Backend (Bloco B) já expõe os endpoints, mas nenhuma tela usa OnlyCoins ainda. Sub-fase 1 entrega o esqueleto end-to-end visível: lead abre o chat, vê 10 créditos, cada mensagem decrementa, ao zerar bate em paywall (mesmo que ainda seja um `alert`). Quebrando o Bloco C em 3 sub-fases pra cada uma ser deployável e testável no funil real.
- **Decisões de produto tomadas nesta sub-fase (não estavam fechadas na memória do design):**
  - **Cota free diária = 10 créditos.** Suficiente pra abrir e tocar alguns nós do funil; zera no meio = trigger natural pra OTP.
  - **Custo = 1 crédito por mensagem do usuário.** Mídia da modelo e offer cards continuam grátis (são parte do flow, não ação do user).
  - **Reset diário em UTC**, não horário local — evita gaming trocando timezone do device.
- **Riscos / Pontos de Quebra Resolvidos:** Free bucket é device-bound puro (esperado pelo design — anônimo não tem identidade); paid bucket só existe após OTP (sub-fase C.2). `OnlyCoins.spend` é idempotente em falha (não decrementa se `canAfford` falhar). HUD se mantém em sync via `onChange`. Carregamento: `credits.js` carrega antes de `engine.js` (engine consome `window.OnlyCoins` — ordem importa).
- **Validação:** `node --check` em `credits.js` e `engine.js`. **Não testado em browser** — recomendado abrir `chat.html?id=0` localmente e (1) confirmar HUD começa em 10, (2) enviar mensagens e ver HUD decrementar, (3) zerar e ver paywall stub disparar.
- **Diff Físico:**
  - [NEW] `funnels/credits.js`
  - [MODIFY] `funnels/engine.js` (stub `openOutOfCreditsPaywall` + gate em `handleUserSubmit`)
  - [MODIFY] `chat.html` (CSS `.coins-hud`, markup do HUD no header, script `credits.js?v=1`, boot do HUD + auto-refresh quando há sessão; bump `engine.js?v=5`)

---

### [2026-05-22] — "Fix de segurança: trancar RPC `increment_paid_credits` de roles públicos"
**Impacto:** Crítico | **Módulos Afetados:** `supabase/migrations/0001_credits_schema.sql`, Supabase prod (RPC `public.increment_paid_credits`)
- **O que foi feito:** Aplicado `REVOKE EXECUTE ON FUNCTION increment_paid_credits(UUID, INTEGER) FROM PUBLIC, anon, authenticated` + `GRANT EXECUTE ... TO service_role` direto no Supabase de produção (`nrvjblecjgjtqyauhnav`) via MCP. A mesma sequência foi adicionada ao arquivo da migration pra que próximas reaplicações (clone do projeto, ambiente novo) já saiam trancadas.
- **Por que foi feito:** Advisor de segurança do Supabase apontou (WARN `0028`/`0029`): a função estava marcada `SECURITY DEFINER` mas com `EXECUTE` aberto pros roles `anon`/`authenticated`. Como a anon key é pública no frontend, qualquer um poderia bater `POST /rest/v1/rpc/increment_paid_credits` com um `p_user_id` e `p_delta` e creditar saldo arbitrário de OnlyCoins — vetor direto de fraude no sistema de pagamento, ainda antes do launch. Backend continua chamando via `service_role` (que ignora o REVOKE), comportamento legítimo intacto.
- **Riscos / Pontos de Quebra Resolvidos:** Confirmado pós-fix com `get_advisors` — os 2 WARNs sumiram. Restaram só 4 INFOs (`rls_enabled_no_policy` nas 4 tabelas) — design intencional (backend usa service_role, cliente nunca toca direto).
- **Diff Físico:**
  - [MODIFY] `supabase/migrations/0001_credits_schema.sql` (REVOKE + GRANT logo após a definição da RPC)
  - [SUPABASE PROD] REVOKE + GRANT aplicados via MCP `execute_sql`

---

### [2026-05-22] — "Bloco A/1 do OnlyCoins — Supabase de produção configurado"
**Impacto:** Crítico | **Módulos Afetados:** Vercel env vars (Production + Development), Supabase prod
- **O que foi feito:** Provisionamento operacional do Supabase pro OnlyCoins.
  - Projeto `onlymodels` (ref `nrvjblecjgjtqyauhnav`, região `sa-east-1`) criado pelo dono no painel Supabase.
  - Migration `0001_credits_schema.sql` aplicada manualmente via SQL Editor (4 tabelas + RPC + RLS confirmados via `list_tables`).
  - Env vars `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` setadas no Vercel (Production + Development) via CLI.
- **Por que foi feito:** Sem o backend conectado ao Postgres, nenhum dos endpoints novos (`otp-request`, `otp-verify`, `credits-balance`, `credit-pack`, `wiinpay-webhook`) consegue rodar. Esse é o primeiro item operacional do Bloco A — os demais (chip pré-pago, VM Oracle, tunnel HTTPS, webhook Wiinpay) seguem em sequência.
- **Riscos / Pontos de Quebra Resolvidos:** Service_role key não é puxável via MCP (segurança); coletada manualmente no painel pelo dono e colada no chat. Vars setadas em Production + Development pra manter paridade com o resto da stack já configurada.
- **Diff Físico:**
  - [VERCEL ENV] +`SUPABASE_URL`, +`SUPABASE_SERVICE_ROLE_KEY` (Production + Development)
  - [SUPABASE PROD] `nrvjblecjgjtqyauhnav` ativo em `sa-east-1`, migration aplicada

---

### [2026-05-20] — "Bloco B do sistema OnlyCoins — backend (Supabase + WhatsApp OTP + endpoints)"
**Impacto:** Crítico | **Módulos Afetados:** `supabase/migrations/`, `services/wa-otp/`, `api/_lib/`, `api/{otp-request,otp-verify,credits-balance,credit-pack,wiinpay-webhook}.js`, `api/create-pix.js` (refactor), `package.json` (raiz), Vercel env vars
- **O que foi feito:** Build inteiro do backend do sistema de créditos (OnlyCoins) — mecânica free diário + pago persistente, com identidade ancorada em WhatsApp OTP.
  - **Schema Supabase (`0001_credits_schema.sql`):** 4 tabelas (`users`, `otp_codes`, `credit_transactions`, `pending_credit_purchases`) + função RPC atômica `increment_paid_credits` (evita race no webhook) + RLS habilitado em todas. Backend usa `service_role` pra bypassar RLS; nenhum cliente acessa as tabelas direto.
  - **Microserviço WhatsApp (`services/wa-otp/`):** ~140 LoC de Node + Express + `@whiskeysockets/baileys` (não Evolution — Evolution v2 estoura 1GB de RAM). Endpoint único `POST /send-otp` autenticado por header `X-API-Secret`. Container Docker com healthcheck, volume persistente pra auth state, memory limit 400M. Reconexão com backoff exponencial. Acompanha `setup.sh` que automatiza instalação do Docker + .env + up do compose.
  - **Helpers compartilhados (`api/_lib/`):** `cors.js` (extraído do create-pix antigo), `supabase.js` (admin client), `phone.js` (normalização BR → E.164), `jwt.js` (jose HS256, 1h TTL), `otp.js` (bcrypt+pepper, 6 dígitos, 5min, max 5 tentativas), `wiinpay.js` (extraído do create-pix com auto-recovery de api_key).
  - **Endpoints novos:** `otp-request` (rate limit 1/min e 5/h, invalida códigos anteriores, chama Baileys), `otp-verify` (confere código, upsert do user, devolve JWT), `credits-balance` (GET autenticado, retorna paid_balance), `credit-pack` (JWT obrigatório, packs hard-coded server-side, grava pending_credit_purchases), `wiinpay-webhook` (idempotente via UPDATE WHERE status='pending', credita via RPC + insere no ledger).
  - **Refactor `api/create-pix.js`:** de ~160 → 30 linhas. Agora usa `_lib/wiinpay.js` (DRY com o novo `credit-pack.js`).
  - **`package.json` raiz:** adicionado `@supabase/supabase-js`, `bcryptjs`, `jose` + `"type": "module"`.
  - **Vercel env vars setadas via CLI:** `JWT_SECRET`, `OTP_PEPPER`, `WIINPAY_WEBHOOK_SECRET` (Production + Development; Preview pulada — CLI wrapper resistiu, usuário adiciona manualmente se precisar de preview deploys).
- **Por que foi feito:** Sacada do dono — sistema de créditos diários (free + pago via WhatsApp OTP) muda a unit economics do produto. Mecânica de "energia" (Tinder Boost / gacha) cria hábito de retorno via sunk-cost diário + impulso de compra quando zera. Bloco B fecha o backend completo; Bloco C (frontend) vem depois que o Bloco A (provisionamento operacional — Supabase rodado, chip+VM+webhook configurados) estiver pronto.
- **Decisões arquiteturais (documentadas em memória do projeto):**
  - Baileys self-hosted (não Evolution) — 1GB AMD aguenta com folga, Evolution v2 estouraria.
  - Identidade só em paying users — free credits ficam device-bound em localStorage; paid credits viram identity-bound no Supabase quando o lead verifica WhatsApp.
  - Multi-day context = caminho barato (extensão do funil JSON atual via `dayCount` + nó `n_returning_lead`), NÃO LLM-driven.
  - Schema usa `paid_credits_balance` (neutro); UI vai usar a label "OnlyCoins" (decoupling brand ↔ schema).
- **Riscos / Pontos de Quebra Resolvidos:**
  - Atomicidade do webhook — `UPDATE WHERE status='pending'` é o guard idempotente; múltiplas entregas do mesmo evento creditam só uma vez.
  - Race em `users.paid_credits_balance` — RPC `increment_paid_credits` faz o `balance = balance + delta` no Postgres direto (não round-trip select+update).
  - Reuso de OTP velho — `otp-request` invalida códigos anteriores não-usados antes de inserir novo.
  - Rate limit — 1 OTP/min e 5/hora por número (queries em `otp_codes` com filtro temporal).
  - Webhook Wiinpay — auth via header secret estático + nome do header configurável (pode ser `X-Webhook-Secret` ou `X-Wiinpay-Signature`); ajustar quando o painel da Wiinpay for configurado.
  - CORS — todos os endpoints novos usam o helper `_lib/cors.js` (whitelist + preview vercel.app).
- **Validação:** `node --check` passou em todos os 13 arquivos JS novos. **Não testado end-to-end** — depende do Bloco A (Supabase migrado ✓, chip + VM + tunnel + webhook Wiinpay) estar de pé.
- **Diff Físico:**
  - [NEW] `supabase/migrations/0001_credits_schema.sql`
  - [NEW] `services/wa-otp/{index.js, package.json, Dockerfile, compose.yml, .dockerignore, setup.sh}`
  - [NEW] `api/_lib/{cors, supabase, phone, jwt, otp, wiinpay}.js`
  - [NEW] `api/{otp-request, otp-verify, credits-balance, credit-pack, wiinpay-webhook}.js`
  - [REWRITE] `api/create-pix.js` (160 → 30 linhas, usa `_lib/wiinpay.js`)
  - [MODIFY] `package.json` (raiz; adicionado deps + `type: module`)
  - [VERCEL ENV] +`JWT_SECRET`, +`OTP_PEPPER`, +`WIINPAY_WEBHOOK_SECRET` (Production + Development)

---

### [2026-05-18] — "Instrumentação do funil de chat (analytics provider-agnostic)"
**Impacto:** Médio | **Módulos Afetados:** `funnels/analytics.js` (novo), `funnels/engine.js`, `chat.html`
- **O que foi feito:** Criado `funnels/analytics.js` — wrapper fino `window.ChatAnalytics.track(eventName, props)` que (1) loga no console, (2) empilha em buffer circular de 100 eventos em `localStorage` (`omchat:events`) pra debug offline, (3) repassa pra `window.posthog.capture` e/ou `window.gtag` se carregados. Engine dispara 7 eventos nos gargalos de conversão: `chat_opened` (com `resumed`), `chat_first_message_sent`, `funnel_node_reached`, `intent_classified`, `offer_shown`, `offer_clicked`, `pix_generated`, `chat_session_ended` (em `pagehide`/`visibilitychange`, com duração e contagens). `modelId`/`modelName` são injetados automaticamente pelo helper `fire()`.
- **Por que foi feito:** Antes da instrumentação, não dava pra responder "onde o lead cai?". Agora dá pra montar heatmap de drop-off por nó, tunar a regex do classificador com dados reais e medir conversão por SKU. Decisão de vendor (PostHog vs GA4) ficou desacoplada — basta colar o snippet no `<head>` do `chat.html` depois.
- **Validação:** Manual em DevTools — `[track]` aparece no console em cada evento; `localStorage.getItem('omchat:events')` retorna o histórico; nenhum erro com `posthog`/`gtag` ausentes.
- **Diff Físico:**
  - [NEW] `funnels/analytics.js`
  - [MODIFY] `funnels/engine.js` (helper `fire()` + 7 pontos de tracking)
  - [MODIFY] `chat.html` (script `analytics.js` carrega antes do `engine.js`; bump `engine.js?v=4`)

---

### [2026-05-18] — "Funis roteirizados para Isabela, Helena e Yasmin"
**Impacto:** Médio | **Módulos Afetados:** `funnels/isabelamartins.json` (novo), `funnels/helenarocha.json` (novo), `funnels/yasmincastro.json` (novo)
- **O que foi feito:** 3 funis reais (~80 nós cada) seguindo a topologia universal `hook → discovery → tease → 4 ofertas (foto/video/premium/vip)` com branches de `downsell/reassure/resgate` em cada `wait_user`. Voz de cada modelo derivada do bio + tier:
  - **Isabela Martins (platinum)** — carinhosa-malandra, "mundo secreto". `foto R$ 9,90 / video R$ 19,90 / premium R$ 39,90 / vip R$ 99,90`.
  - **Helena Rocha (gold)** — carioca descolada, praia/verão, tom "mermão". `foto R$ 9,90 / video R$ 19,90 / premium R$ 34,90 / vip R$ 84,90`.
  - **Yasmin Castro (silver)** — novinha curiosa-tímida "primeira vez", menor fricção de entrada. `foto R$ 7,90 / video R$ 14,90 / premium R$ 19,90 / vip R$ 54,90`.
  - Preços de premium/vip casam com `creator.subscriptionTiers` existente. Foto/video são PPV novos, dimensionados pelo tier.
- **Por que foi feito:** Sair do funil de demo (`_schema.example.json`) pra teste em campo com 3 perfis representativos da grade — um por tier (platinum/gold/silver) — antes de roteirizar as outras 13 modelos.
- **Riscos / Pontos de Quebra Resolvidos:** Match de slug do engine é `funnels/<lowercase-name-no-spaces>.json`. As 13 modelos restantes seguem usando `_schema.example.json` como fallback até serem roteirizadas — sem erro 404 no chat.
- **Diff Físico:**
  - [NEW] `funnels/isabelamartins.json` (~694 linhas)
  - [NEW] `funnels/helenarocha.json` (~694 linhas)
  - [NEW] `funnels/yasmincastro.json` (~694 linhas)

---

### [2026-05-18] — "Refactor: botão 'Conversar' agora abre chat direto (fim da taxa de mensagem)"
**Impacto:** Baixo | **Módulos Afetados:** `app.js`, `index.html`, `pagina-2.html`, `model-profile.html`
- **O que foi feito:** O botão "Conversar com X" no perfil completo (`renderFullProfilePage`) abria o modal de checkout PIX cobrando `R$ 19,90` de "taxa de mensagem". Como o chat por trás dessa taxa nunca foi construído, o botão virou âncora `<a href="chat.html?id=N">`. O branch `planType === 'chat'` foi removido de `openCheckoutModal` (estava morto — nenhum chamador restante usava). Cache buster de `app.js` subiu `v=6 → v=7` em `index.html`, `pagina-2.html`, `model-profile.html` e `chat.html` pra clientes velhos pegarem o novo link.
- **Por que foi feito:** O funil de chat agora vende PPV/Premium/VIP inline via offer cards — taxa de entrada virou redundante e atrito desnecessário.
- **Validação:** Manual — clicar em "Conversar com {Nome}" em qualquer perfil completo abre `chat.html?id=N` com a modelo correta carregada.
- **Diff Físico:**
  - [MODIFY] `app.js` (botão `<a>`, branch `chat` removido em `openCheckoutModal`)
  - [MODIFY] `index.html`, `pagina-2.html`, `model-profile.html` (bump `app.js?v=7`)

---

### [2026-05-18] — "Feature: chat dirigido por funil + classificador de intenção por regex"
**Impacto:** Crítico | **Módulos Afetados:** `chat.html` (nova), `funnels/engine.js` (novo), `funnels/_schema.example.json` (novo)
- **O que foi feito:** Nova página `chat.html` (UI mobile-first full-screen, estilo messenger) + state machine `funnels/engine.js` que lê o JSON do funil da modelo e dirige a conversa. Destaques do engine:
  - **4 tipos de nó:** `model_message`, `model_media`, `model_offer`, `wait_user`.
  - **Classificador de intenção:** regex sobre 10 categorias (`pronto_pagar`, `pechinchando`, `vai_pensar`, `cetico`, `tarado`, `frio`, `despedida`, `rude`, etc.) com ordem de prioridade pra evitar ambiguidade.
  - **`inputPlaceholder` por funil** — lead vê CTA customizado no campo de input.
  - **`captureAs` em `wait_user`** — armazena resposta do usuário em variável de sessão pra interpolação (`{{userName}}` etc.).
  - **Persistência:** sessão em `localStorage` por `modelId`; bump de `funnelVersion` invalida sessões velhas automaticamente.
  - **Offer cards inline:** thumbnail blurada + preço + CTA "LIBERAR PIX" → handoff pro endpoint Wiinpay existente (`/api/create-pix`).
  - **Pós-PIX:** transição `onPaymentGenerated` avança o funil pra nó de delivery (mock media) e marca o SKU como comprado no client.
  - **Hint vazio:** "X está online, manda uma mensagem 👋" porque a modelo não cumprimenta primeiro.
- **Por que foi feito:** Sair de modal estático "assinar plano" pra um funil persuasivo que simula conversa real — captura objeção (`pechinchando`/`cetico`) e oferece downsell/reassure antes de perder o lead, replicando o que já funciona em outras operações.
- **Riscos / Pontos de Quebra Resolvidos:** Schema documentado em `funnels/_schema.example.json` (24 nós cobrindo todos os tipos) — engine usa esse fallback quando o JSON da modelo não existe, evitando erro em modelos não-roteirizadas.
- **Diff Físico:**
  - [NEW] `chat.html` (~580 linhas)
  - [NEW] `funnels/engine.js` (~578 linhas)
  - [NEW] `funnels/_schema.example.json` (~287 linhas)

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
