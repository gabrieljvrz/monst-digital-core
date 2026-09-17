# MONST.SA — experiência digital de marca e loja demonstrativa

## Objetivo
Transformar a identidade já presente nas referências em uma página única de alto impacto: laranja dominante, grafite/preto, linguagem pop retrô esportiva, tipografia compacta e o mascote como personagem recorrente. A experiência será uma campanha digital da marca, não um template convencional de suplementos.

## Direção visual
- Usar as imagens anexadas como referência direta e, quando apropriado, como conteúdo editorial da loja e do universo social, sem redesenhar nem distorcer o mascote.
- Criar um sistema visual próprio em laranja, grafite, branco e neutros, com texturas discretas, recortes, faixas, etiquetas e tipografia display de forte presença.
- Construir um hero publicitário assimétrico, com mascote monumental, sobreposições e movimento controlado.
- Alternar blocos laranja, escuros e claros, variando composição, escala e ritmo para evitar uma sequência de cards.

## Estrutura e conteúdo
- Header responsivo e fixo com navegação, pesquisa, conta, carrinho e ação de compra; menu mobile animado.
- Hero, faixa contínua de impacto, categorias editoriais, produtos em destaque, benefícios, Kit MONST, história da marca, loja física, galeria social, depoimentos demonstrativos, FAQ, chamada final e footer.
- Produtos fictícios plausíveis com embalagens próprias e coerentes com a identidade MONST.SA; nenhum logo concorrente.
- Informações de endereço, horários e avaliações serão claramente apresentadas como demonstrativas quando não vierem das referências.

## Interações
- Busca e filtro demonstrativos com resultados e estado vazio.
- Carrinho lateral funcional: adicionar, feedback visual, contador, quantidades, remoção, subtotal e finalização demonstrativa.
- Accordion, navegação por âncoras, menu mobile, marquee, revelações no scroll e movimentos sutis do mascote.
- Respeito a redução de movimento e controles acessíveis por teclado.

## Implementação técnica
- React + TypeScript + Tailwind, com componentes reutilizáveis e tokens semânticos no sistema visual global.
- Assets das referências armazenados pelo fluxo de mídia do projeto; carregamento tardio abaixo da primeira tela.
- Metadados próprios da MONST.SA e HTML semântico.
- Validação visual em desktop e mobile, incluindo carrinho, busca, menu, FAQ, ausência de cortes e overflow horizontal.
