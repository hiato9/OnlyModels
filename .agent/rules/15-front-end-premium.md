---
description: Regra de Desenvolvimento UI High-level (SaaS Premium)
---

# Frontend Premium e Experiência do Usuário (SaaS)

O frontend deve exalar atenção aos detalhes. Uma interface mal polida destrói a confiança em uma ferramenta financeira B2B.

## Princípios
1. **Feedback Instantâneo (Optimistic UI):** Ao clicar num botão (ex: Curtir, Excluir, Adicionar ao carrinho), a UI deve refletir o estado de sucesso imediatamente de forma visual, resolvendo a requisição em background, melhorando a percepção de velocidade.
2. **Microações Livres de Prop Drilling:** Em uma SPAs grandes, evite passar propriedades de estado mais que dois níveis abaixo. Adote Contexto isolado ou gerenciadores (Zustand) para áreas globais.
3. **Tratamento Elegante de Carregamento:** Onde puder, evitar "Spinners" e aplicar "Skeleton Loaders" que mantêm o layout imutável.
4. **Resolução de Erros na Tela:** Qualquer formulário deve validar dados no Client-Side ANTES do request, indicando o erro exatamente no campo relevante de cor destacada, ao invés de enviar e esperar o servidor reclamar.

## Padrão Esperado
O agente nunca deve implementar uma tela UI sem considerar as variáveis CSS/Tailwind (Cores, Espaçamento, Responsividade) apropriadas, aplicando tipografia alinhada e feedback tátil em estados `hover`, `focus`, e `disabled`.
