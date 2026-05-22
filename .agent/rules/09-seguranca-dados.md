---
description: Proteção de Fronteiras de Vulnerabilidade (API + UI)
---
# Segurança Básica
- **Nenhuma Entrada Imaculada:** Toda entrada gerada fora do domínio restrito da aplicação não é confiável. Valide rigorosamente com Schemas estritos para bloquear Injections ou Malformed data assim que eles pisam nos domínios fronteiros.
- **Logs Ciegos (Blind logging):** Nunca em hipótese nenhuma grave senhas, informações do cartão inteiro, ou hashes secretos de sessão dentro de logs simples do sistema ou APMs em produção.
- **Princípio de Minimização de Erro Exposto:** O cliente e usuários recebem mensagens agradáveis, nunca pilhas de erro nativas (stacktraces completas ou erros vazados de SQL).
