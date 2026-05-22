---
description: Padrões de Nomenclatura Constantes e Descritivos
---
# Padrões de Nomenclatura
- **Descritividade sobre brevidade:** Nomes de variáveis devem explicar o seu propósito plenamente (`getUserData` ao invés de `getUsrdt`).
- **Padrões por Tipo:** 
  - Variáveis booleanas: devem ter prefixos interrogativos como `is`, `has`, `can` (ex: `isActive`, `hasPermission`).
  - Funções: devem começar com um verbo de ação (ex: `createOrder`, `fetchUserDetails`, `calculateTotal`).
  - Constantes Globais: escreva em `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_COUNT`).
- **Idioma Unitário:** Mantenha o código estritamente em Inglês (variáveis, funções, classes e arquivos), para manter coerência com as bibliotecas, mesmo que strings para o usuário sejam em Português.
