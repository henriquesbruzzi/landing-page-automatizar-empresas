# NEXUGAL — site da empresa

Contexto permanente para qualquer sessão de Claude Code / Cowork neste repo.
Lê isto antes de tocar em ficheiros.

---

## 1. Quem é quem

- **Rui** — sócio. Trata do **frontend**. Não programa: dirige, decide e aprova.
  Explica-lhe as coisas em português de Portugal, curto e direto, sem jargão desnecessário.
- **Henrique (`henriquesbruzzi`)** — sócio. Trata do **backend** e é o dono do repo no GitHub.

**Regra:** a pasta `backend/` é dele. Não alterar nada lá dentro sem o Rui pedir
explicitamente. Se um problema do frontend só se resolver mexendo no backend,
dizer ao Rui em vez de avançar — ele fala com o Henrique.

---

## 2. O que é este repo

Monorepo com as duas metades do site:

```
frontend/    React (Create React App 5 + Tailwind + react-router 7), PT/EN
backend/     FastAPI (Python) — main.py, ~331 linhas
vercel.json  na raiz: manda a Vercel construir SÓ o frontend
```

### Frontend (`frontend/`)

Estado a 14/09/2026, no ramo `rui/site-branco`. O que cada peça faz, e porquê,
está na secção 7.

- `src/components/`
  - `Header` (menu fixo), `Hero` (primeira dobra), `EsquemaIntegracoes` (o
    desenho do hero), `Exemplos` (secção de exemplos), `VisuaisExemplos` (os
    quatro desenhos dessa secção), `Process` ("Como trabalhamos"),
    `CallToAction` (convite final), `BotaoContactoFlutuante`, `Footer`,
    `CookieBanner`
  - `About` (o "quem somos", mostrado só na página do Sobre), `ContactPage`,
    `FAQPage`, `Dropdown` (lista de escolha do formulário de contacto)
  - `SEO` (título, descrição, canonical e JSON-LD de cada página), `Entrada`
    (invólucro que hoje não anima nada, ver 7.4)
- `src/pages/`: `SobrePage`, `PrivacyPolicyPage`, `AdminLoginPage`, `AdminLeadsPage`
- `src/hooks/`: `useTypewriter` (o título do hero a escrever-se),
  `usePrefersReducedMotion`, `useRevealOnScroll` (sem uso, ver 7.4)
- `src/utils/`: `avisoCookies.js` (liga o aviso de cookies ao botão flutuante),
  `entrada.js` (classes da entrada animada do hero), `contraste.test.js`
  (teste de contraste, ver 7.5)
- `src/chatbot/`: código de um widget de chat, **desligado** (ver secção 5)
- `src/i18n/translations.js`: **quase todo o texto do site em PT e EN vive aqui**.
  Para mudar palavras no site, é quase sempre este ficheiro, não os componentes.
  As exceções estão em 7.4.
- `public/`: imagens (`images/nexugal-n.png` é o N do hero, `images/rui.jpg` a
  fotografia do Sobre, `images/nexugal-partilha-2.png` a imagem das
  pré-visualizações do WhatsApp e das redes, desde 18/09, 7.10), vídeo (ainda por trás
  do contacto e da FAQ), ícones, `logos/` (tira de ferramentas), sitemap.xml,
  robots.txt. A `images/foto principal.png` (o hero antigo, 5 MB) foi apagada a
  18/09 (7.8)
- `tailwind.config.js`: cores e tipografia. As cores estão repetidas em
  `src/index.css` (ver 7.1)

Rotas: `/`, `/contacto`, `/faq`, `/sobre`, `/privacidade`; em inglês `/us`,
`/us/contact`, `/us/faq`, `/us/about`, `/us/privacy`; e `/admin/login`,
`/admin/leads`.

### Backend (`backend/`)

FastAPI + Postgres (SQLite em local). Endpoints:

| Método | Rota               | Para quê                                  |
|--------|--------------------|-------------------------------------------|
| POST   | `/api/leads`       | recebe o formulário de contacto (público) |
| GET    | `/api/leads`       | lista os leads (exige token JWT)          |
| POST   | `/api/auth/login`  | login do admin, devolve o JWT             |
| GET    | `/api/health`      | verificação de vida                       |

---

## 3. Onde corre cada coisa

```
Visitante → nexusgal-laddingpage.vercel.app   ← Vercel constrói e serve o React
              │ submete o formulário
              ▼ POST /api/leads
           Railway (FastAPI)  →  Postgres do Railway
```

O endereço público é www.nexugal.com, servido por este mesmo projeto da Vercel.

**A ligação entre as duas metades é uma única variável de ambiente na Vercel:
`REACT_APP_API_URL`.** Se estiver errada ou em falta, o frontend cai no valor
por omissão `http://localhost:8000` — o formulário parece funcionar no site e
não grava lead nenhum. É a primeira coisa a verificar se os contactos deixarem
de chegar.

---

## 4. Como se trabalha aqui (fluxo acordado)

1. `git pull` antes de começar, sempre.
2. Nunca commitar direto no `main`. Ramo próprio: `rui/<assunto>`.
3. O Claude altera os ficheiros e **verifica que o build passa** antes de dar
   por concluído: `cd frontend && npm install && npm run build`. A Vercel
   constrói com `CI=true`, que trata os avisos como erros: testar também assim
   (comandos em 7.5).
4. **O Claude faz o commit e o push do ramo** (`git push -u origin rui/<assunto>`).
   Não mandar o Rui publicar pelo GitHub Desktop — ele já tem o ramo no GitHub
   sem fazer nada. **Publicar no site real é outro passo, e pede sempre
   confirmação expressa do Rui.** Hoje faz-se à mão (ver secção 6). Se a Vercel
   voltar a publicar sozinha a partir de um ramo, o push para esse ramo passa a
   ser publicar, e pede a mesma confirmação. Como saber, na secção 6.
5. O Rui vê o resultado localmente, no `npm start` (ver abaixo). **Não há links
   de pré-visualização por ramo.**
6. Se estiver bem: Pull Request → o Henrique revê → merge.

