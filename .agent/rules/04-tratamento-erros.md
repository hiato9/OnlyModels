---
description: Gestão Centralizada e Segura de Erros
---
# Tratamento de Erros
- **Nunca Falhe Silenciosamente:** É terminantemente proibido usar blocos `try/catch` vazios. Pelo menos registre o erro via Logger.
- **Erros Customizados:** Utilize classes de erro ou entidades customizadas (ex: `AppError`, `ValidationError`, `NotFoundError`) para diferenciar falhas lógicas e de usuário das falhas crônicas de infraestrutura.
- **Centralização End-to-End:** No backend, utilize middlewares de erro formais (Global Error Handlers). No frontend, utilize Error Boundaries do React e interceptors de requisção para capturar falhas antes destas quebrarem as telas.
