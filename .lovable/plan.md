# Integração do vídeo do mascote no HERO

## Objetivo
Evoluir somente o HERO atual, substituindo a imagem da direita pelo mascote animado, sem alterar textos, navegação, identidade ou demais seções.

## Implementação
- Remover offline o quadriculado gravado no MP4, quadro a quadro, preservando contornos, olho, dentes, mãos e movimento original.
- Exportar uma versão transparente e otimizada para navegador, além de um quadro estático transparente para usuários com redução de movimento.
- Inserir o vídeo como camada visual sem moldura, controles ou aparência de player, com autoplay, muted, loop e playsinline.
- Manter a composição editorial existente: texto e ações à esquerda, mascote grande e inteiro à direita, com sombra de contato e poucos grafismos MONST ao redor.
- Ajustar somente o HERO para desktop, tablet e celular; no celular, posicionar o mascote abaixo das ações sem cortes ou rolagem horizontal.
- Preservar os elementos atuais que continuarem contribuindo para a composição, removendo apenas os que competirem com o novo vídeo.

## Validação
- Conferir visualmente o primeiro bloco em desktop e celular.
- Confirmar que nenhum quadriculado aparece, o personagem não é cortado, o loop funciona sem controles e o restante da página permanece inalterado.
- Verificar a apresentação estática com `prefers-reduced-motion: reduce` e ausência de deslocamento de layout.
