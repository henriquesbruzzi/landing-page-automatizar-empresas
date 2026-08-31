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

- `src/components/` — Header, Hero, About, Services, Process, CallToAction, ContactPage, FAQPage, Footer, SEO
- `src/pages/` — AdminLoginPage, AdminLeadsPage
- `src/chatbot/` — widget de chat
- `src/i18n/translations.js` — **todo o texto do site em PT e EN vive aqui**.
  Para mudar palavras no site, é quase sempre este ficheiro, não os componentes.
- `public/` — imagens, vídeo, ícones, sitemap.xml, robots.txt
- `tailwind.config.js` — cores e tipografia

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
   por concluído: `cd frontend && npm install && npm run build`.
4. **O Claude faz o commit e o push do ramo** (`git push -u origin rui/<assunto>`).
   Não mandar o Rui publicar pelo GitHub Desktop — ele já tem o ramo no GitHub
   sem fazer nada. Única exceção: `rui/frontend` publica o site real (ver ponto
   6), por isso esse pede confirmação expressa antes do push.
5. O Rui vê o resultado localmente, no `npm start` (ver abaixo). **Não há links
   de pré-visualização por ramo** — a Vercel só constrói o ramo de produção.
6. Se estiver bem: Pull Request → o Henrique revê → merge.

Para ver o site localmente: `cd frontend && npm install && npm start`
(precisa de Node.js instalado; abre em http://localhost:3000).

---

## 5. Armadilhas deste repo — parece errado e não é (ou é mesmo)

- **`frontend/vercel.json` está morto.** Quem manda é o `vercel.json` da raiz.
  Editar o de dentro não faz nada. Não vale a pena tentar.
- **O chatbot não é IA.** As respostas estão escritas à mão em
  `src/chatbot/services/chatService.js` (`simulateAIResponse`). Não fala com o
  backend nem com modelo nenhum. Mudar o que ele diz = editar esse ficheiro.
- **O chatbot afirma "10+ anos de experiência e 200+ projetos entregues".**
  A empresa está a nascer. Isto é para corrigir, não para replicar noutros sítios.
- **`src/components/SEO.js`** tem `BASE_URL` com fallback para
  `https://projeto-teste-weld.vercel.app` — domínio errado, contamina canonical
  e sitemap. Corrigir quando houver domínio próprio.
- **O site é 100% renderizado no browser.** Quem abrir sem JavaScript vê página
  em branco. Mau para SEO — assunto por decidir, não resolver por iniciativa própria.
- **`backend/main.py` tem valores por omissão perigosos**
  (`ADMIN_PASSWORD="admin123"`, `JWT_SECRET="change-this-in-production"`,
  `allow_origins=["*"]`). É território do Henrique — reportar, não corrigir.

---

## 6. Estado da infraestrutura

- **Vercel:** projeto `nexusgal-laddingpage`. Verificado a 30/08/2026: **está
  ligado ao GitHub e faz deploy automático, mas o ramo de produção é
  `rui/frontend`, não o `main`.** Ou seja, **qualquer push para `rui/frontend`
  vai direto para o nexugal.com, sem passar por Pull Request** — o oposto do
  fluxo da secção 4. Enquanto o Henrique não mudar o ramo de produção para
  `main`, um merge em `rui/frontend` é o mesmo que publicar.
  Para confirmar o que está mesmo online: descarregar o `static/js/main.*.js`
  do site e procurar lá dentro `REACT_APP_VERCEL_GIT_COMMIT_SHA`.
  (A versão anterior desta secção dizia que a Vercel não estava ligada ao
  GitHub e que os deploys eram manuais por CLI. Já não é verdade.)
- **Railway:** corre o backend (`backend/Procfile` → `uvicorn main:app`) e a
  base de dados Postgres.
- **GitHub:** repo público, na conta pessoal do Henrique. O Rui é collaborator.