Para ver o site localmente: `cd frontend && npm install && npm start`
(precisa de Node.js instalado; abre em http://localhost:3000).

**No PowerShell que vem com o Windows (5.1) o `&&` não funciona.** Lá, os
comandos vão um por linha. Ver 7.5.

---

## 5. Armadilhas deste repo — parece errado e não é (ou é mesmo)

- **`frontend/vercel.json` está morto.** Quem manda é o `vercel.json` da raiz.
  Editar o de dentro não faz nada. Não vale a pena tentar.
- **O chatbot está desligado e não há planos para o ligar.** A pasta
  `src/chatbot/` não é importada em lado nenhum — nem no `App.js`, nem em
  componente nenhum. Nada dela é construída nem chega ao browser: não há
  widget no site. **O código fica no repo de propósito. Não apagar.**
  Enquanto assim for, nada do que lá está escrito é texto do site.
- **Dentro desse código desligado** as respostas são fixas, escritas à mão em
  `src/chatbot/services/chatService.js` (`simulateAIResponse`), e afirmam
  "10+ anos de experiência e 200+ projetos entregues". A empresa está a nascer,
  portanto é falso — mas **nenhum visitante vê isto**, porque o widget não corre.
  Não replicar noutros sítios. Só passa a ser preciso corrigir no dia em que
  alguém decidir ligar o widget.
- **`src/i18n/translations.js` tem um bloco `chatbot:` em PT e EN.** São textos
  órfãos do widget desligado. Ao contrário do resto do chatbot, estes **vão no
  bundle** (o `translations.js` é importado), mas não são mostrados em lado
  nenhum. Ficam pelo mesmo motivo que o resto do código do chatbot.

  Como confirmar que o widget continua fora do site, depois de um `npm run build`:
  procurar `simulateAIResponse` ou `ChatWidget` em `build/static/js/*.js`.
  A 10/09/2026 dava zero ocorrências para ambos.
- **SEO dinâmico corrigido em `src/components/SEO.js`.** Corrigido a 13/09/2026.
  O `react-helmet-async` foi ajustado para a versão `1.3.0` (estável com React 18) e o componente `SEO.js` foi equipado com um efeito de sincronização DOM para garantir que os títulos, descrições, links canonical, hreflang e Open Graph sejam aplicados de forma fiável em todas as rotas (`/`, `/contacto`, `/faq`, `/sobre`, `/privacidade` e equivalentes em `/us`).
- **O ponto de cima foi completado a 16/09/2026** (`18a2135`). Até aí ficavam
  etiquetas repetidas e `hreflang` contraditórios: as fixas do
  `public/index.html` conviviam com as que a biblioteca escrevia. Agora cada
  etiqueta tem um só sítio que a escreve, explicado no topo do `SEO.js`.
  Verificado nas dez páginas. A "falha intermitente" de 14/09 não era do site: a
  biblioteca só escreve quando o browser desenha o ecrã, e o painel de
  pré-visualização do Claude escondido não desenha (7.4). Detalhe em 7.2, ponto 5.
- **O site é 100% renderizado no browser.** Quem abrir sem JavaScript vê página
  em branco. Mau para SEO / pré-visualização de subpáginas no WhatsApp sem JS (Caminho 2 — pré-renderização no servidor pendente para quando a estrutura final do site estiver concluída).
  O que seria preciso para as pré-visualizações por página está em 7.2, ponto 11.
- **`backend/main.py` tem valores por omissão perigosos**
  (`ADMIN_PASSWORD="admin123"`, `JWT_SECRET="change-this-in-production"`,
  `allow_origins=["*"]`). É território do Henrique — reportar, não corrigir.
- **Há mais armadilhas, do trabalho de setembro de 2026, em 7.4.**

---

## 6. Estado da infraestrutura

- **Vercel:** projeto `nexusgal-laddingpage`. Já mudou várias vezes, por isso
  vai por ordem:
  - Até 30/08/2026 estava ligada ao GitHub e publicava sozinha a cada push para
    o ramo `rui/frontend`.
  - A 02/09/2026 o projeto apareceu **desligado do GitHub** ("This Project is
    not connected to a Git repository"). Desde então o site publica-se **à
    mão**, com a ferramenta da Vercel, a partir da pasta do repositório no
    computador de quem publica: `vercel --prod`. A Vercel constrói com
    `CI=true`, e com isso os avisos do build contam como erros.
  - A 06/09/2026 o ramo `rui/frontend` foi **apagado** do GitHub, a pedido do
    Rui, com `rui/formulario-contacto`, `rui/email-rotulo-origem` e
    `rui/scraper-fix`. O trabalho do scraper que não estava no `main` ficou
    guardado na etiqueta `arquivo/scraper-fix`. Ficou o recado para o Henrique:
    quando voltar a ligar a Vercel ao GitHub, pôr o ramo de produção em `main`.
  - A 14/09/2026 o nexugal.com mostra o ramo `rui/site-branco` (ver 7.0), numa
    publicação feita a partir de uma pasta local: o site traz uma alteração do
    Henrique que só foi commitada às 19h23 de 13/09, e uma cópia da página em
    cache já a mostrava às 19h22.
  - **Por confirmar com o Henrique:** se a Vercel voltou a estar ligada ao
    GitHub, e com que ramo de produção. Há dois indícios de que não. O `4e00f5f`
    chegou ao GitHub depois da publicação de 13/09, e o site continuou a indicar
    o `d3f292e`. E a 14/09, depois do push do `e2abf3e` (o commit que instalou a
    secção 7), o site ficou cinco minutos seguidos no mesmo ficheiro e no mesmo
    commit. Se estivesse ligada com produção no `rui/site-branco`, esses pushes
    tinham publicado. Até haver confirmação, não assumir nada: publicar
    é um passo à parte, e depois de cada push para o `rui/site-branco` ver se o
    site mudou de commit (como, logo abaixo). Se mudar, a Vercel está a publicar
    a cada push, e a partir daí o push para esse ramo pede confirmação expressa
    do Rui.
  - **A 18/09/2026 o Rui publicou à mão o `2af828b`** (o fim do lote de 18/09,
    7.9). Durante os 6 minutos a seguir ao push desse commit o site continuou
    no `d3f292e`; mais tarde o site passou a indicar `2af828b`
    (`main.8c01c5da.js`), e a imagem de partilha servida traz `Last-Modified`
    de 18/09 às 18h09 GMT (19h09 em Lisboa). O Rui disse "publico eu". Desde
    então o site público mostra tudo até ao `2af828b`; o que vier depois não
    está publicado até ele publicar outra vez.

  Para confirmar o que está mesmo online: descarregar o `static/js/main.*.js`
  do site e procurar lá dentro `REACT_APP_VERCEL_GIT_COMMIT_SHA` e
  `VERCEL_GIT_COMMIT_REF`. **Isso diz de que commit e de que ramo saiu o build,
  mas não prova que a Vercel esteja ligada ao GitHub:** uma publicação à mão,
  feita numa pasta com git, também grava essas marcas. E numa publicação à mão
  o commit indicado pode não ser o conteúdo: a de 13/09 diz `d3f292e` e mostra
  o `4e00f5f` (7.0). Para ter a certeza, procurar também no ficheiro um texto
  que só exista no commit que se quer confirmar. O cabeçalho `Last-Modified` da
  página muda de cópia para cópia em cache (a 14/09 viram-se 13/09 às 18h22 e
  14/09 às 03h48, em GMT): serve de limite, não de hora exata da publicação.
- **Railway:** corre o backend (`backend/Procfile` → `uvicorn main:app`) e a
  base de dados Postgres. Visto a 06/09/2026: todas as publicações do backend
  são `railway up` feitas à mão, nenhuma veio do GitHub; um merge no `main` não
  republica nada. Nessa data o painel mostrava um período de experiência
  ("Limited Trial") a acabar por volta de **19/09/2026**. Se acabar, o site
  continua a abrir, mas o formulário deixa de gravar contactos, sem aviso.
  Confirmar com o Henrique se já passou a plano pago.
- **GitHub:** repo público, na conta pessoal do Henrique. O Rui é collaborator.
  Ramos a 14/09/2026: `main` e `rui/site-branco`.

---

## 7. Ponto de situação do ramo `rui/site-branco` (14/09/2026, atualizado a 18/09)

Esta secção existe para uma sessão nova continuar o trabalho sem o Rui ter de
explicar tudo outra vez. Está escrita para quem nunca viu o projeto. Onde uma
escolha tem uma razão, a razão está escrita: é ela que impede alguém de
"arrumar" uma coisa que foi feita assim de propósito.

O ramo saiu do `main` no commit `f5d9bd8`, a 10/09/2026. Tem onze commits deste
trabalho (`f59a87e` a `cfdd340`, de 10/09 a 11/09) e dois do Henrique por cima
(7.0). **Ainda não houve Pull Request nem merge: o `main` não tem nada disto.**

Os pedidos foram feitos pelo Rui numa só conversa com o Claude, de 09/09 a
14/09/2026. Dois commits (`61423f6` e `b7fde65`, a paleta afinada e o hero
novo) foram feitos noutra sessão de Claude entre dois pedidos dessa conversa, e
o Rui aprovou o resultado ("O hero está construído e está bom").

**A 15 e 16/09/2026**, numa conversa nova, o Rui pediu as correções urgentes
(7.2, pontos 1, 2 e 3) e o texto que o Google e o WhatsApp veem (pontos 5 e 6).
Entraram em `ba203b3` e `18a2135`, e estão descritos em 7.6, com o que ficou em
aberto. **A 18/09**, na mesma conversa, o Rui respondeu ao que ficou em aberto e
pediu mais quatro coisas e a imagem de partilha nova: `bb60c3e` e `dab9c1d`,
descritos em 7.7. Mais tarde no mesmo dia, o fecho do lote (marca em "Nexugal",
`manifest.json`, foto órfã): `2ed76ff`, em 7.8; e a marca no texto das
páginas: `e442e27`, em 7.9. O Rui publicou nessa noite (secção 6) e mandou uma
imagem de partilha nova para o corte do WhatsApp: `1c83972`, em 7.10. Onde 7.1
a 7.5 foram escritos antes disso, está assinalado.

### 7.0 Antes de mais: o Henrique trabalhou neste ramo, e o site público já o mostra

**O Henrique trabalhou no mesmo ramo `rui/site-branco` e já publicou.** A
13/09/2026 fez dois commits por cima do trabalho descrito abaixo:

| Commit | O que diz a mensagem | Ficheiros |
|---|---|---|
| `d3f292e` | corrige o SEO: desce a versão do `react-helmet-async`, junta uma sincronização direta com o DOM e corrige as propriedades das rotas | `CLAUDE.md`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/public/index.html`, `frontend/src/App.js`, `frontend/src/components/SEO.js` |
| `4e00f5f` | a secção Sobre passa a mostrar um só fundador, com a fotografia do Rui | `frontend/public/images/rui.jpg`, `frontend/src/components/About.js`, `frontend/src/i18n/translations.js` |

**Essas alterações não estão refletidas nesta secção.** A sessão que a escreveu
acabou o seu trabalho no `cfdd340` e não reviu nem testou o código do Henrique
(só leu o efeito novo do `SEO.js`, para escrever 7.2, ponto 5).
Só avançou o ramo até `4e00f5f` para escrever este texto por cima da versão mais
recente do `CLAUDE.md`, sem apagar a nota que ele deixou na secção 5.

O que se sabe sem rever o código:

- O Sobre mostrava duas silhuetas cinzentas, sem fotografia (Rui Machado e
  Henrique Fernandes, "Sócio fundador"). Passou a um fundador, com fotografia.
- O `SEO.js` passou de 346 para 432 linhas, e o `package.json` pede agora o
  `react-helmet-async` na versão `^1.3.0`.
- As rotas `/sobre` e `/us/about` saíram deste trabalho com o SEO da página
  inicial (`page="home"`); as da política de privacidade já estavam assim no
  `main`. O Henrique corrigiu para `about` e `privacy`.
- **O nexugal.com já mostra este ramo.** Verificado a 14/09/2026 no ficheiro
  `static/js/main.*.js` do site: traz `VERCEL_GIT_COMMIT_REF: "rui/site-branco"`
  e o commit `d3f292e`, e já contém o Sobre novo, que só entrou no git às 19h23
  de 13/09, no `4e00f5f`. Uma cópia da página em cache já o mostrava às 19h22
  (hora de Lisboa). Na prática, o que está online é o `4e00f5f`. **Os pendentes
  de 7.2 estão à vista
  de quem visita o site.**

**Quem continuar tem de, primeiro:**

1. `git fetch origin` e `git checkout rui/site-branco`. Uma sessão nova pode
   abrir noutro ramo, e o `main` não tem nada disto.
2. `git pull`
3. `git log --oneline cfdd340..HEAD`, para ver tudo o que entrou depois do fim
   deste trabalho: os dois commits do Henrique, o commit que instalou este texto
   e o que tiver vindo depois. O que for posterior a este texto não está
   descrito aqui.
4. `git diff cfdd340..HEAD -- frontend/src frontend/public/index.html frontend/package.json`,
   para ver o que mudou no código.
5. `npm install` na pasta `frontend`. A 14/09 a pasta `node_modules` desta
   máquina ainda tinha a versão 2.0.5 (`npm ls react-helmet-async` dizia "invalid").
6. Tratar como "por confirmar" tudo o que abaixo se diz sobre o SEO e sobre a
   página do Sobre. Onde a versão do Henrique contradisser este texto, vale a
   dele, que é mais recente. (Atualizado a 16/09: o SEO foi confirmado e revisto,
   7.2, ponto 5, e o Sobre passou a auditoria de contraste, 7.6.)

### 7.1 O que foi feito, por ordem

A numeração segue a lista do Rui, não o calendário. Pela ordem dos commits: a
paleta (noite de 09 para 10/09), o hero, a revisão das outras páginas, as
correções da FAQ e da política junto com afinações do hero (10/09, até às 14h),
o botão flutuante, a secção de exemplos e o Sobre (tarde de 10/09), e as
afinações dos exemplos (madrugada de 11/09).

#### 1. A paleta branca e os tokens (`f59a87e`, `61423f6`)

**Antes:** fundo preto com um ciano néon (`cyan-neon`, `#00D1FF`) e brilhos. Não
havia tokens: as cores estavam escritas à mão dentro dos componentes, em classes
soltas do Tailwind (`text-cyan-neon`, `text-white`, `bg-black`,
`border-white/10`), cerca de 650 vezes em 17 ficheiros, mais uma dúzia de sombras
em `rgba(0,209,255,...)` e alguns fundos em hexadecimal.

**Agora:** fundo branco com detalhes em azul, e **a paleta num sítio só**,
`frontend/tailwind.config.js` (`theme.extend.colors`), repetida como variáveis
CSS em `frontend/src/index.css` (`:root`) para o pouco estilo que não passa pelo
Tailwind. **Mudar uma cor obriga a mudá-la nos dois sítios**, e ainda nos
hexadecimais escritos à mão dentro de SVG (ver 7.4).

| Token | Valor | Para quê | Contraste sobre branco |
|---|---|---|---|
| `azul-profundo` | `#0F2E5C` | títulos e texto forte | 13,41 |
| `azul-medio` | `#1B5AA8` | botões, ligações, texto pequeno de destaque | 6,83 |
| `azul-vivo` | `#1595DC` | acentos: **só** texto grande (24px, ou 18,66px a negrito) e ícones | 3,30 |
| `azul-claro` | `#4FA3DC` | linhas, setas, barras de apoio | 2,76 (dívida, ver 7.2) |
| `neve` | `#F4F7FB` | fundos alternados e faixas | |
| `linha` | `#DCE5EF` | contornos e separadores | |
| `texto` | `#42506A` | texto corrido | 8,12 |
| `suave` | `#5C6B85` | texto secundário e legendas | 5,39 |
| `alerta` | `#C2410C` | só onde alguma coisa está mal (ver 7.3) | 5,18 |
| `alerta-fundo` | `#FFF4EE` | preenchimento do que está assinalado | |
| `alerta-linha` | `#F0C9B3` | contorno do que está assinalado | |

Notas que não se veem na tabela:

- Os oito primeiros tokens foram pedidos pelo Rui com estes valores, exceto o
  `suave`, que ele pediu `#7C8AA3`. Esse dava 3,49 sobre branco (3,25 sobre
  neve) e chumbava em qualquer texto abaixo de 24px. O Claude propôs `#5C6B85`;
  a troca entrou no `61423f6`, e o Rui assumiu-a no lote seguinte ("agora que o
  suave é #5C6B85 e já passa contraste").
- O `azul-vivo` chumba em texto pequeno: falhava nos números dos passos do
  "Como trabalhamos", em 12 sítios da política de privacidade e no email. Regra
  que ficou: só em texto grande e em ícones. O texto pequeno azul é `azul-medio`.
- Os três tokens de alerta entraram a 10/09, com os blocos de exemplos. O
  `alerta` dá 4,79 sobre o seu próprio fundo e 4,82 sobre neve.
- Sombras `shadow-azul` e `shadow-azul-lg`, em azul-profundo diluído, no lugar
  dos brilhos de néon.
- Tipografia sem alterações: Space Grotesk nos títulos (`font-display`), Inter
  no texto (`font-sans`), Orbitron só no logótipo NEXUGAL (`font-orbitron`).
- Ritmo das secções: `neve` nas faixas do "Como trabalhamos" e do rodapé, e nos
  blocos pares dos exemplos (e nos cartões dos fundadores, no Sobre). O resto é
  branco. Sem os fundos pretos, o site ficava uma parede branca sem separação.

O que saiu, e porquê:

- O néon e os brilhos: só o fundo preto os aceitava.
- As três manchas desfocadas a 3% e 4% de opacidade (convite final, rodapé,
  política de privacidade) e as três "partículas" do convite final. Nas palavras
  do Rui: "No branco leem-se como sujidade no ecrã".
- O `text-justify`, **do site inteiro**, não só no telemóvel. Sem hifenização
  abria rios de espaço entre palavras em qualquer largura (a 1920px já se viam
  nos cartões do "Como trabalhamos"), e o site tem colunas estreitas em quase
  todo o lado. O texto passou a alinhado à esquerda.
- A sombra escura de `.texto-sobre-video`, que segurava texto branco sobre o
  vídeo do hero. Mais tarde o vídeo também saiu do hero.

Regras de desenho que ficaram:

- **Uma só receita de botão cheio**, a do hero, sem contorno:
  `rounded-full bg-azul-medio px-9 py-4 text-sm font-semibold tracking-[0.06em] text-white shadow-azul transition-colors duration-300 hover:bg-azul-profundo active:scale-95 sm:text-base`.
  Está no hero, no convite final, na página da FAQ e no fecho dos exemplos.
  Antes havia três construções diferentes para o mesmo botão (hero, convite
  final, cookies). Variações que existem: o aviso de cookies usa uma versão
  pequena (`px-5 py-3 text-xs`, com `tracking-[0.1em]`); o botão flutuante usa
  essa versão pequena até aos 640px, com `shadow-azul-lg`, e só chega ao tamanho
  de letra do hero aos 768px. **O botão de envio do formulário de contacto não
  segue a receita**: ocupa a largura toda, tem contorno e `tracking-[0.15em]`.
- **O maior tipo do site tem de estar na primeira dobra** (regra do Rui). Os
  títulos das secções vão até 48px; o do convite final estava a 60px e desceu
  para 48px, como o do hero.
- Os avisos de erro, que estavam em tons claros (400) feitos para fundo escuro,
  passaram a tons 600 e 700.
- Os placeholders do formulário em `suave`.
- `public/index.html` (`theme-color`) e `public/manifest.json` passaram ao
  branco e ao azul-profundo. O CSS do chatbot desligado foi pintado de branco na
  mesma.

#### 2. O hero novo, com o esquema de integrações (`b7fde65`, `5406da6`, `ef99465`, `07f357e`, `9ae1046`)

**O pedido do Rui:** título "Deixe a sua empresa andar sozinha", subtítulo, botão
cheio "Falar connosco", ligação "Ver exemplos", e à direita um esquema desenhado
(não uma imagem): quatro origens a convergir num círculo com o N da Nexugal, e
daí para um cartão de resultado. Por trás, uma forma azul orgânica, discreta.

Na construção saiu também o vídeo de fundo do hero, com o véu branco a 95% que
só lá estava para o texto azul se ler. Não foi pedido pelo Rui: na fase A o
Claude tinha avisado que o vídeo sairia na fase B, e o véu com ele. O vídeo
continua por trás do contacto e da FAQ, com um véu branco por cima.

**`frontend/src/components/Hero.js`**, duas colunas:

- Esquerda: título que se escreve letra a letra (`useTypewriter`); subtítulo;
  botão "Falar connosco" (`id="cta-hero"`, vai para `/contacto` ou
  `/us/contact`); ligação "Ver exemplos", que desce até `#exemplos` com scroll
  suave (sem animação se o sistema pedir menos movimento).
- Direita: `<EsquemaIntegracoes esquema={t.hero.esquema} />`.
- Por trás: `MancaFundo`, a forma azul no canto superior direito, a 50% de
  opacidade, desfocada e com uma máscara que a apaga na direção do cartão, para
  o cartão ficar sempre sobre branco.
- Grelha: `lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]` e, a partir de
  1280px, `xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]`: deitado, o esquema
  precisa de mais largura do que o texto.

**`frontend/src/components/EsquemaIntegracoes.js`**, o desenho:

- Recebe tudo pela propriedade `esquema`: `descricao` (lida só por leitores de
  ecrã), `origens` e `resumo`.
- **A partir de 1280px (`xl`), deitado:** coluna de caixas de origem, setas
  curvas a convergir (`SetasConvergentes`), círculo com o N
  (`/images/nexugal-n.png`), seta de saída (`SetaSaida`) e cartão. O desenho
  gasta 368px fixos (caixas 164, setas 76, círculo 88, seta de saída 40) e o
  cartão fica com o resto: 339 × 271px a 1280, 1440 e 1920px, porque o contentor
  (`max-w-7xl`, igual ao das outras secções) para de crescer aos 1280px.
- **Abaixo de 1280px, a "maqueta A":** as origens numa fila de peças (símbolo
  num quadrado, nome por baixo), uma seta por origem a descer em leque até ao
  círculo (`LequeDescendente`), seta para baixo, cartão. As medidas estão todas
  em `FILA`: até quatro origens, peça de 66px e nome a 11px; com cinco, 57px e
  10px. O número de origens é `origens.length`, não peças escritas à mão.
- **Porque é que o corte está em 1280 e não em 1024:** deitado, o esquema gasta
  largura fixa e o cartão fica com o que sobra. Com o esquema a 420px, como
  estava então, o cartão ficava com 46px de largura a 1024px, e com 117 × 720px a
  1152px, com a legenda fora do ecrã ("Um portátil de 13 polegadas cai
  exatamente aí", disse o Rui). Encolher o esquema não chegava; empilhar resolve
  de raiz. Empilhado, o cartão tem 384 × 270px a 1024 e a 1152px.
- **Porque é que o esquema encolheu de 420 para 368px:** acima de 1280px o
  cartão ficava preso nos 187px, pior num monitor grande do que num portátil.
  Critério do Rui: a 1440 e a 1920px, "47 faturas lançadas, 2 por rever" numa
  linha só e a legenda numa linha só. Para lá chegar encolheram as peças do
  esquema e a coluna dele ganhou largura. **O Rui proibiu alargar o contentor
  do hero**, para ficar alinhado com o resto da página.
- **Cartão (`Cartao`):** cabeçalho com `titulo` e `entrega` (opcional); linhas
  com `texto`, `destaque` opcional (azul-medio a negrito, "3 à espera de si") e
  `nota` opcional (segunda frase, mais pequena, dentro da mesma linha); legenda
  por baixo (`rodape`, 13px, cor `suave`, a 16px do cartão).
- **Números com peso (`comNumeros`):** os números saem sozinhos em Space
  Grotesk a negrito. A expressão `MOEDA` apanha "18 420 €" e "€18,420". Onde o
  peso vai para uma coisa que não é um número solto ("8/09", "2 dias"), marca-se
  entre asteriscos no `translations.js`: adivinhar obrigava a função a conhecer
  as palavras de cada língua. Há uma regra que morde, em 7.4.
- Símbolos: só `email`, `excel`, `erp` e `whatsapp`, os do hero. Os outros nove
  foram apagados a pedido do Rui a 11/09.

Conteúdo, com as regras que o Rui fixou:

- Origens: Email, Excel, O seu ERP, WhatsApp. **"O seu ERP" é genérico de
  propósito: nenhuma marca de ERP. Nenhum logótipo de outras empresas no hero.**
- A ordem das origens é a ordem das linhas do cartão, e é ela que emparelha cada
  origem com o seu resultado. Mexer numa obriga a mexer na outra (há um
  comentário no `translations.js`).
- Subtítulo: "A informação que anda espalhada junta-se num só sítio, sem ninguém
  copiar nada." A primeira versão dizia "espalhada por quatro sítios"; saiu
  porque prendia o texto ao número de caixas do esquema.
- Cartão: "O seu resumo de segunda-feira / chega ao email às 7h30"; "47 faturas
  lançadas, 2 por rever"; "3 artigos em rutura de stock" com a nota "fornecedor
  alertado a 8/09, sem resposta há 2 dias"; "18 420 € vendidos, 6 310 € por
  receber"; "20 pedidos respondidos, 3 à espera de si". Legenda: "agende este
  resumo ao seu gosto".
- **18 420 € e 6 310 € ficam exatamente assim.** Não arredondar, não inventar outros.
- **O cartão tem quatro linhas, uma por origem.** A nota do stock é uma segunda
  frase dentro da mesma linha, não uma quinta linha.
- **A nota do stock é deliberada:** mostra que o sistema agiu sozinho e continua
  a contar os dias. Não suavizar para "pronto a enviar" nem para "a aguardar
  aprovação". Fica na cor `texto`, com "8/09" e "2 dias" a negrito em
  azul-profundo, como os outros números do cartão (escolha do Claude, reportada
  ao Rui).
- Inglês: "Let your business / run on its own", "Talk to us", "See examples";
  "Sep 8" em vez de "8/09" (um americano lê 9 de agosto); "€18,420" e "€6,310".

#### 3. O botão flutuante de contacto (`fc7494f`)

`frontend/src/components/BotaoContactoFlutuante.js`, montado no `App.js` só na
página inicial. Mesmo texto e mesmo destino do "Falar connosco" do hero.

- **Aparece** quando o botão do hero (`#cta-hero`) sai do ecrã. Enquanto o do
  hero estiver à vista, não existe.
- **Desaparece** quando a secção final de contacto (`#contacto-final`, no
  `CallToAction.js`) entra em vista, com uma margem que o faz sair um pouco antes
  (`rootMargin: '0px 0px -25% 0px'`). **Volta a aparecer** se a pessoa subir.
- **Não aparece enquanto o aviso de cookies estiver no ecrã.** O Rui deu a
  escolher entre esconder o botão ou subi-lo acima do aviso. O Claude escolheu
  esconder: o aviso é uma decisão a tomar primeiro e já traz dois botões seus,
  desaparece para sempre depois da resposta, e subir o botão punha-o a meio do
  ecrã e obrigava a adivinhar a altura do aviso, que muda entre PT e EN. O
  `CookieBanner.js` anuncia quando entra e sai pelo evento
  `nexugal:aviso-cookies`, através de `utils/avisoCookies.js`. O consentimento
  fica guardado no browser, na chave `nexugal_cookie_consent`.
- Decide com `IntersectionObserver` sobre os próprios elementos (porquê, em 7.3).
- **Os estados iniciais são os que o mantêm escondido:** até o observador
  responder, assume-se que o botão do hero está à vista e que a secção final não
  está. Se o observador nunca disparar (browser antigo, separador suspenso), o
  pior que acontece é o botão não aparecer. A primeira versão fazia o contrário
  e punha o botão por cima do do hero, no topo da página; foi apanhado na
  verificação.
- Computador: a 32px do canto inferior direito, com `shadow-azul-lg` para se
  destacar do branco. Telemóvel: botão pequeno a 20px do canto, **não uma barra
  da largura toda**. `z-40`, abaixo do aviso de cookies.
- Escondido, fica transparente, não recebe cliques, tem `aria-hidden` e sai da
  ordem do teclado (`tabIndex -1`). Entra e sai com uma transição de 300ms, sem
  transição com `prefers-reduced-motion`.

No mesmo commit:

- "CONTACTO" no menu do cabeçalho, a seguir a FAQ, no computador e no
  telemóvel, com o destino do botão do hero.
- **O vazio entre o hero e a secção seguinte.** O Rui mediu cerca de 390px de
  nada e pediu para apertar "com moderação: quero uma pausa, não quero as duas
  secções coladas", no computador e no telemóvel, sem mexer no espaçamento entre
  as outras secções. Medido do fim do conteúdo do hero ao rótulo da secção
  seguinte: de 224 para 128px no computador, de 160 para 96px no telemóvel. Hoje
  isso vive no `pb-12 lg:pb-16` do hero e no `pt-16 md:pt-20` do cabeçalho dos
  exemplos.

#### 4. A secção de exemplos (`5b15a40`, `51277f8`, `cfdd340`)

Substituiu a grelha de seis cartões "Nossos Serviços". Saíram o `Services.js`, o
`utils/destaqueServico.js` e a animação `destaque-servico` do CSS, que só
serviam para acender um cartão quando se chegava a ele. **O bloco `services:` do
`translations.js` ficou** (título, descrição e os seis itens da grelha antiga,
em PT e EN), mas já não aparece em lado nenhum: o rodapé usa o seu próprio
`footer.services`. Para mudar o que o site mostra sobre serviços, o sítio é
`exemplos.blocos[]`.

Passou por três versões no mesmo ramo. Os guiões e a referência são ficheiros do
Rui, fora do repositório (7.3, "De onde vêm os textos").

1. `5b15a40`, guião v2: seis blocos, todos com o `EsquemaIntegracoes`. O Rui
   pediu expressamente para reutilizar esse componente e não escrever outro, e
   ele cresceu para isso: dados por propriedade, linha de entrega opcional,
   altura calculada pelo número de origens, nove símbolos novos, e o realce
   marcado à mão a mandar na linha.
2. `51277f8`, referência v3: quatro blocos, cada um com o seu desenho, e o
   esquema de volta a ser só do hero. Saiu o bloco das cópias de segurança e
   acessos, e os blocos de respostas e de encomendas fundiram-se em "Pedidos de
   clientes", porque partilhavam quase todas as origens. A razão está em 7.3.
3. `cfdd340`: afinações de texto pedidas pelo Rui, o bloco do stock refeito, os
   nove símbolos órfãos apagados e os logótipos na tira.

**`frontend/src/components/Exemplos.js`** (`id="exemplos"`):

- Cabeçalho: rótulo "EXEMPLOS", título "Isto é o que fazemos, em concreto",
  subtítulo "Alguns exemplos do que fazemos.". Uma frase só, por decisão do Rui:
  a anterior ("Quatro situações que se repetem em quase todas as empresas...")
  dava a entender que estava ali tudo o que a Nexugal faz.
- Índice: quatro etiquetas que saltam para o bloco com scroll suave (respeita
  `prefers-reduced-motion`; `scroll-mt-28` afasta o alvo do menu fixo). O nome
  "Saltar para" (`exemplos.indiceTitulo`) não se vê no ecrã: é só o
  `aria-label`, para leitores de ecrã. No telemóvel as etiquetas passam à linha
  em vez de ficarem numa barra que se arrasta para o lado: essa barra esconderia
  as de trás sem avisar, e o índice existe para mostrar de uma vez o que a
  secção tem.
- Quatro blocos, com fundos alternados branco e neve. Blocos 1 e 3: texto à
  esquerda, desenho à direita. Blocos 2 e 4: desenho à esquerda. Em coluna única
  o texto fica sempre por cima, porque quem lê precisa da história antes do
  desenho. **As alturas dos desenhos variam de propósito** (o Rui pediu para não
  as uniformizar).
- Cada bloco: rótulo pequeno da tarefa, a dor como título, a explicação por baixo.
- Fecho: "Tem tarefas que se repetem todas as semanas e comem tempo a alguém?
  Conte-nos qual é. Muitas vezes há forma de ganhar esse tempo." e o botão
  "**Entre em contacto**" (aqui não é "Falar connosco", decisão do Rui), que leva
  a `/contacto` ou `/us/contact`.
- Tira de ferramentas, uma só, no fim.

**Os blocos** vivem no `translations.js`, em `exemplos.blocos[]`, com `id`,
`visual`, `indice`, `rotulo`, `dor`, `explicacao` e `arte` (os dados do desenho,
diferentes em cada um). **`frontend/src/components/VisuaisExemplos.js`** escolhe
o desenho pelo nome em `visual` (mapa `VISUAIS`). A `arte.descricao` é lida só
por leitores de ecrã.

1. **Contabilidade e faturação** (`papel`). Dor: "Alguém passa duas manhãs por
   mês a lançar faturas de fornecedor." Pilha de faturas tortas em SVG, com a
   legenda "Não interessa como chega, em PDF, em papel ou numa foto." (13px, cor
   `texto`, 8,12 para 1: o Rui pediu-a maior e mais escura); seta; tabela em HTML
   com cabeçalho azul-profundo (FORNECEDOR, DOC, VALOR), três linhas preenchidas
   e duas por preencher, desenhadas como barras; resumo "214 faturas lançadas
   sozinhas em setembro, 3 precisaram de si", com o 214 e o 3 a negrito. **A
   palavra "sozinhas" é o argumento todo**, nas palavras do Rui: "Sem ela o
   número não prova nada." No telemóvel: pilha em cima, seta para baixo, tabela
   com a largura toda (lado a lado, a tabela ficava com 150px e as colunas
   colavam-se).
2. **Pedidos de clientes** (`conversa`). Dor: "As mesmas cinco perguntas todos
   os dias, e as encomendas anotadas num papel." Bolha do cliente (branca, com
   contorno), resposta já escrita (azul-profundo, texto branco), uma linha a
   separar, e os contadores 34 "mensagens tratadas hoje" e 0 "chamadas
   atendidas" (o 0 realçado), mais "5 à espera de si". A etiqueta "à espera de
   aprovação" que havia por baixo da resposta foi retirada a pedido do Rui, sem
   nada no lugar. No telemóvel: conversa em cima, números por baixo, linha
   horizontal (lado a lado, as bolhas ficavam com 170px e o texto partia-se a
   cada duas palavras).
3. **Stock e compras** (`discordancia`). Dor: "O stock do programa diz uma coisa
   e o armazém diz outra." Um artigo só, em grande: "Correias", com os rótulos
   NO PROGRAMA e NA LOJA/ARMAZÉM (até 16/09, NA LOJA E ARMAZÉM), 19 e 12 (até
   16/09, trocados), dois números grandes em caixas com a cor de
   alerta e um sinal de diferente desenhado entre eles; por baixo, "Sete clientes
   iam comprar uma coisa que não existe."; seta; cartão "Hoje, 6h05": 5 487
   referências verificadas, 9 corrigidas sozinhas, 3 precisam de decisão. **Já
   foram quatro artigos em duas colunas.** O Rui mandou refazer: "obriga a pessoa
   a comparar número a número para descobrir onde está a diferença. Ninguém faz
   isso a passar num site." A frase dos sete clientes substituiu "antes de o
   cliente dar por isso". Abaixo de 1280px empilha (até 16/09, só abaixo de
   1024px): artigo, seta para baixo, cartão. **Os dois números nunca empilham,
   em nenhuma largura**: a diferença entre eles é o desenho todo (diz-o o
   comentário no código). Os dois pendentes que tinha foram feitos a 16/09
   (7.2, pontos 1 e 2).
4. **Números do negócio** (`margem`). Dor: "Só se sabe se o mês correu bem
   quando o contabilista fecha as contas." Barras horizontais de margem por
   artigo, semana 37, com eixo no zero: Filtros 38%, Correias 31%, Baterias 22%,
   Juntas 9%, Óleos -7%. As de 25% ou mais em azul-medio, as outras em
   azul-claro, e a negativa atravessa para a esquerda do zero, na cor de alerta.
   Remate: "Um artigo a dar prejuízo, e ninguém sabia." No telemóvel fica igual
   (nome, barra, valor): os nomes são curtos, e empilhar só ganhava altura e
   perdia a comparação. O eixo e as barras usam a mesma conta (`NO_ZERO`): antes
   estavam desalinhados 8px. As folgas `FOLGA_DIR` e `FOLGA_ESQ` existem porque,
   a 380px, a etiqueta "38%" saía do ecrã.

**A tira de ferramentas** ("Fazemos integrações com") está em
`exemplos.tira.ferramentas[]`, cada entrada com `id`, `nome` e `logo` opcional.
Com `logo` sai imagem, a cinzento e discreta (`h-6 opacity-60 grayscale`), com o
nome como texto alternativo; sem `logo` sai o nome escrito. Em
`frontend/public/logos/`: `gmail.svg`, `outlook.svg`, `excel.svg`,
`google-sheets.svg`, `cegid.svg` (para "Cegid Primavera"), `invoicexpress.png`,
`shopify.svg`, `woocommerce.svg`. O Moloni está como texto (7.2, ponto 4). A
380px a tira fica em quatro filas e nada sai do ecrã.

Ligações: "SERVIÇOS" no menu passou a "EXEMPLOS DE SERVIÇOS" (EN "SERVICE
EXAMPLES") e aponta a `#exemplos`; o "Ver exemplos" do hero aponta aqui (antes
apontava, provisoriamente, à grelha de serviços); no rodapé, "Exemplos" aponta a
`#exemplos` e a coluna de serviços lista os quatro blocos.

Inglês: escrito pelo Claude, em registo empresarial neutro, e mostrado ao Rui
para rever. Duas escolhas: "Customer requests" (e não "replies", porque o bloco
cobre perguntas e encomendas) e "Gaskets" para "Juntas" (o termo de peças).

#### 5. A página do Sobre (`5b15a40`; alterada depois pelo Henrique, ver 7.0)

A secção "quem somos" saiu da página inicial e passou a ter página própria,
`frontend/src/pages/SobrePage.js`, em `/sobre` e `/us/about`, pelo esquema de
endereços que o site já usava (o Rui pediu para não inventar um novo). A casca é
a da FAQ e do contacto: "← Voltar ao início" à esquerda, logótipo NEXUGAL à
direita, o componente `About` por baixo, rodapé pequeno.

O "SOBRE" do menu (computador e telemóvel) e o "Sobre" do rodapé apontam à
página. Não ficou nenhuma ligação à âncora antiga `#sobre`.

Nessa altura o Rui mandou manter as silhuetas dos fundadores como estavam,
apesar de a revisão de 10/09 (ver o fim de 7.1) ter notado que no branco se
liam como página por acabar. O Henrique trocou-as a 13/09 por um fundador com
fotografia.

#### 6. As correções da FAQ e da política de privacidade (`ef99465`, `07f357e`)

**FAQ** (`faq.items` no `translations.js`, sete perguntas por língua). O Rui
pediu **quatro correções, "nem mais uma"**:

- **Processo:** a resposta dizia 5 etapas (Diagnóstico, Estratégia, Execução,
  Deploy, Evolução) e a secção "Como trabalhamos" mostra 4 (Diagnóstico,
  Planeamento, Desenvolvimento, Acompanhamento). "Quem ler as duas apanha a
  contradição." Reescrita com os quatro nomes da secção, pela mesma ordem, e com
  o conteúdo tirado dos próprios cartões, sem acrescentar etapas, prazos nem
  compromissos. Saíram com ela o "Deploy" e o "zero downtime".
- **Garantias:** "garantimos que tudo funciona na perfeição" passou a "aplicamos
  atualizações de segurança e corrigimos o que for aparecendo". Regras do Rui
  para frases deste tipo: nada de garantias absolutas, nada de "perfeição",
  "sempre", "100%" ou "totalmente", nada de números, prazos, SLA ou percentagens
  inventados. "Diz o que se faz, não o que se promete."
- **Vocabulário:** "monitoramento" (português do Brasil) passou a
  "monitorização"; "definimos um roadmap claro com prazos detalhados para cada
  etapa" passou a "dizemos o que fica pronto em cada etapa e quando".
- **Âmbito geográfico:** a frase a apagar ("clientes em todo o território
  português e também no Brasil", "qualquer parte do mundo") era a resposta
  inteira à pergunta "Em que regiões a NEXUGAL opera?". O Claude parou e
  perguntou; o Rui mandou **apagar a pergunta inteira**, em PT e EN. A decisão é
  não declarar limite geográfico nenhum na FAQ: nem Braga, nem Portugal. Vale só
  para a FAQ: Braga continua como morada no `translations.js`, no `SEO.js`, na
  política de privacidade, no admin, no `public/index.html` e no
  `manifest.json`, e isso não foi discutido.

O "suporte técnico contínuo 24/7" ficou, por decisão do Rui. **O resto da FAQ não
se tocou**, também por decisão, apesar de a revisão de 10/09 ter apontado outras
frases ambiciosas ("gama completa de serviços tecnológicos", "desde startups e
PMEs até grandes corporações").

**A FAQ estava escrita duas vezes:** no `translations.js` e, à mão, no `SEO.js`,
para o JSON-LD. O `SEO.js` passou a ler `translations[lang].faq.items` e encolheu
de 412 para 346 linhas. A prova de que ficou uma fonte só: a pergunta das regiões
foi apagada só no `translations.js` e desapareceu dos dois lados.

**Política de privacidade** (`frontend/src/pages/PrivacyPolicyPage.js`):

- Dizia que o telefone e a empresa eram opcionais, e são obrigatórios desde o
  commit `d68c6be`, e não falava do "Como soube de nós?". Foi corrigida pelo
  código do formulário, campo a campo: nome, email, telefone, empresa e "Como
  soube de nós" obrigatórios; mensagem facultativa; o idioma segue no envio. É
  uma questão de RGPD, não uma gralha. Há um comentário no ficheiro a lembrar que
  esta lista tem de acompanhar o `ContactPage.js`.
- "Última atualização" passou de agosto de 2025 a setembro de 2026.

**Travessões.** Regra da casa, nas palavras do Rui: "não existem travessões em
texto nenhum do site". Saíram 10 da resposta das etapas (5 em PT e 5 em EN) e
outros 10 da cópia dessa resposta que estava no `SEO.js`; depois, 14 da lista
dos direitos da política, 9 dos títulos e descrições do `SEO.js`, 2 de
`aria-label` e 1 de um placeholder do admin. (A revisão de 10/09 tinha contado
só 2 na resposta das etapas; eram 10.) Em `frontend/src/` só restam dentro de
comentários. **Ficaram de fora os do `public/index.html`** (7.2, ponto 6).

No mesmo lote saiu o espaço a mais em "Fale   Connosco", na página de contacto.

#### A revisão das outras páginas (10/09), e o que ficou de fora

Com o hero feito, o Rui pediu uma lista, sem corrigir nada, do que estava mal
nas outras páginas vistas já com o site branco. Saíram 15 pontos, e quase todos
entraram nos lotes seguintes (pontos 1 e 6 acima).

Ficaram de fora **por decisão expressa do Rui**:

- a linha que liga os passos do "Como trabalhamos" no telemóvel (a "linha
  órfã"), que corre solta pela esquerda, a 30px dos cartões, sem tocar em nada.
  No computador passa por trás dos cartões e funciona;
- as silhuetas dos fundadores (entretanto trocadas pelo Henrique);
- o 24/7 e o resto da FAQ, para lá das quatro correções.

Não entrou em nenhum lote: a tabela de cookies da política de privacidade, que a
380px é mais larga do que o ecrã e se arrasta para o lado dentro da própria
caixa (`overflow-x-auto`). Funciona, é só desconfortável.

### 7.2 O que ficou pendente

Por ordem de importância, como estava a 14/09. **Atualizado a 16/09:** os pontos
1, 2 e 3 estão feitos, o 5 e o 6 feitos em parte, e os pontos 11 a 14 são novos.
**Atualizado a 18/09:** o 6, o 12 e o 13 estão fechados e o 14 feito em parte
(7.7). O Rui publicou o `2af828b` ao fim do dia 18/09 (secção 6): o que está
feito até aí já está no site público; a imagem de partilha nova (7.10) ainda
não.

**Antes de tudo, fora do frontend:** o período de experiência do Railway estava
a acabar por volta de 19/09/2026 (secção 6). Se acabar, o formulário deixa de
gravar contactos, sem aviso. Não é trabalho para esta pasta: lembrar o Rui para
confirmar com o Henrique se já passou a plano pago.

#### 1. O bloco do stock transborda entre 1024 e cerca de 1100px (FEITO a 16/09, `ba203b3`)

**O problema**, medido a 11/09/2026 no bloco "Stock e compras":

| Largura | Painel do artigo | Caixa de cada número | Largura do "12" | Rótulos | Resultado |
|---|---|---|---|---|---|
| 1024px | 155px | 31px | 46px | 2 e 4 linhas | **os números saem das caixas** |
| 1152px | 229px | 67px | 46px | 2 e 2 linhas | cabe |
| 1279px | 302px | 104px | 46px | 1 e 2 linhas | cabe |

**A causa:** em `VisualDiscordancia` (`frontend/src/components/VisuaisExemplos.js`)
o painel do artigo, a seta e o cartão ficavam lado a lado a partir de `lg`
(1024px), com o cartão em largura fixa (240px), tudo dentro da coluna do desenho.

**O que se fez:** o desenho empilha até `xl` (1280px), a mesma solução do esquema
do hero. O componente `Seta` recebe agora o ponto de corte por parâmetro
(`corte="lg"` por omissão, `corte="xl"` no stock) e escolhe entre pares de
classes escritos por extenso (`CORTE_SETA`), porque o Tailwind só gera as classes
que estão escritas literalmente. A versão antiga comparava texto e, com
`'hidden xl:block'`, a seta para baixo nunca aparecia. O bloco 1 (`VisualPapel`)
continua em `lg`.

**Medido a 16/09**, no build de produção, com o número em texto (`Range`) contra
a caixa:

| Largura | Disposição | Caixa de cada número | "19" e "12" | Seta |
|---|---|---|---|---|
| 380px | empilhado | 119px | 47 e 46px, dentro | para baixo |
| 1024px | empilhado | 195px | dentro | para baixo |
| 1152px | empilhado | 232px | dentro | para baixo |
| 1279px | empilhado | 268px | dentro | para baixo |
| 1280px | lado a lado | 105px | dentro | para a direita |
| 1920px | lado a lado | 105px | dentro | para a direita |

Igual em inglês (caixas de 104px a partir de 1280). Sem scroll para o lado em
nenhuma largura, e as setas do bloco 1 continuam a mudar em 1024px. **Ficou uma
coisa por resolver no rótulo inglês**, em 7.6.

#### 2. Os números do stock trocam de lado: 19 no programa, 12 na loja e armazém (FEITO a 16/09, `ba203b3`)

O porquê: com 12 no programa e 19 na loja e armazém, a frase de baixo não batia
certo. Se o armazém tem mesmo 19, as correias existem, e ninguém ia comprar uma
coisa que não existe. Com 19 no programa e só 12 na prateleira, vende-se o que o
programa diz haver e faltam sete: "Sete clientes iam comprar uma coisa que não
existe."

`arte.numeros` passou a `['19', '12']` nas duas línguas, com um comentário no
bloco PT a explicar a ordem. No mesmo pedido o Rui mudou os rótulos: **NA
LOJA/ARMAZÉM** (EN **IN THE SHOP/WAREHOUSE**), com barra e sem espaços. A frase
não mudou.

#### 3. O comentário desatualizado no cabeçalho do `EsquemaIntegracoes.js` (FEITO a 16/09, `ba203b3`)

Dizia que o componente servia o hero e os seis blocos dos exemplos, que era "o
mesmo desenho com outro conteúdo, e não sete componentes parecidos", e citava
constantes que já não existem (`ALTURA_CAIXA`, `ESPACO`). Diz agora que serve só
o hero e que as medidas estão em `LG` e `FILA`. Só o comentário mudou. **O resto
do componente fica como está, de propósito** (o Rui disse-o a 10/09 e a 11/09):
dados por propriedade, linha de entrega opcional, número de origens como
parâmetro, realce marcado à mão, e as medidas de `FILA` com o patamar para cinco
origens.

#### 4. O Moloni está como texto na tira

O ficheiro que o Rui mandou (`wsize_moloni_logo_colors_white.svg`) tem as letras
"moloni" a branco: é a versão para fundo escuro. Na tira branca, e com o filtro
cinzento, só se via a flor. As cores do logótipo não foram alteradas: a regra do
Rui para os logótipos é não inventar substitutos nem usar imagens de outro sítio.

**Para fechar:**

1. Arranjar a versão do logótipo para fundo claro, em SVG.
2. Guardá-la como `frontend/public/logos/moloni.svg`.
3. No `translations.js`, na entrada `{ id: 'moloni', nome: 'Moloni' }`, acrescentar
   `logo: '/logos/moloni.svg'`, **nas duas línguas** (a tira está repetida em PT e EN).
4. Tirar o parágrafo sobre o Moloni do comentário que está por cima de `tira`
   (só existe no bloco PT).
5. Ver a 380px que a imagem carrega e a tira não parte.

Os logótipos vieram da pasta `logos/` do Rui (7.3, "De onde vêm os textos") e no
repositório ficaram com nomes curtos. Confirmado byte a byte a 14/09:
`cegid.svg` é o `cegid-logo-footer.svg` da pasta, `outlook.svg` o
`outlook-icon.svg`, `google-sheets.svg` o `google-sheets-logo-icon.svg`,
`excel.svg` o `excel-4.svg`, `gmail.svg` o `official-gmail-icon-2020-.svg`,
`invoicexpress.png` o `IX_VERDE.png`; `shopify.svg` e `woocommerce.svg` mantêm o
nome.

Onde havia dois ficheiros para a mesma ferramenta: da Cegid ficou o
`cegid-logo-footer.svg` e não o `cegid.svg` da pasta, que traz um quadrado branco
embutido e o slogan antigo em francês (o logótipo diz só "cegid"; o texto
alternativo mantém "Cegid Primavera"); do Google Sheets ficou o ícone e não o
logótipo com o nome (`google-sheets-full-logo-1.svg`), para ficar como o Gmail, o
Excel e o Outlook; do Outlook os dois ficheiros eram quase iguais e ficou o
`outlook-icon.svg` (não o `microsoft-outlook-2013-logo.svg`). Ficaram de fora o
`adobe-pdf-icon.svg` e o `whatsapp-3.svg`, que não estão na tira.

#### 5. O SEO (FEITO em parte a 16/09, `18a2135`)

**A história, por ordem:**

- **10/09:** com `react-helmet-async@2.0.5`, nada do `SEO.js` chegava ao
  `<head>` (zero `data-rh`, zero JSON-LD, título e canonical sempre os do
  `public/index.html`). O Rui decidiu não mexer.
- **13/09:** o Henrique (`d3f292e`) desceu a biblioteca para a 1.3.0, juntou um
  efeito que escreve diretamente no `<head>` e corrigiu as rotas do Sobre e da
  Privacidade, que usavam o SEO da página inicial.
- **14/09:** no site público, título e canonical certos, mas JSON-LD só numa de
  seis cargas. Parecia uma falha intermitente.
- **15/09: não era falha do site.** A biblioteca só escreve as etiquetas quando o
  browser desenha o ecrã seguinte (`requestAnimationFrame`, a opção `defer`, ligada
  por omissão). O painel de pré-visualização do Claude, escondido, não desenha
  nada, e a biblioteca nunca escrevia. A única carga boa de 14/09 foi quase de
  certeza com o painel à vista. O diagnóstico de 10/09 pode ter tido a mesma
  causa: não foi testado, e a descida para a 1.3.0 não faz mal. Com o desenho
  simulado, tudo funcionava, mas com **etiquetas repetidas**: dois canonical,
  duas descrições, dois `og:title`, os três `hreflang` fixos do `index.html` (a
  dizer sempre `/` e `/us`, mesmo na FAQ) ao lado dos certos, e `og:locale` pt_PT
  ao lado de en_US nas páginas em inglês.
- **16/09:** o Rui pediu que nenhuma página ficasse com informação
  contraditória, sem perder as pré-visualizações do WhatsApp. Feito assim.

**Cada etiqueta tem agora um só sítio que a escreve** (está também no topo do
`SEO.js`):

| Quem escreve | O quê | Porquê |
|---|---|---|
| `public/index.html` | título, descrição, `keywords`, `robots`, todas as `og:` e `twitter:`, com os valores da página inicial em PT | é o único sítio que o WhatsApp e as redes sociais leem |
| o efeito (`useEffect` no `SEO.js`) | reescreve essas mesmas: título, `lang`, descrição, `og:title`, `og:description`, `og:url`, `og:locale`, `og:locale:alternate`, `og:image:alt`, `twitter:title`, `twitter:description`, `twitter:image:alt`; e **cria** o canonical | não depende de o browser desenhar o ecrã |
| a biblioteca (`Helmet`) | só os três `hreflang` e os blocos JSON-LD | não existem no `index.html`, por isso não repetem |

O que saiu, e porquê:

- **Do `index.html`: o canonical e os três `hreflang`.** O ficheiro é o mesmo
  para todas as páginas, e lá só podiam estar errados: diziam à FAQ que era a
  página inicial. O Google desaconselha pôr um canonical no HTML e trocá-lo
  depois por JavaScript; aceita-o injetado quando o HTML não traz nenhum. Os
  `hreflang` continuam também declarados no `sitemap.xml`.
- **Da biblioteca: tudo o que o `index.html` já tem**, incluindo as cópias de
  `og:image:secure_url` e `og:image:type` que o Henrique tinha acrescentado ao
  `Helmet`. As dele no `index.html` ficaram.
- O `x-default` apontava sempre para `/`. Passou a apontar para a versão
  portuguesa de cada página (na FAQ, `/faq`): o Google só aceita o `x-default`
  se a página para onde aponta apontar de volta.
- O `og:url` fixo do `index.html` ficou em `/`: sem JavaScript todas as páginas
  mostram a pré-visualização da página inicial, e o `og:url` diz o mesmo.

**Verificado a 16/09**, no build de produção, com o desenho simulado (ver abaixo),
abrindo pelo endereço as dez páginas (`/`, `/us`, `/faq`, `/us/faq`, `/contacto`,
`/us/contact`, `/sobre`, `/us/about`, `/privacidade`, `/us/privacy`) e navegando
pelo menu de `/` para `/faq` e de volta: um só canonical, certo; nenhum `name` nem
`property` repetido; `hreflang` pt, en e x-default certos; `og:locale` certo em
cada língua; JSON-LD em todas; `FAQPage` com as sete perguntas em PT e EN.

**Como verificar:**

1. `npm install` e `CI=true npm run build`.
2. Servir a pasta `build` (configuração `nexugal-build` do `.claude/launch.json`).
   O `npm start` não serve para isto.
3. **Se o painel estiver escondido**, a biblioteca não escreve nada. Depois do
   build e antes de abrir as páginas, pôr no início do `<head>` do
   `build/index.html` (a pasta `build` é descartável e não vai para o git):
   `<script>if(document.hidden){window.requestAnimationFrame=function(c){return setTimeout(function(){c(performance.now())},16)};window.cancelAnimationFrame=function(i){clearTimeout(i)}}</script>`.
   **Voltar a fazer o build no fim**, para a pasta não ficar com isto.
4. Abrir cada página pelo endereço e contar: `link[rel=canonical]` (um),
   `link[rel=alternate]` (três), `meta[name]` e `meta[property]` sem nomes
   repetidos, `script[type="application/ld+json"]` (quatro, cinco na página
   inicial e na FAQ).

**O que continua por fazer:** as pré-visualizações por página (ponto 11). E o
conteúdo dos títulos e descrições das outras páginas não foi revisto (ponto 14).

#### 6. Travessões e português do Brasil no `public/index.html` (FEITO a 16/09, `18a2135`, e a 18/09, `dab9c1d`)

Feito: o título, a descrição e as etiquetas `og:` e `twitter:` do `index.html`
foram substituídas pelas novas (sem travessões), e "Codificando o Amanhã da sua
Empresa" saiu dos três sítios onde estava. Os dois comentários com travessão do
`index.html` também saíram. Hoje o `index.html` não tem nenhum travessão.

A 18/09, a pedido do Rui: o `manifest.json` ficou sem travessão
(`"name": "NEXUGAL, Consultoria Tecnológica"`) e com `"lang": "pt-PT"` (estava
`pt-BR`); e o `<noscript>` passou de "Você precisa habilitar JavaScript para
executar este app." a "É preciso ativar o JavaScript para ver este site.", com
"You need to enable JavaScript to view this site." ao lado: o ficheiro é o mesmo
nas duas línguas e, sem JavaScript, não há forma de saber qual se pediu.

O `name` e a `description` do `manifest.json` ainda falam de "Consultoria
Tecnológica" e dos serviços antigos (ponto 14).

#### 7. Dívida de contraste conhecida: o azul-claro

Registada no próprio repositório, em `frontend/src/utils/contraste.test.js`, e
**nunca discutida com o Rui**.

O `azul-claro` (`#4FA3DC`) dá **2,76 para 1** sobre branco. Para um elemento
gráfico que carrega informação, o mínimo é 3 para 1. Afeta as setas
convergentes do hero e as suas pontas, o sublinhado do "Ver exemplos", as setas
do leque no telemóvel, e as duas barras mais claras do gráfico de margem
(Baterias e Juntas). O teste só cobre as duas primeiras.

O teste não deixa piorar e imprime o valor em cada corrida. As saídas escritas
nele: escurecer o azul-claro para `#4B9BD1` (3,04 para 1, indistinguível a olho)
ou passar esses elementos para `azul-medio` (6,83 para 1). **Não mudar sem o Rui
decidir.** Se mudar, mudar em todos estes sítios: `tailwind.config.js`,
`index.css` (`--azul-claro`), os `#4FA3DC` escritos à mão no
`EsquemaIntegracoes.js` (setas e pontas) e a tabela `COR` do teste.

#### 8. O que só um browser verdadeiro confirma

O painel de pré-visualização do Claude não dispara observadores nem anima o
scroll (7.4). Por isso nunca foram vistos a funcionar de verdade:

- o botão flutuante, com os seus estados todos. A 10/09 o Claude pediu ao Rui
  para o confirmar com os próprios olhos; não ficou registado se o fez;
- o scroll suave do "Ver exemplos" e do índice dos exemplos;
- o SEO (ponto 5). A 16/09 verificou-se no painel com o desenho do ecrã
  simulado, que é o que um browser visível faz sozinho. Falta vê-lo num browser
  verdadeiro, depois de publicado.

Como testar, em 7.5.

#### 9. Pequenas coisas conhecidas, sem pressa

- Entre 1024 e 1279px o título do hero está a 36px (`lg:text-4xl`) e os títulos
  das secções a 48px (`lg:text-5xl`). A regra "o maior tipo na primeira dobra"
  só foi verificada a partir de 1280px. Não foi discutido com o Rui.
- A classe `.texto-sobre-video` continua definida no `index.css`, sem uso.
- O comentário da cor de alerta no `tailwind.config.js` fala das "duas linhas"
  do stock (era a versão de quatro artigos) e diz 5,16 para 1 (o valor
  calculado é 5,18).
- O admin mantém roxo e laranja em botões de ação, que já lá estavam antes deste
  trabalho (página interna). O contraste do admin nunca foi auditado ao vivo,
  porque exige login.
- A tabela de cookies da política de privacidade a 380px (ver 7.1).
- O bloco `services:` do `translations.js` (PT e EN), texto da grelha antiga que
  já não aparece em lado nenhum (ver 7.1). Pode sair, com o acordo do Rui.

#### 10. Próximo passo do fluxo, quando o Rui disser

Pull Request do `rui/site-branco` para o `main`, revisto pelo Henrique.
**Atenção:** enquanto isso não acontecer, o `main` está atrás do site público.
Publicar a partir do `main` faria o site voltar ao fundo preto.

#### 11. As pré-visualizações por página (WhatsApp, redes sociais, e quem abre sem JavaScript)

**Registado a pedido do Rui a 16/09. Não é para resolver sem ele decidir.**

**O problema:** o servidor devolve o mesmo `index.html` para todos os endereços,
e só o JavaScript sabe em que página se está. O WhatsApp, o LinkedIn, o Facebook
e afins não correm JavaScript: partilhar `/faq`, `/sobre` ou `/us/contact` mostra
sempre o título, a descrição e a imagem da página inicial em português. E quem
abre sem JavaScript vê a página em branco.

**O que seria preciso**, do mais pequeno para o maior:

1. **Um HTML por página, gerado no fim do build.** Depois do `npm run build`, um
   script copia o `build/index.html` para `build/faq/index.html`,
   `build/us/faq/index.html` e assim por diante, trocando em cada cópia o título,
   a descrição, as `og:` e `twitter:`, e acrescentando o canonical e os
   `hreflang` dessa página. A Vercel serve os ficheiros que existem antes de
   aplicar a regra que manda tudo para o `index.html`, e o React arranca igual.
   Resolve as pré-visualizações, não resolve a página em branco sem JavaScript.
   Obriga a:
   - pôr os títulos e descrições num ficheiro só, lido pelo `SEO.js` e pelo
     script (hoje estão no `SEO.js` e, os da página inicial, repetidos à mão no
     `index.html`);
   - acrescentar o script ao `buildCommand` do `vercel.json` da raiz;
   - confirmar como a Vercel trata `/faq` contra `/faq/` (opção `trailingSlash`);
   - com isso feito, o canonical e os `hreflang` podem voltar ao HTML de cada
     página, e o efeito do `SEO.js` deixa de ter de os criar.
2. **Pré-renderização com um browser no build** (tipo `react-snap`): guarda o HTML
   de cada página já desenhado, texto incluído. Resolve também a página em branco.
   Mais pesado, precisa de um Chromium no build da Vercel, e estas ferramentas dão-se
   mal com o Create React App 5 e o React 18.
3. **Mudar para uma ferramenta que gera as páginas no servidor ou no build**
   (Next.js, ou Vite com pré-renderização). É provavelmente o "Caminho 2" da nota
   do Henrique na secção 5. É a solução completa e a maior mudança.

Qualquer das três toca no build e no `vercel.json`: falar com o Henrique antes.
Uma imagem de partilha diferente por página é um passo à parte, e só faz sentido
depois de uma destas.

#### 12. A morada em Braga (DECIDIDO a 18/09: fica)

**A decisão do Rui, a 18/09:** a morada fica onde está, em todos os sítios. "A
morada diz onde a empresa está, não onde trabalha, e há sítios onde é
obrigatória." Não se apaga dos dados estruturados, nem da política de
privacidade, nem dos emails do backend. **A única coisa que saiu** (`bb60c3e`)
foi a frase do rodapé "Feito com tecnologia de ponta em Portugal 🇵🇹", em PT e
EN, sem nada no lugar (as chaves `footer.madeWith` e `footer.location` saíram do
`translations.js`). O "Braga, Portugal" do rodapé fica.

O que estava escrito a 16/09, antes da decisão:

O Rui decidiu a 16/09 que o site **não declara limite geográfico nenhum**: "Apaga
'serve Portugal e Brasil' e qualquer outra afirmação de onde a Nexugal trabalha,
nos dados estruturados e onde mais apareça. Não substituas por outra frase, nem
por Braga, nem por Portugal."

Saiu (`18a2135`): o `areaServed` (Portugal e Brasil) do JSON-LD; "em Braga,
Portugal" das descrições do `SEO.js` (página inicial e contacto, PT e EN), do
`index.html` (`description`, `og:description`, `twitter:description`,
`keywords`) e do `manifest.json`; e as quatro etiquetas de geolocalização do
`index.html` (`geo.region`, `geo.placename`, `geo.position`, `ICBM`), que só
existiam para "SEO local".

**Não saiu, porque é a morada da empresa e não uma afirmação de onde trabalha.
Ficou para o Rui decidir:**

- `SEO.js`: a morada no JSON-LD (`Organization` e `ProfessionalService`:
  `addressLocality` e `addressRegion` Braga, `addressCountry` PT) e as
  coordenadas (`geo`, 41.5518 e -8.4229). Nota: o Google pede morada num
  `ProfessionalService`; sem ela, esse bloco deixa de servir para resultados
  locais.
- `translations.js`, rodapé: `footer.contact.address` "Braga, Portugal" (PT e EN)
  e `footer.location` "Portugal", na frase "Feito com tecnologia de ponta em
  Portugal 🇵🇹".
- `PrivacyPolicyPage.js`: "Braga, Portugal" em "Responsável pelo Tratamento".
  É a identificação de quem trata os dados, que o RGPD exige.
- `backend/main.py`: os emails de prospeção dizem "consultoria tecnológica
  sediada em Braga". Território do Henrique.
- `AdminLeadsPage.js`: Braga como região de pesquisa do scraper. Página interna,
  não é afirmação nenhuma.

#### 13. A imagem de partilha está desatualizada e mal descrita (FEITO a 18/09, `dab9c1d`)

**Resolvido a 18/09:** o Rui mandou uma imagem nova (`nexugal-partilha-B-so-N.png`,
na pasta `site` dele: o N da Nexugal à esquerda e um círculo azul a sair pela
direita, em fundo branco). Entrou como
`frontend/public/images/nexugal-partilha.png`, PNG verdadeiro de 1200 × 630px e
110 KB, igual byte a byte ao original, e o `og-image.png` saiu do repositório.
As três etiquetas que apontavam para a antiga (`og:image`,
`og:image:secure_url`, `twitter:image`) apontam para a nova, e o tipo e as
medidas declarados (`image/png`, 1200 × 630) passaram a bater certo com o
ficheiro. **Nome novo de propósito:** o WhatsApp e as redes guardam a imagem
pelo endereço, e com o mesmo nome continuariam a mostrar a antiga.

Como estava antes, `frontend/public/images/og-image.png`:

- é o desenho antigo: fundo preto, néon ciano, "Consultoria Tecnológica" e
  "Desenvolvimento Web · Cibersegurança · Cloud · IA · Dados";
- **é um JPEG com nome `.png`**, de 1024 × 1024px; as etiquetas dizem
  `image/png` e 1200 × 630px (`og:image:type`, do Henrique, e
  `og:image:width` e `og:image:height`). Algumas redes recortam ou ignoram uma
  imagem que não bate com o que as etiquetas dizem.

Não discutido com o Rui. Precisa de uma imagem nova, de 1200 × 630px, no estilo
branco, e de acertar as etiquetas com o Henrique.

#### 14. Restos de texto antigo no cabeçalho, fora do que foi pedido a 16/09 (FEITO em parte a 18/09)

A 18/09 o Rui pediu os títulos (tabela em 7.7), o Sobre no sitemap, a marca em
"Nexugal" em todos os títulos e descrições, e o `manifest.json` novo (7.8);
estão feitos. O resto continua como estava, não discutido com ele (o ponto do
`manifest.json`, mais abaixo, ficou resolvido no `2ed76ff`):

- **As descrições das outras páginas** no `SEO.js` (o Rui pediu só os títulos):
  a da FAQ ainda fala de "desenvolvimento web, cibersegurança, cloud, IA"; a do
  contacto promete que "a nossa equipa responde em 24 horas"; a do Sobre (do
  Henrique) fala de "paixão por transformar empresas através da tecnologia,
  cibersegurança e inovação".
- **O `name` e a `description` do `manifest.json`** ainda dizem "Consultoria
  Tecnológica" e listam os serviços antigos (a 18/09 o Rui pediu só o travessão
  e a língua). É o nome que aparece se alguém instalar o site como aplicação.
- **`keywords`** do `index.html`: ainda a lista dos serviços antigos, com inglês
  ("IT consulting, web development, cybersecurity"). O Google ignora esta etiqueta.
- **O JSON-LD de serviços** (`serviceSchema`) só existe em português e aparece
  também em `/us`. E "Proteção completa dos seus dados" é o tipo de promessa
  absoluta que o Rui tirou da FAQ; a 16/09 só se corrigiu o vocabulário, por
  instrução dele.
- **O `sitemap.xml`** ganhou `/sobre` e `/us/about` a 18/09 e tem agora as dez
  páginas públicas. Só a página inicial declara `x-default` no sitemap (as
  páginas declaram-no todas, desde 16/09); não é contradição, é só incompleto.

### 7.3 Decisões que valem para o futuro

Coisas que não se adivinham olhando para o código e que alguém de fora é capaz
de querer "arrumar".

#### O esquema de convergência é exclusivo do hero

O argumento da primeira dobra é este: a informação anda espalhada por vários
sítios e passa a juntar-se num só. O leque de setas a convergir no N é esse
argumento desenhado, e é a assinatura do site. Nas palavras do Rui, "o leque de
setas é o argumento todo do esquema".

A primeira versão da secção de exemplos pôs o mesmo esquema nos seis blocos, e o
Rui mudou a decisão: "seis blocos com o mesmo esquema leem-se como um só repetido
seis vezes, e o primeiro repete o esquema do hero. A decisão muda: cada bloco
passa a ter o seu próprio desenho, e o esquema de setas fica exclusivo do hero."

O mesmo raciocínio explica a maqueta A do telemóvel. Antes, a 380px, as origens
eram barras da largura toda, encostadas umas às outras, e só cabia uma seta, a de
baixo: lia-se "o WhatsApp entra no N" em vez de "estas quatro entram no N". O
Rui pediu uma seta por origem, "a história tem de ser a mesma nas duas larguras".
O Claude desenhou três maquetas: A (fila de peças com leque a descer), B (coluna
estreita de caixas com o leque ao lado) e C (calha em ramo). Recomendou a B; o
Rui escolheu a A.

Nessa altura a exigência era aguentar três, quatro ou cinco origens "sem se
reinventar", porque o esquema ia servir também os blocos de exemplos. É daí que
vêm as medidas para cinco origens em `FILA`. A maqueta A tem um limite conhecido
e aceite: com cinco origens as peças descem a 57px e os nomes a 10px, e
"WhatsApp" ocupa 51 desses 57. Um nome como "Transportadora" não cabe. **Nesse
dia a saída não é encolher mais, é mudar de disposição**, provavelmente para uma
coluna de caixas com o leque ao lado (a antiga maqueta B), que aguenta qualquer
número de origens e qualquer comprimento de nome. Está escrito num comentário
por cima de `FILA`.

#### Cada bloco de exemplos tem um desenho diferente

Consequência direta do ponto anterior. Cada desenho é moldado à história que o
bloco conta: papel a virar dados, uma conversa, dois números que não batem certo,
uma barra que atravessa o zero. **A unidade vem da paleta, da letra e do estilo
das caixas, não de os desenhos serem iguais.** O lado alterna de bloco para bloco
e as alturas são diferentes de propósito, para o olho não se instalar. Não
uniformizar.

Para o futuro, isto quer dizer que **um bloco novo obriga a um desenho novo**:
acrescentar a função em `VisuaisExemplos.js` e o nome no mapa `VISUAIS`. Não há um
molde genérico, e é de propósito. Se o nome em `visual` não existir, o bloco sai
sem desenho em vez de partir a página.

Cada desenho empilha à sua maneira no telemóvel (ver 7.1): são quatro problemas
diferentes, e o Rui pediu uma solução para cada um.

A ordem dos blocos também é deliberada. Foi fixada pelo Rui; o guião v2 dava o
princípio: "o mais forte abre, o mais forte fecha, o mais fraco fica ao meio".

#### A cor de alerta só entra onde alguma coisa está mal

Regra do Rui: "A cor de alerta usa-se apenas nos blocos 3 e 4, e apenas no que
está mal. Não a espalhes."

A razão: é a única cor de aviso do site inteiro, e por isso pesa. Onde aparece, o
olho vai. Hoje está em dois sítios, e só no que está errado: os dois números do
stock que não batem certo e a barra do artigo a dar prejuízo. Usá-la para
decorar, ou para chamar a atenção para uma coisa que está bem, faria os problemas
verdadeiros perderem-se no meio. O comentário no `tailwind.config.js` diz-o à
maneira dele: "Se aparecer em mais algum sítio, está a mentir."

#### O texto vai em HTML, não dentro do SVG

Todo o texto vem do `translations.js`, em português e em inglês, com
comprimentos diferentes. Texto dentro de um SVG tem coordenadas fixas: não quebra
linha, transborda a caixa sem avisar quando a versão inglesa é mais comprida
("NA LOJA/ARMAZÉM" passa a "IN THE SHOP/WAREHOUSE", "NO PROGRAMA" a "IN THE
SYSTEM"), ignora o tamanho de letra que a pessoa escolheu no browser, é mal lido
por leitores de ecrã, e a 380px parte-se.

Por isso: **SVG só para o que é desenho** (setas e pontas, pilha de papéis, sinal
de diferente, eixo do gráfico), **HTML para o que é texto** (caixas de origem,
cartões, tabela, bolhas de conversa, rótulos, números, etiquetas das barras),
desenhado para parecer o mesmo.

Foi uma decisão do Claude contra a referência: o `nexugal-exemplos-v3.html` punha
o texto todo dentro do SVG, e o pedido dizia "Todos em SVG". Foi reportada ao Rui
com as razões a 10/09, e ele registou-a como decisão a 14/09. A regra já estava
escrita no cabeçalho do `EsquemaIntegracoes.js`. A única exceção é a palavra
decorativa "FATURA" desenhada na pilha de papéis (campo `papelEtiqueta`).

#### O botão flutuante só se esconde na secção final

Nas palavras do Rui: a secção final "já é um convite ao contacto em grande, e ter
os dois no mesmo ecrã são dois botões iguais a competirem".

**Não se esconde perto do "Entre em contacto" do fecho dos exemplos**, apesar de
ficarem perto um do outro. O Claude levantou a questão a 10/09 e o Rui decidiu,
sabendo disso: "aparecer e desaparecer duas vezes no mesmo scroll seria pior".

Decide com `IntersectionObserver` sobre os elementos, e não com uma posição de
scroll em pixels, também por instrução do Rui: uma posição fixa "parte quando o
hero mudar de altura". E o hero muda: entre telemóvel e computador, e com o
número de origens do esquema.

#### Os rótulos são tarefas, não setores

O primeiro guião (`guiao-exemplos-site-nexugal.md`, 09/09) tinha um painel por
linha de serviço, e cada um contava o exemplo com uma empresa fictícia de um setor
("Confeções Vale do Ave, Lda. (têxtil)", por exemplo), com as ferramentas e "a
linguagem daquele setor". O guião v2 (10/09) trocou por tarefas e escreveu a
regra: "**Nada de setores.** Nem no índice, nem nos títulos, nem em legendas.
Nenhum bloco nomeia têxtil, metalomecânica ou o que quer que seja. As empresas
fictícias saíram todas."

Porquê. O guião v2 liga os blocos ao hero: "O cartão do hero mostra quatro linhas
de origens diferentes: faturas, stock, vendas e pedidos. Cada bloco desta secção
pega numa dessas linhas e vai ao fundo dela." Com os quatro blocos de hoje a
correspondência é direta: faturas dá Contabilidade e faturação, pedidos dá
Pedidos de clientes, stock dá Stock e compras, vendas dá Números do negócio. Um
bloco organizado por setor partia essa ligação.

A outra razão não está escrita por extenso, mas lê-se no guião: o subtítulo de
então falava de situações "que se repetem em quase todas as empresas" (o
subtítulo saiu a 11/09, a razão fica), e o bloco que abre foi escolhido por ser
"a dor mais universal e a mais fácil de reconhecer em dois segundos". Um exemplo
com setor diz a quem é de outro setor "isto não é para si"; uma tarefa deixa
qualquer gerente reconhecer-se.

Regras do mesmo guião, que valem para textos novos:

- **Cada bloco começa pela dor, em linguagem de gerente**, "uma frase que um
  gerente diria em voz alta". O rótulo da tarefa fica pequeno por cima. O nome
  da linha de serviço não aparece em lado nenhum.
- Números realistas e com resto: "Nada de 100, 500 ou 10 000".
- Os números dos exemplos são diferentes dos do hero: "Repetir os mesmos valores
  faria parecer erro em vez de aprofundamento."
- Nenhuma frase promete mais do que a Nexugal entrega hoje.

Nota: os fornecedores na tabela do bloco 1 (Malhas do Ave, Tintex, Fios e Cores)
vêm tal e qual da referência v3. São fictícios e soam a têxtil. Não foram mudados
por iniciativa própria; se incomodarem, é decisão do Rui.

#### Outras decisões já tomadas (não reabrir sem o Rui)

- **O título do hero fica em três linhas acima de 1280px.** "Decisão tomada, o
  assunto fecha." A 1280px, "Deixe a sua empresa" precisa de 508px a 48px, o
  esquema de 368 e o cartão de 265 para "47 faturas lançadas, 2 por rever" numa
  linha: 1141px numa linha de 1104. Faltam 37px. Baixar o título punha-o abaixo
  dos títulos das secções (contra a regra da primeira dobra), e o esquema já tinha
  encolhido duas vezes. O Rui: "Não encolhas o esquema pela terceira vez, não
  baixes o corpo do título, não apertes o espaço entre colunas. Nada muda."
- **O cartão do hero** tem de ter, a 1440 e a 1920px, "47 faturas lançadas, 2 por
  rever" numa linha e a legenda numa linha. O contentor do hero não fica mais
  largo do que o das outras secções.
- **A bandeira dos Estados Unidos no cabeçalho fica como está** (troca de língua).
- **O "suporte técnico contínuo 24/7" da FAQ fica**, e o resto da FAQ, para lá das
  quatro correções, não se toca.
- **A FAQ não declara limite geográfico nenhum.** A 16/09 a decisão alargou-se
  ao site todo: nenhuma afirmação de onde a Nexugal trabalha, "nem Braga, nem
  Portugal", e nada no lugar do que sai. **A morada da empresa fica** (18/09): nos
  dados estruturados, no rodapé, na política de privacidade e nos emails do
  backend. Saiu só a frase "Feito com tecnologia de ponta em Portugal" (7.2,
  ponto 12).
- **Página inicial, para o Google e o WhatsApp (16/09):** título "Nexugal",
  descrição "Reformulação de operações com gestão implementada", e "Menos tarefas
  repetidas. Mais tempo para o que importa." no texto alternativo da imagem de
  partilha, no lugar de "Codificando o Amanhã".
- **Os seis serviços do JSON-LD ficam** (16/09), mesmo sem cartões na página, e
  o "24/7" também.
- **Rótulos do stock (16/09):** NO PROGRAMA 19, NA LOJA/ARMAZÉM 12 (EN IN THE
  SYSTEM, IN THE SHOP/WAREHOUSE). O inglês leva um ponto de quebra invisível
  depois da barra (18/09, escolha do Rui entre três saídas): o texto não muda,
  só ganha onde partir.
- **Imagem de partilha (18/09):** `images/nexugal-partilha-2.png`, feita pelo
  Rui, com o logótipo e o nome no quadrado central, porque o WhatsApp corta a
  imagem a quadrado (7.10). **Uma imagem nova entra com nome novo** (7.4): o Rui
  confirmou-o a 18/09, quando a segunda versão chegou com o mesmo nome da
  primeira, já publicada.
- **A marca escreve-se "Nexugal"; "NEXUGAL" só no logótipo** (18/09). Nas
  palavras do Rui: "O logótipo escreve-se em maiúsculas espaçadas porque é um
  desenho. Num separador do browser e num resultado do Google, maiúsculas
  leem-se como se estivéssemos a gritar." Aplicado a tudo o que o Google, o
  separador e as partilhas mostram (títulos, descrições, nome do site, nomes nos
  dados estruturados, `manifest.json`), e depois, no mesmo dia, ao texto das
  páginas (7.9). Hoje "NEXUGAL" só existe no logótipo, e no admin, no chatbot
  desligado e no backend, que ficaram de fora (7.9). Texto novo com a marca
  escreve-a "Nexugal".
- **A linha órfã do "Como trabalhamos" no telemóvel fica como está.**
- **Botões:** o do fecho dos exemplos diz "Entre em contacto"; o do hero e o
  flutuante dizem "Falar connosco". (O do convite final diz "Iniciar Conversa" e
  o da página da FAQ "Fale Connosco"; não foram objeto de decisão.)
- **Logótipos de outras empresas:** nenhum no hero. Na secção de exemplos, só na
  tira do fim, a cinzento e discretos (o guião v2 regista que o Rui preferia os
  logótipos só na tira, e não dentro das caixas dos esquemas). Se faltar o
  ficheiro, a entrada fica como nome escrito: nada de substitutos inventados nem
  de imagens de outro sítio. Os ficheiros devem vir das páginas oficiais das
  marcas (lista de verificação do guião v2).
  **Uma ferramenta só entra na tira depois de existir capacidade real de a
  integrar**: "A tira cresce, não se enche à partida."
- **Textos:** copiar dos ficheiros do Rui. "Não melhores frases, não arredondes
  números, não inventes."
- **Estilo, em todos os pedidos:** português de Portugal; nunca travessões, usar
  vírgulas; "IA", nunca "AI"; todo o texto visível no `translations.js`, em
  português e em inglês; auditoria de contraste no fim de cada lote.
- **Método, em todos os pedidos:** "Se alguma coisa não encaixar, para e diz. Não
  improvises à volta." Várias vezes o Claude parou e perguntou (a pergunta das
  regiões, o título contra o cartão, o transbordo do stock), e foi assim que o
  Rui quis.

#### De onde vêm os textos

Os pedidos e as referências do Rui estão fora do repositório, na pasta
`C:\Users\ruipe\OneDrive - Universidade do Minho\Ambiente de Trabalho\Consultor\site\reformulação do site\`:

- `guiao-exemplos-site-nexugal.md`: o primeiro guião (09/09), com um painel por
  linha de serviço e uma empresa fictícia de um setor em cada um. Nunca foi
  construído. O pedido era um ramo `rui/exemplos-servicos` a partir do
  `rui/frontend`, reaproveitando um destaque de linha ativa ligado ao scroll, e o
  Rui mandou parar e reportar antes de escrever código. O Claude reportou que
  esse estado não existia, que o ramo `rui/frontend` já não existia e que a
  metade direita do hero não estava vazia. O pedido seguinte do Rui já foi outro,
  o `rui/site-branco`, a partir do `main`.
- `guiao-exemplos-v2.md`: regras da secção e os seis blocos (10/09).
- `nexugal-exemplos-v3.html`: a referência dos quatro blocos (10/09).
- `logos/`: os logótipos da tira (11/09).

Nas afinações, o Rui escreveu as frases novas diretamente nos pedidos. As
versões inglesas foram escritas pelo Claude e mostradas ao Rui.

### 7.4 Armadilhas que vão morder outra vez

#### O site público já é este ramo, e publica-se à mão

O nexugal.com mostra o `rui/site-branco` (7.0), e o `main` está atrás: **quem
publicar a partir do `main` faz o site voltar ao fundo preto.** Uma publicação à
mão (`vercel --prod`) leva o que estiver na pasta, incluindo o que ainda não foi
commitado. Foi o que aconteceu a 13/09: o site diz ter saído do commit
`d3f292e`, mas já traz o texto e a fotografia do Sobre, que só foram commitados
no `4e00f5f` (às 19h23; uma cópia da página em cache já os mostrava às 19h22).
Ainda hoje o site diz ser `d3f292e` e mostra `4e00f5f`. Commitar antes de
publicar. E a marca
`VERCEL_GIT_COMMIT_REF` no site não prova que a Vercel esteja ligada ao GitHub
(secção 6).

#### O SEO.js e o react-helmet-async

A história está em 7.2, ponto 5. As lições:

- **O SEO só se verifica no build de produção, abrindo cada página pelo
  endereço.** Nunca no `npm start`, nunca só navegando pelo menu.
- **A biblioteca só escreve quando o browser desenha o ecrã.** Num separador
  escondido, ou no painel do Claude escondido, não escreve nada: os `hreflang` e
  o JSON-LD não aparecem, e parece uma avaria intermitente. Antes de concluir que
  está partido, ver `document.hidden` (7.2, ponto 5, tem o remendo para testar).
- **Cada etiqueta do cabeçalho tem um só sítio que a escreve** (tabela em 7.2,
  ponto 5, e no topo do `SEO.js`). Pôr a mesma etiqueta em dois sítios volta a
  repeti-la, sem erro nenhum à vista. Em particular: **não voltar a pôr canonical
  nem `hreflang` no `public/index.html`**, que é o mesmo ficheiro para todas as
  páginas.
- **O título e a descrição da página inicial estão escritos duas vezes**: no
  `SEO.js` e, à mão, no `public/index.html`, que é o que o WhatsApp lê. O mesmo
  para o texto alternativo da imagem, em português. Mudar um obriga a mudar o
  outro.

#### A FAQ esteve escrita em dois sítios

Até 10/09 as perguntas da FAQ estavam no `translations.js` e outra vez, à mão, no
`SEO.js` (16 perguntas), para o JSON-LD. Quem corrigisse só um dos ficheiros
deixava o ecrã a dizer uma coisa e o JSON-LD a dizer outra. Esteve à beira de
acontecer: as quatro correções de 10/09 tiveram de ser aplicadas nas duas cópias,
e o Rui pediu a fonte única por isso. Hoje o `SEO.js` lê
`translations[lang].faq.items`, e continuava a ler depois das alterações do
Henrique. **Não voltar a escrever perguntas dentro do
`SEO.js`.** Uma pergunta nova entra só no `translations.js` e aparece nos dois
sítios.

#### Ids repetidos em SVG

As setas do esquema do hero usam pontas definidas em `<marker>`, e os ids eram
fixos: `ponta-clara` e `ponta-media`, com quatro cópias de cada no documento. O
`url(#ponta-clara)` resolve sempre para a primeira, e essa vivia dentro da versão
de ecrã grande do esquema, que a 380px está em `display:none`. Resultado: **no
telemóvel as setas ficavam sem ponta**, riscos soltos. Confirmou-se dando ids
únicos por JavaScript, e as pontas apareceram logo.

Resolvido com `useId`, no `usePontas` do `EsquemaIntegracoes.js`. **Qualquer SVG
novo com `<defs>` (marker, gradient, mask, clipPath, filter) tem de ter ids
únicos**, pelo mesmo motivo.

#### O painel de pré-visualização do Claude não é um browser completo

- **Não dispara `IntersectionObserver` nem `ResizeObserver`.** Nem o aviso
  inicial: testou-se com um elemento parado no meio do ecrã e não chegou um único
  aviso. Tudo o que depende deles (o botão flutuante) fica parado no estado
  inicial.
- **Não anima o scroll suave.** `scrollIntoView({ behavior: 'smooth' })` não mexe.
- **`getComputedStyle(elemento).opacity` deu valores falsos**, e as capturas de
  ecrã com a página descida vêm às vezes em branco ou deslocadas.
- **Com o painel escondido, `innerWidth` é 0**: medições e auditorias não dão
  nada que se aproveite (visto a 14/09). **Mas com uma largura emulada**
  (`resize_window` com largura e altura) a largura é a pedida, mesmo escondido, e
  as medições e a auditoria valem (confirmado a 15 e 16/09).
- **Escondido, não desenha o ecrã**: `requestAnimationFrame` nunca dispara, e
  tudo o que espera por ele fica parado. É o caso da biblioteca do SEO (7.4, "O
  SEO.js e o react-helmet-async").
- **As capturas de ecrã escondido vêm deslocadas**, mesmo com a página no topo e
  as secções de cima escondidas (16/09). Medir em vez de capturar.
- O `.claude/launch.json` (fora do git) tem duas configurações: `nexugal-frontend`
  (`npm start`, porta 3000, ou outra se estiver ocupada) e `nexugal-build` (serve
  a pasta `frontend/build` na porta 4173, com `npx serve -s`).

Como se contornou:

- Botão flutuante: instalou-se no browser um substituto do `IntersectionObserver`
  baseado em eventos de scroll, com as mesmas margens, e forçou-se o componente a
  montar outra vez indo a outra rota e voltando. Confirmaram-se os sete estados:
  topo (escondido), passado o hero (visível), meio do site (visível), secção final
  a entrar (escondido), dentro da secção final (escondido), a subir outra vez
  (visível), de volta ao topo (escondido). **A lógica ficou provada, o
  comportamento real não** (7.2, ponto 8).
- Estados dos componentes: ler as classes (`opacity-100`, `opacity-0`) em vez da
  opacidade calculada.
- Capturas: esconder por JavaScript as secções de cima, para o que interessa
  ficar no topo, e capturar com a página no topo.
- Saltos do índice: chamar `scrollIntoView({ behavior: 'auto' })` e medir onde o
  alvo fica.

#### Código que ficou de propósito sem uso

Não apagar sem o Rui decidir.

- `src/chatbot/` e o bloco `chatbot:` do `translations.js` (secção 5).
- `src/hooks/useRevealOnScroll.js`: não é importado em lado nenhum. É a entrada
  animada das secções ao chegar ao ecrã, retirada a pedido antes deste trabalho;
  ficou afinada para o dia em que voltar (diz-o o comentário no topo).
- `src/components/Entrada.js`: é usado, mas não anima nada, só devolve um `div`.
  Ficou para as secções não terem de ser todas remexidas se a entrada animada
  voltar, e por isso aceita e ignora a propriedade `atraso`.
- No `EsquemaIntegracoes.js`: as medidas `FILA.de5` (só entram com mais de quatro
  origens, e o hero tem quatro), a linha de entrega opcional, o número de origens
  variável e o realce marcado à mão. Genéricos de propósito (7.3).

#### Outras armadilhas pequenas mas reais

- **O Tailwind só gera as classes que estão escritas por extenso no código.**
  Montar `'lg:' + 'hidden'`, ou escolher o ponto de corte juntando texto, não dá
  erro nenhum: simplesmente não há CSS. Ver o caso do `Seta` em 7.2, ponto 1.
- **A regra dos números a negrito no cartão do hero** (`comNumeros`, no
  `EsquemaIntegracoes.js`; os cartões dos exemplos não a usam, o número vem num
  campo próprio): sem asteriscos numa linha, todos os números dessa linha levam
  peso; com asteriscos em qualquer parte da linha, só o marcado leva peso e o
  resto fica normal. A regra nasceu de uma linha do
  guião v2, "1 repetida, já lançada a 12/08", em que o 1 tinha peso e a data não:
  a procura automática partia "12/08" em dois números a negrito. Hoje só a nota do
  stock do hero usa asteriscos (`*8/09*`, `*2 dias*`).
- **Os realces levam `whitespace-nowrap`**, para "2 dias" e "3 à espera de si" não
  se partirem com a última palavra sozinha na linha seguinte.
- **O botão flutuante depende de dois ids**: `id="cta-hero"` no `Hero.js` e
  `id="contacto-final"` no `CallToAction.js`. Mudar o nome de um deles não parte
  nada à vista: o botão simplesmente deixa de aparecer, ou de desaparecer. Os ids
  estão em constantes no topo do `BotaoContactoFlutuante.js`.
- **O aviso de cookies tem de continuar a anunciar-se** (`anunciarAviso`, de
  `utils/avisoCookies.js`). O botão flutuante começa por assumir que o aviso está
  no ecrã sempre que ainda não há resposta guardada. Se o aviso deixar de
  anunciar que saiu, o botão fica escondido nessa visita, sem erro nenhum à
  vista.
- **Cores escritas à mão fora dos tokens:** `#4FA3DC` e `#1B5AA8` nas setas e
  pontas do `EsquemaIntegracoes.js`; cinzentos (`#E3EAF3`, `#C9D6E6`, `#8FA0B8`,
  `#D5E0EC`, `#E8EEF6`, `#EFF4F9`) e o `#DCE5EF` (o mesmo valor do token
  `linha`, no contorno das folhas) na pilha de papéis e nas barras por preencher
  do `VisuaisExemplos.js`; o degradê da `MancaFundo` no `Hero.js`, com os valores
  dos três azuis. Se um token mudar, procurar também o hexadecimal.
- **Nem todo o texto visível está no `translations.js`.** A política de
  privacidade tem os textos PT e EN escritos no próprio ficheiro (cerca de 30
  pares `pt ? '...' : '...'`), e há mais frases assim no `ContactPage.js`
  (mensagens de erro e "Enviar outra mensagem"), no `FAQPage.js` ("Não encontrou
  a resposta que procura?" e o botão "Fale Connosco"), no `Footer.js`
  ("Contacto") e no `Header.js` (o texto alternativo da bandeira). O `SEO.js` tem
  escritos no próprio ficheiro os títulos e as descrições de todas as páginas, os
  nomes do caminho de navegação e o texto alternativo da imagem de partilha.
  Antes de mudar uma frase, procurar onde ela está.
- **Apóstrofos no inglês.** O `translations.js` usa plicas simples: "someone's"
  tem de ir como `someone\'s`, senão o build parte.
- **O `\u200B` no rótulo inglês do stock** (`'IN THE SHOP/\u200BWAREHOUSE'`) é
  um ponto de quebra invisível, escrito como código para se ver no ficheiro. Não
  é lixo: sem ele, "SHOP/WAREHOUSE" não parte na barra e sai da coluna do número
  a partir de 1280px (7.7). Há um comentário por cima.
- **A imagem de partilha muda com nome novo, nunca por cima da antiga.** O
  WhatsApp, o Facebook e o LinkedIn guardam a imagem pelo endereço durante dias
  ou semanas. E o tipo e as medidas nas etiquetas (`og:image:type`,
  `og:image:width`, `og:image:height`) têm de bater certo com o ficheiro: a
  antiga dizia PNG de 1200 × 630 e era um JPEG de 1024 × 1024. Confirmar com
  `file` no Git Bash.
- **As opções de "Como soube de nós" são também dados.** O texto da opção
  escolhida, na língua do formulário, vai para o backend no campo `service`, fica
  guardado na base de dados, aparece na tabela do admin e sai no email de cada
  contacto (7.9). Mudar o texto de uma opção muda o que chega a quem recebe os
  emails, e os contactos antigos ficam com o texto antigo. O backend aceita
  qualquer texto (até 120 caracteres), não há lista fechada. E "Outro" tem de
  ficar em último (comentário no `translations.js`).
- **A lista de dados da política de privacidade tem de acompanhar o formulário.**
  Um campo novo, ou um campo que passe a obrigatório, obriga a mudar os dois.
- **Fins de linha no Windows:** o Git deste computador tem `core.autocrlf=true`
  na configuração de sistema (não vem do repositório, que não tem
  `.gitattributes`; noutra máquina pode ser diferente). O git guarda LF e a pasta
  de trabalho usa CRLF. Reescrever ficheiros por script pode
  deixá-los "alterados" sem alteração nenhuma. Antes de commitar, ver
  `git diff --stat` e repor com `git checkout -- <ficheiro>` os que não têm
  alterações reais.
- **`npm ls react-helmet-async` a dizer "invalid"** quer dizer que a pasta
  `node_modules` não acompanha o `package.json`: correr `npm install` antes de
  confiar num build.

### 7.5 Como verificar

#### Build (obrigatório antes de dar qualquer coisa por feita)

No Git Bash (o Claude tem o Git Bash e o PowerShell 5.1; os comandos com `&&` só
funcionam no Git Bash):

```bash
cd frontend && npm install && npm run build
```

Tem de acabar em `Compiled successfully.` A Vercel constrói com `CI=true`, e com
isso o Create React App trata os avisos como erros. Para testar igual:

```bash
cd frontend && CI=true npm run build
```

Nesta sessão usou-se `npx cross-env CI=true ...`, que também funciona, mas o
`cross-env` não faz parte do projeto e o `npx` vai buscá-lo à internet.

Histórico: de 10/09 a 11/09 os builds correram com `CI=false` e passaram, o
último no `cfdd340`. A 14/09/2026 passou com `CI=true`, mas ainda no `cfdd340`,
antes do `git pull` que trouxe os commits do Henrique. A 15/09, depois de
`npm install` (a pasta `node_modules` desta máquina passou à 1.3.0 do
`react-helmet-async`), passou com `CI=true` no `b734589`, que tem o código do
`4e00f5f`; a 16/09 passou outra vez no `18a2135`.

#### Correr o site em local, no PowerShell do Windows

O PowerShell que vem com o Windows (5.1) **não aceita `&&`**. Correr uma linha de
cada vez:

```powershell
cd C:\Users\ruipe\GitHub\landing-page-automatizar-empresas\frontend
npm install
npm start
```

Abre em http://localhost:3000. Para parar: `Ctrl+C` no terminal.

Numa linha só também dá, separando com `;`, mas o `;` não para se um passo
falhar: `cd frontend; npm install; npm start`. Para parar no primeiro erro:
`cd frontend; if ($?) { npm install }; if ($?) { npm start }`.

O build, no mesmo PowerShell: `npm run build`. Para o testar como a Vercel, antes
disso: `$env:CI = 'true'` (fica assim até fechar a janela).

#### Teste de contraste das cores do hero

No Git Bash:

```bash
cd frontend && CI=true npm test -- contraste
```

No PowerShell, dentro da pasta `frontend`: `$env:CI = 'true'` e depois
`npm test -- contraste`. Sem o `CI=true`, o teste fica à espera em modo de vigia
e não acaba.

O teste está em `frontend/src/utils/contraste.test.js`, compara os pares de cor
do hero com os mínimos da norma e imprime uma tabela. A 14/09/2026: **18 testes,
todos a passar**, com duas linhas marcadas `DIVIDA` (o azul-claro, 7.2, ponto 7).
**Se um token de cor mudar, mudar também a tabela `COR` deste teste.** A cor de
alerta não está lá.

#### Auditoria de contraste de todo o texto de uma página

O teste acima só cobre as cores do hero. Para o texto todo de uma página, colar
isto na consola do browser (F12), com a página carregada e visível:

```js
(() => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = (a) => 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
  const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const parse = (s) => { const m = String(s).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]));
  const fundo = (el) => {
    const camadas = [];
    for (let c = el; c; c = c.parentElement) {
      const x = parse(getComputedStyle(c).backgroundColor);
      if (x && x[3] > 0) camadas.push(x);
      if (x && x[3] >= 0.999) break;
    }
    let bg = [255, 255, 255];
    for (let i = camadas.length - 1; i >= 0; i--) bg = over(camadas[i], bg);
    return bg;
  };
  const falhas = [];
  let n = 0;
  document.querySelectorAll('body *').forEach((el) => {
    const t = [...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent.trim()).join(' ').trim();
    if (t.length < 2) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return;
    const r = el.getBoundingClientRect();
    const fg = parse(cs.color);
    if (r.width < 2 || r.height < 2 || !fg) return;
    n++;
    const bg = fundo(el);
    const cor = fg[3] < 1 ? over(fg, bg) : fg.slice(0, 3);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (+cs.fontWeight >= 700 && px >= 18.66);
    const cr = ratio(cor, bg);
    if (cr < (grande ? 3 : 4.5)) falhas.push({ texto: t.slice(0, 40), px: Math.round(px), contraste: +cr.toFixed(2) });
  });
  return { pagina: location.pathname, largura: innerWidth, textosVerificados: n, falhas };
})()
```

Tem de devolver `falhas: []`. Limites: **só vê texto em HTML**. Não mede setas,
barras, contornos nem imagens (para esses o mínimo é 3 para 1, e o azul-claro não
o cumpre); não vê texto dentro de SVG (a palavra decorativa "FATURA"); e não sabe
quando há uma imagem por trás do texto. Com a janela escondida devolve lixo: se
`largura` vier 0, não conta.

Onde e quando correu, com zero falhas em todas as vezes: a 10/09, depois de cada
lote, nas páginas principais a 380px e a 1280 ou 1440px, em PT e EN; depois dos
exemplos, na página inicial a 380, 1024, 1280 e 1920px (e em inglês a 380 e
1280px), e em `/us`, `/sobre` e `/us/about`; a 11/09, no `cfdd340`, na página
inicial a 380, 1024, 1280 e 1920px (149 textos). O `/us` só foi visto a 1920px.
A 14/09 correu-se no site público, em `/` e em `/sobre`, mas com a janela
escondida (`largura: 0`), por isso não conta. A 16/09, no `18a2135`, já com as
alterações do Henrique e com largura emulada: as dez páginas a 380 e a 1280px, e
a página inicial também a 1024 e a 1920px (147 textos na página inicial, 11 no
Sobre com fotografia). A 18/09, no `dab9c1d`, as mesmas páginas e larguras (145
textos na página inicial: saíram os dois da frase do rodapé).

Páginas a correr: `/`, `/us`, `/faq`, `/us/faq`, `/contacto`, `/us/contact`,
`/privacidade`, `/us/privacy`, `/sobre`, `/us/about`.

#### Larguras a testar, e porquê

| Largura | Porquê |
|---|---|
| 380px | telemóvel pequeno: tudo empilhado, maqueta A no hero, índice dos exemplos a passar à linha, tira de ferramentas em quatro filas |
| 1024px | ponto `lg`: as duas colunas começam aqui, e é a largura mais apertada do site (é onde o bloco do stock parte) |
| 1152px | a meio da faixa `lg`, onde um portátil de 13 polegadas cai |
| 1279px e 1280px | ponto `xl`: o esquema do hero passa de empilhado a deitado |
| 1440px | portátil comum; critério do cartão do hero numa linha |
| 1920px | monitor grande: o contentor para aos 1280px, por isso nada deve crescer mais |

Para testar no Chrome: F12, ícone do telemóvel, escrever a largura.

#### Outras verificações rápidas

- **Scroll para o lado:** na consola, `document.documentElement.scrollWidth > innerWidth`
  tem de dar `false`.
- **Travessões:** no Git Bash, `grep -c "—" frontend/src/i18n/translations.js`
  tem de dar 0, e `grep -rn "—" frontend/src` só pode mostrar comentários. O
  `frontend/public/index.html` já não tem (16/09), nem o `manifest.json` (18/09).
- **Botão flutuante, num browser verdadeiro:** na consola,
  `localStorage.removeItem('nexugal_cookie_consent')` e recarregar. Com o aviso de
  cookies no ecrã, o botão nunca aparece. Responder ao aviso, descer para lá do
  botão do hero: aparece. Chegar ao convite final: desaparece. Subir: volta. Para
  testar sem aviso e sem clicar nele, guardar um valor qualquer nessa chave
  (`localStorage.setItem('nexugal_cookie_consent', 'teste')`) e recarregar: o
  aviso só olha para se a chave tem valor. Repetir a 380px.
- **Hero:** as quatro origens têm símbolo, e no telemóvel as setas têm ponta.
- **Os dois idiomas:** tudo o que se verifica em `/` verifica-se em `/us`.
- **Chatbot fora do site:** secção 5.
- **O que está online:** secção 6.

### 7.6 O lote de 15 e 16/09/2026: correções urgentes e o texto que o Google e o WhatsApp veem

Numa conversa nova, o Rui pediu primeiro um ponto de situação sem mexer em
código (o que o Henrique alterou, colisões, estado do SEO, pendentes), e só
depois o trabalho. Commits: `ba203b3` (stock e comentário) e `18a2135` (SEO e
textos). **Não publicado.** Antes do push de 16/09 o site público estava no
`d3f292e` (`main.8e11bf0a.js`).

**Colisões com o trabalho do Henrique: nenhuma.** Os ficheiros das correções
não tinham sido tocados por ele, a correção das rotas do Sobre e da Privacidade
corrige um erro deste ramo, e os textos dele não têm travessões. O `About.js`, a
página do Sobre e os textos do Sobre ficaram como ele os deixou, por ordem do Rui.
O Sobre com fotografia passou a auditoria de contraste (380 e 1280px, PT e EN).

**O que se fez:**

- Stock: 7.2, pontos 1 e 2. Comentário do `EsquemaIntegracoes.js`: ponto 3.
- SEO sem etiquetas repetidas: ponto 5. Travessões e "Codificando": ponto 6.
- Página inicial: título **"Nexugal"** e descrição **"Reformulação de operações
  com gestão implementada"**, ditados pelo Rui. EN: "Nexugal" e "Operations
  redesign with management put in place" (escrito pelo Claude, para o Rui rever).
- Texto alternativo da imagem de partilha: **"Menos tarefas repetidas. Mais tempo
  para o que importa."** (Rui). EN: "Fewer repetitive tasks. More time for what
  matters." (Claude). Já não é fixo em português: segue a língua da página.
- Âmbito geográfico: ponto 12.
- Os seis serviços do JSON-LD ficam, por decisão do Rui ("continuam a ser o que a
  Nexugal faz"). Só o vocabulário: "monitoramento" passou a "monitorização",
  "alta performance" a "alto desempenho", "dashboards" a "painéis", "Soluções
  Cloud" a "Soluções na Nuvem" (e "soluções cloud" na descrição da
  `Organization`), "Suporte & Manutenção" a "Suporte e Manutenção", e a lista
  `serviceType`, que estava em inglês, passou aos mesmos seis nomes em
  português. **O "24/7" fica**, decisão do Rui. "Web" e "responsivas" ficaram.

**Em aberto a 16/09, e resolvido a 18/09 (7.7):**

1. **O rótulo inglês do stock sai da sua coluna a partir de 1280px.** Em
   "IN THE SHOP/WAREHOUSE" o browser não parte a linha na barra, e
   "SHOP/WAREHOUSE" fica 6px mais largo do que a coluna (e a caixa do número por
   baixo, de 104px). Fica dentro do cartão, 15px antes da borda, mas
   desalinhado. Em português, "NA LOJA/ARMAZÉM" cabe (parte em "NA" e
   "LOJA/ARMAZÉM"). Duas saídas, medidas no browser a 1280px, e ambas cabem:
   - um ponto de quebra invisível depois da barra, no `translations.js`
     (`'IN THE SHOP/\u200BWAREHOUSE'`): lê-se igual e parte em "IN THE SHOP/" e
     "WAREHOUSE";
   - espaços à volta da barra, "IN THE SHOP / WAREHOUSE": parte em "IN THE SHOP /"
     e "WAREHOUSE", mas muda o texto que o Rui escreveu.

   O Rui escolheu a primeira.
2. **A morada em Braga** (ponto 12). O Rui decidiu que fica.

**Verificação, a 16/09:**

- `CI=true npm run build`: `Compiled successfully.`, e as classes `xl:` novas
  existem no CSS gerado.
- Teste de contraste do hero: 18 testes a passar, as duas linhas `DIVIDA` de
  sempre.
- Auditoria de contraste de todo o texto: zero falhas em `/`, `/us`, `/faq`,
  `/us/faq`, `/contacto`, `/us/contact`, `/privacidade`, `/us/privacy`, `/sobre` e
  `/us/about`, a 380 e a 1280px, e em `/` também a 1024 e 1920px.
- Stock e SEO: medições em 7.2, pontos 1 e 5.
- Chatbot fora do site: zero ocorrências de `simulateAIResponse` e `ChatWidget`.

### 7.7 O lote de 18/09/2026: o que ficou em aberto, títulos, sitemap e a imagem de partilha

Commits: `bb60c3e` (rótulo inglês do stock e rodapé) e `dab9c1d` (imagem de
partilha, títulos, sitemap, `manifest.json` e `<noscript>`). **Não publicado.**

**As respostas do Rui ao que ficou em aberto a 16/09:**

- **Rótulo inglês do stock:** o ponto de quebra invisível (7.6). Medido no build
  de produção: a 1280 e a 1920px o rótulo parte em "IN THE SHOP/" e "WAREHOUSE"
  e fica dentro da coluna, alinhado à esquerda com a caixa do número por baixo e
  27px antes da borda direita dela. A 380px parte igual; a 1024 e a 1152px cabe
  numa linha. Os números continuam dentro das caixas em todas as larguras.
- **Morada em Braga:** fica (7.2, ponto 12). Saiu só a frase do rodapé.

**Armadilha apanhada neste lote:** o ponto de quebra ficou primeiro gravado como o
próprio carácter invisível, e não como o código visível. Funcionava igual, mas
no ficheiro não se via nada, e qualquer pessoa o podia apagar sem dar por isso.
As ferramentas de edição do Claude transformam o código escrito num pedido de
edição no carácter invisível. Foi reescrito por script, e o ficheiro mostra
agora o código às claras (7.4). Depois de mexer nesse rótulo, confirmar que no
`translations.js` se lê a barra invertida seguida de `u200B`.

**O que se fez:**

- `manifest.json` e `<noscript>`: 7.2, ponto 6.
- Imagem de partilha: 7.2, ponto 13.
- `sitemap.xml`: entraram `/sobre` (prioridade 0.7) e `/us/about` (0.6), com
  os `hreflang` pt e en, como as outras subpáginas. Comparado com as rotas do
  `App.js`: estão as dez páginas públicas; o admin fica de fora e está bloqueado
  no `robots.txt`. O XML é válido.
- Títulos das outras páginas, pedidos pelo Rui "com a linguagem nova do site:
  automação de processos, trabalho repetido, sistemas que falam entre si", e
  mostrados a ele para rever:

| Página | Antes | Depois |
|---|---|---|
| Contacto | Contacto, NEXUGAL \| Fale Connosco | Contacto, Nexugal \| Fale Connosco |
| FAQ | FAQ, NEXUGAL \| Perguntas Frequentes sobre Consultoria Tecnológica | FAQ, Nexugal \| Perguntas frequentes sobre automação de processos |
| Sobre | Sobre Nós, NEXUGAL \| Consultoria Tecnológica e Transformação Digital | Sobre nós, Nexugal \| Sistemas que falam entre si |
| Privacidade | Política de Privacidade, NEXUGAL \| Proteção de Dados e RGPD | Política de Privacidade, Nexugal \| Proteção de Dados e RGPD |
| Contact | Contact, NEXUGAL \| Get in Touch | Contact, Nexugal \| Get in Touch |
| FAQ (EN) | FAQ, NEXUGAL \| Frequently Asked Questions about Technology Consulting | FAQ, Nexugal \| Frequently asked questions about process automation |
| About | About Us, NEXUGAL \| Technology Consulting & Digital Transformation | About us, Nexugal \| Systems that talk to each other |
| Privacy | Privacy Policy, NEXUGAL \| Data Protection & GDPR | Privacy Policy, Nexugal \| Data Protection & GDPR |

  Só a FAQ e o Sobre diziam "Consultoria Tecnológica". Nos quatro de contacto e
  privacidade mudou só a marca, de "NEXUGAL" para "Nexugal", como no título da
  página inicial que o Rui ditou a 16/09 (escolha do Claude, para os separadores
  não ficarem com a marca escrita de duas maneiras). O título do Sobre vive no
  `SEO.js`, não na página: a página do Sobre e os textos dela, e a descrição do
  Sobre no `SEO.js` (do Henrique), não foram tocados.

**Ficheiro órfão que já vinha de trás:** `frontend/public/images/foto principal.png`,
5 MB, 2720 × 1568px, a imagem do hero antigo. Não é usada por nada desde o
`b7fde65` (10/09), mas vai no build e é publicada. A troca da imagem de partilha
não deixou nenhum órfão. Perguntado ao Rui a 18/09 se sai: saiu no mesmo dia
(7.8).

**Verificação, a 18/09:**

- `CI=true npm run build`: `Compiled successfully.`
- Teste de contraste do hero: 18 testes a passar.
- Auditoria de contraste de todo o texto: zero falhas nas dez páginas a 380 e a
  1280px, e na página inicial também a 1024 e a 1920px.
- HTML servido (o que o WhatsApp lê): `og:image`, `og:image:secure_url` e
  `twitter:image` apontam para `nexugal-partilha.png`, servida como `image/png`
  com 109 815 bytes; o endereço antigo já não devolve imagem nenhuma; e não há
  referências ao `og-image.png` no repositório, fora deste ficheiro.
- Os oito títulos novos aparecem no separador e no `og:title` de cada página.
- Rodapé, em PT e EN, a 380 e a 1280px: a frase saiu, "Braga, Portugal" ficou,
  a última linha ficou com o copyright à esquerda e as ligações legais à direita,
  e não há scroll para o lado.

### 7.8 O fecho do lote de 18/09: a marca, o manifest e a foto órfã

Commit `2ed76ff`. **Não publicado.**

**O que se fez:**

- **Foto órfã:** `frontend/public/images/foto principal.png` apagada, a pedido
  do Rui ("Não a guardo em lado nenhum"). Antes, confirmado que não havia
  nenhuma referência no código nem na configuração (só no `CLAUDE.md`); depois,
  o build passa e a pasta `build/images` já não a tem.
- **Marca em "Nexugal"** (decisão em 7.3) em tudo o que aparece no separador, no
  Google e nas partilhas: as oito descrições do `SEO.js` (incluindo a do Sobre,
  que é do Henrique: mudou só a marca), os nomes nos dados estruturados
  (`Organization`, `WebSite`, `ProfessionalService`, os seis `provider` e
  "Serviços Nexugal"), e no `index.html` o `og:site_name`, o `author` e as
  `keywords`. Os títulos já estavam (7.7).
- **`manifest.json`:** `name` e `short_name` "Nexugal", `description`
  "Reformulação de operações com gestão implementada", `lang` pt-PT. Saiu a
  lista de serviços antigos. O formato não obriga a ter nada no lugar: a
  descrição é opcional, e passou a ser a da página inicial, como o Rui pediu. O
  `short_name` (o nome por baixo do ícone, se alguém instalar o site) também era
  "NEXUGAL" e passou a "Nexugal", para bater com o `name`. `categories`
  ("business", "technology") ficou: são categorias de loja de aplicações, não
  serviços.

**Verificado no build de produção, com o desenho simulado (7.2, ponto 5), nas
dez páginas:** título, descrição, `og:site_name`, `og:title` e os nomes nos dados
estruturados todos com "Nexugal"; um só canonical; nenhuma etiqueta repetida; e
zero "NEXUGAL" no cabeçalho, **exceto nas duas páginas da FAQ**. O HTML servido
(o que o WhatsApp lê) não tem nenhum. O `manifest.json` servido é JSON válido.
Auditoria de contraste: zero falhas nas dez páginas a 380 e a 1280px, e na
página inicial também a 1024 e a 1920px. Teste de contraste: 18 a passar.

**Ficou em aberto, e o Rui resolveu no mesmo dia (7.9): o "NEXUGAL" no texto
visível das páginas.** Não era título nem descrição, por isso não se mexeu
aqui. O que havia, fora do logótipo:

- **Perguntas da FAQ**, três em PT e três em EN ("Que tipo de serviços a NEXUGAL
  oferece?" e afins). Como o JSON-LD da FAQ lê o `translations.js`, são também
  elas que levam "NEXUGAL" para o cabeçalho das duas páginas da FAQ. A FAQ tem a
  regra do Rui de 10/09 ("nem mais uma" correção sem ele pedir).
- **Título da página do Sobre**, "Sobre a NEXUGAL" (`about.titleHighlight`, em
  azul-vivo, PT e EN): texto do Sobre, que o Rui mandou não tocar.
- **Copyright**: no rodapé da página inicial (`footer.copyright`, PT e EN) e nos
  rodapés pequenos do contacto, da FAQ, do Sobre e da política de privacidade
  (escritos nos próprios componentes; o do Sobre está na `SobrePage.js`, página
  do Sobre).
- **Política de privacidade**, "Responsável pelo Tratamento: NEXUGAL". Pode ser
  o nome legal da empresa: confirmar antes de mudar.
- **Formulário de contacto**, opção "Contacto direto da NEXUGAL" (EN "Direct
  contact from NEXUGAL") em "Como soube de nós". É também o valor que o
  formulário envia ao backend e que chega nos emails de lead: mudar o texto muda
  o que o Henrique recebe.
- **Textos para leitores de ecrã**: "NEXUGAL, ir para a página inicial" nos
  logótipos clicáveis (`Header.js`, `FAQPage.js`, `SobrePage.js` e
  `translations.js`). Em maiúsculas, alguns leitores soletram letra a letra.

Ficam de fora de qualquer pergunta: o logótipo em si (cabeçalho, rodapé, casca
das páginas, política de privacidade, admin), o admin (página interna), o
chatbot desligado (secção 5), os emails do backend (do Henrique) e o comentário
do `robots.txt`, que ninguém vê.

### 7.9 A marca no texto das páginas (18/09)

Commit `e442e27`. **Não publicado.** Pedido do Rui: "NEXUGAL" passa a "Nexugal"
em todo o texto das páginas; "O logótipo em si, que é um desenho, fica em
maiúsculas espaçadas."

**22 ocorrências mudadas**, só a grafia da marca, nem mais uma palavra:

| O quê | Onde | Quantas |
|---|---|---|
| Três perguntas da FAQ, PT e EN | `translations.js` (`faq.items`) | 6 |
| Título "Sobre a Nexugal" / "About Nexugal" | `translations.js` (`about.titleHighlight`) | 2 |
| Copyright do rodapé da página inicial, PT e EN | `translations.js` (`footer.copyright`) | 2 |
| Copyright dos rodapés pequenos | `ContactPage.js`, `FAQPage.js`, `SobrePage.js`, `PrivacyPolicyPage.js` | 4 |
| "Responsável pelo Tratamento: Nexugal" | `PrivacyPolicyPage.js` | 1 |
| Opção "Contacto direto da Nexugal" / "Direct contact from Nexugal" | `translations.js` (`contact.form.sourceOptions`) | 2 |
| Descrições para leitores de ecrã dos logótipos clicáveis | `Header.js`, `FAQPage.js`, `SobrePage.js`, e `translations.js` (`contact.logo`, PT e EN) | 5 |

A FAQ e o título do Sobre são **exceções deliberadas do Rui** às regras de não
tocar nesses textos: "muda só a forma como a marca está escrita, não muda uma
palavra do que as perguntas dizem". Na página do Sobre mudaram também o
copyright e a descrição do logótipo, porque os pontos do copyright e dos
logótipos eram "em todas as páginas". O Rui confirmou que "Nexugal" é o nome da
empresa e que a grafia não é imposta pelo registo, por isso mudou também na
política de privacidade.

**A opção do formulário e os emails do backend** (lido em `backend/main.py`,
função `send_lead_email_notification`, sem mexer): o texto da opção escolhida vai
no campo `service` e aparece em dois sítios do email de cada contacto novo, que
vai para o endereço em `NOTIFICATION_EMAIL` (por omissão
`nexugal.geral@gmail.com`):

- no assunto: `🚀 Novo Lead NEXUGAL: {nome} ({opção})`, por exemplo
  "🚀 Novo Lead NEXUGAL: João Silva (Contacto direto da Nexugal)";
- no corpo, no campo "Como soube de nós" (o rótulo sai em maiúsculas pelo estilo
  do email; o valor sai como está).

Quem escolher a opção em inglês envia "Direct contact from Nexugal". Fica também
guardado na base de dados (coluna `service`) e aparece na tabela do admin: os
contactos antigos ficam com "NEXUGAL", os novos com "Nexugal". O backend não
valida o valor contra nenhuma lista, por isso a mudança não parte o formulário.

**O que sobra em maiúsculas, fora do logótipo** (verificado com uma procura em
todo o `frontend/src` e `frontend/public`, e página a página no build):

- **no que um visitante vê: nada.** Nas dez páginas, zero "NEXUGAL" no texto,
  nas descrições para leitores de ecrã e no cabeçalho;
- **logótipo** (fica): cabeçalho, rodapé (`footer.brand.name`), casca do
  contacto, da FAQ, do Sobre e da política de privacidade;
- **fora do que se vê**, não mexido, não pedido:
  - o chatbot desligado (`src/chatbot/` e o bloco `chatbot:` do
    `translations.js`), que nenhum visitante vê (secção 5);
  - a página de admin, interna: o logótipo, dois textos de exemplo de campos e o
    assunto por omissão do email de teste, "Teste NEXUGAL", que sai pelo backend;
  - o comentário da primeira linha do `robots.txt`, que tem também um travessão;
  - o backend (do Henrique): o assunto e o rodapé do email de contactos e os
    emails de prospeção.

**Duas coisas que se viram pelo caminho, sem mexer:**

- As descrições para leitores de ecrã do `Header.js`, do `FAQPage.js` e do
  `SobrePage.js` estão escritas em português no próprio componente, por isso em
  `/us` um leitor de ecrã lê "Nexugal, ir para a página principal". A do
  contacto vem do `translations.js` e já muda de língua.
- O logótipo do rodapé da página inicial é clicável e não tem descrição para
  leitores de ecrã: o leitor lê o próprio desenho, "NEXUGAL", e alguns soletram.

**Verificação:** build com `CI=true` passa; teste de contraste com 18 a passar;
auditoria de contraste com zero falhas nas dez páginas a 380 e a 1280px, e na
página inicial também a 1024 e a 1920px; e, página a página no build, os textos
novos no ecrã (as seis perguntas, os dois títulos do Sobre, os copyrights, o
responsável pelo tratamento, a opção na lista aberta do formulário em PT e EN) e
o JSON-LD da FAQ já com "Nexugal".

### 7.10 A imagem de partilha para o corte do WhatsApp (18/09, à noite)

Commit `1c83972`. **Não publicado** (o site público está no `2af828b`, secção 6).

**O problema, visto pelo Rui depois de publicar:** o WhatsApp corta a imagem de
partilha a quadrado e ficava só o miolo da primeira versão, com metade do N de
um lado e metade da forma azul do outro.

**A imagem nova**, feita pelo Rui (`nexugal-partilha.png`, na pasta `site` dele):
N e "NEXUGAL" por baixo, ao centro, e duas formas azuis nos cantos (em cima à
direita e em baixo à esquerda). PNG verdadeiro de 1200 × 630px, 105 KB. Medido
no ficheiro: o logótipo e o nome ocupam x 422 a 778 e y 128 a 472, dentro do
quadrado central (x 285 a 915). A forma de baixo à esquerda acaba em x 242 e
fica toda de fora; a de cima à direita começa em x 887 e **ainda entra no
quadrado**, uma lasca de até 28px junto à borda direita, do topo até y 210. O
Rui viu a medida e disse que serve assim.

**Entrou com nome novo, `images/nexugal-partilha-2.png`**, e a versão anterior
saiu. O Rui mandou-a com o mesmo nome da anterior, que já estava publicada e já
tinha sido lida pelo WhatsApp; perguntou-se, e ele escolheu o nome novo (regra
em 7.4). As três etiquetas (`og:image`, `og:image:secure_url`, `twitter:image`)
apontam para ela; tipo e medidas (`image/png`, 1200 × 630) continuam a bater
certo com o ficheiro.

**Verificado:** build com `CI=true`; o HTML servido em `/` e `/faq` traz as três
etiquetas com o nome novo; a imagem servida é `image/png` de 105 199 bytes, igual
byte a byte ao ficheiro do Rui; o endereço anterior já não devolve imagem; e não
há referência ao nome anterior em lado nenhum do repositório nem do build, fora
deste ficheiro. Auditoria de contraste na página inicial, PT e EN, a 380 e a
1280px: zero falhas (as páginas não mudaram por dentro).

**Depois de publicar:** o WhatsApp também guarda a pré-visualização de cada
ligação durante algum tempo. Mensagens já enviadas ficam com a imagem antiga;
numa ligação nova, se ainda aparecer a antiga, experimentar com
`https://www.nexugal.com/?v=2`, que o WhatsApp trata como endereço novo. Para o
Facebook e o LinkedIn há ferramentas que mandam ler outra vez a página (Sharing
Debugger e Post Inspector).
