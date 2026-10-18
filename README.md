# Super SarneyWorld II — Evagos

Versão personalizada com retrato do Sarney no mapa, seleção e painel de jogo, abertura Evagos e novo lutador com quepe. Os quadros do personagem foram alinhados para reduzir a tremedeira.

## Jogar no Windows

1. Extraia a pasta inteira.
2. Abra **JOGAR.bat**.
3. Mantenha a janela do servidor aberta e clique **Play** no navegador.
4. Se já estiver usando uma versão anterior, pressione **Ctrl+F5**.

O endereço local é `http://localhost:8765/`. O jogo precisa desse servidor; abrir `index.html` diretamente não carrega o WebAssembly.

## Enviar para o GitHub

Use **GitHub Desktop** ou Git para enviar o conteúdo desta pasta para um repositório. Deixe `index.html` na raiz do repositório, junto de `game.data`, `game.wasm`, scripts e pastas `media` e `mod`. Não envie somente o ZIP.

O arquivo `game.data` tem aproximadamente 76 MB. Ele ultrapassa o limite de envio pelo navegador do GitHub, mas cabe no limite por arquivo de um envio normal por Git. Não é necessário configurar Git LFS para este pacote. [Limites de arquivos no GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

Não inclua a pasta local `mod/backup-antes-foto-v02`, arquivos de teste ou ZIPs. O ZIP preparado para envio já exclui esses itens.

## Publicar no GitHub Pages

Após enviar os arquivos:

1. Abra **Settings → Pages** no repositório.
2. Em **Source**, escolha **Deploy from a branch**.
3. Escolha a branch usada no envio, normalmente **main**, e a pasta **/(root)**.
4. Clique **Save** e aguarde o GitHub mostrar o endereço do site.

O arquivo `.nojekyll` já está incluído. Não há etapa de compilação para publicar esta cópia. [Instruções oficiais do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Controles

| Tecla | Ação |
| --- | --- |
| Setas | Mover e abaixar |
| Z | Pular e confirmar |
| X / C | Soco / chute |
| A | Especial |
| S | Super |
| D | Defender |
| Enter | Iniciar e pausar |

Também há controles de toque e suporte a controle de jogo.

## Imagens e alterações

- `mod/sarney-retrato-hd.png`: novo retrato com fundo transparente.
- `mod/sarney-sprites-v02.png`: arte das poses do lutador.
- `mod/aplicar_foto_v02.mjs`: empacotador dos sprites; o jogo distribuído já está preparado.
- `mod/prompt-retrato.txt` e `mod/prompt-personagem-v02.txt`: instruções usadas na preparação das imagens com a ferramenta integrada de imagens.
- `media/previa-mapa.png`, `media/previa-selecao.png`, `media/previa-personagem.png` e `media/previa-titulo.png`: capturas desta versão.

O retrato ampliado e a arte do lutador foram preparados a partir da foto enviada. O rosto do lutador é uma interpretação ilustrada; os retratos da interface usam a imagem fotográfica preparada.

Para desenvolvimento da arte, o empacotador usa Node.js e as dependências opcionais de `package.json`. Instale com `npm install` e execute `npm run repack` sobre uma cópia desta distribuição. Isso não é necessário para jogar nem para publicar.

## Créditos

Personalização: Evagos / Sarney. Base: [smw-street-fighter](https://github.com/mikolalysenko/smw-street-fighter). Consulte [LICENSE.txt](LICENSE.txt) e [ASSETS.md](ASSETS.md) para a licença e a origem dos componentes e conteúdos da base. Esses arquivos acompanham esta versão.
