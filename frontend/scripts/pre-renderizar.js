/* eslint-disable no-console */
/**
 * Grava a página inicial e a FAQ já desenhadas, em português (build/index.html,
 * build/faq/index.html) e em inglês (build/us/index.html,
 * build/us/faq/index.html). Corre no fim do `npm run build`, depois do
 * react-scripts build. Uma página nova entra em PAGINAS, mais abaixo, e no
 * vercel.json da raiz.
 *
 * Porquê: sem isto, o HTML que o servidor entrega tem o #root vazio e só a
 * palavra "Nexugal". As pré-visualizações de ligações (WhatsApp, LinkedIn,
 * email), alguns motores de pesquisa e as ferramentas de IA não correm
 * JavaScript e viam a página vazia, e o /us com as etiquetas em português.
 *
 * Como: o próprio React desenha cada página em Node (renderToString, em
 * scripts/entrada-servidor.js), sem browser. Um browser no build (Puppeteer,
 * Playwright) precisava de um Chrome no build da Vercel, que é Amazon Linux e
 * não traz as bibliotecas dele. No browser, o src/index.js aproveita este
 * HTML (hydrateRoot) em vez de desenhar a página outra vez.
 *
 * O cabeçalho de cada página (título, descrição, og:, twitter:, canonical,
 * hreflang, JSON-LD e o lang do <html>) sai dos mesmos sítios que o browser
 * usa: o cabecalhoDaPagina e a biblioteca, no SEO.js.
 *
 * As outras páginas (/contacto, /privacidade, o admin) continuam a ser
 * desenhadas no browser, a partir do build/app.html, que é o index.html do
 * react-scripts tal como saiu (o vercel.json da raiz manda-as para lá).
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const RAIZ = path.resolve(__dirname, '..');
const BUILD = path.join(RAIZ, 'build');
const CONCHA = path.join(BUILD, 'app.html');
const PACOTE = path.join(RAIZ, 'node_modules', '.cache', 'nexugal-pre-renderizar', 'servidor.js');

// page é o do SEO.js (o mesmo que o App.js dá a cada rota)
const PAGINAS = [
  { endereco: '/', lang: 'pt', page: 'home', destino: 'index.html' },
  { endereco: '/us', lang: 'en', page: 'home', destino: path.join('us', 'index.html') },
  { endereco: '/faq', lang: 'pt', page: 'faq', destino: path.join('faq', 'index.html') },
  { endereco: '/us/faq', lang: 'en', page: 'faq', destino: path.join('us', 'faq', 'index.html') },
];

function falhar(mensagem) {
  console.error(`\npre-renderizar: ${mensagem}\n`);
  process.exit(1);
}

const atributo = (texto) =>
  String(texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textoHtml = (texto) => String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Troca uma vez, e só uma: se o modelo mudar e a etiqueta deixar de existir
// (ou aparecer duas vezes), o build para em vez de sair uma página errada.
function trocar(html, procura, novo, nome) {
  const encontrados = html.match(new RegExp(procura.source, 'g')) || [];
  if (encontrados.length !== 1) falhar(`esperava 1 "${nome}" no index.html e há ${encontrados.length}`);
  // Com uma função, o texto entra tal e qual. Com uma frase, o replace lia
  // os $ como instruções: um "US$10" ou um "$'" num texto colava pedaços do
  // ficheiro no meio da página, sem erro nenhum.
  return html.replace(procura, () => novo);
}

function meta(html, tipo, nome, valor) {
  const procura = new RegExp(`<meta ${tipo}="${nome.replace(/[.:]/g, '\\$&')}" content="[^"]*"\\s*/?>`);
  return trocar(html, procura, `<meta ${tipo}="${nome}" content="${atributo(valor)}"/>`, nome);
}

function paginaPreenchida(modelo, cabecalho, desenho) {
  let html = modelo;
  html = trocar(html, /<html lang="[^"]*"/, `<html lang="${cabecalho.htmlLang}"`, 'html lang');
  html = trocar(html, /<title>[^<]*<\/title>/, `<title>${textoHtml(cabecalho.titulo)}</title>`, 'title');
  html = meta(html, 'name', 'description', cabecalho.descricao);
  html = meta(html, 'property', 'og:type', 'website');
  html = meta(html, 'property', 'og:title', cabecalho.titulo);
  html = meta(html, 'property', 'og:description', cabecalho.descricao);
  html = meta(html, 'property', 'og:url', cabecalho.canonical);
  html = meta(html, 'property', 'og:locale', cabecalho.ogLocale);
  html = meta(html, 'property', 'og:locale:alternate', cabecalho.ogLocaleAlternativo);
  html = meta(html, 'property', 'og:image', cabecalho.imagem);
  html = meta(html, 'property', 'og:image:secure_url', cabecalho.imagem);
  html = meta(html, 'property', 'og:image:alt', cabecalho.altImagem);
  html = meta(html, 'name', 'twitter:card', 'summary_large_image');
  html = meta(html, 'name', 'twitter:title', cabecalho.titulo);
  html = meta(html, 'name', 'twitter:description', cabecalho.descricao);
  html = meta(html, 'name', 'twitter:image', cabecalho.imagem);
  html = meta(html, 'name', 'twitter:image:alt', cabecalho.altImagem);

  // O canonical, os hreflang e o JSON-LD não existem no modelo (ver o topo do
  // SEO.js). No browser, o efeito e a biblioteca encontram-nos cá e
  // reaproveitam-nos, em vez de os repetir.
  if (/rel="canonical"/.test(html)) falhar('o index.html já traz um canonical');
  const extra = `<link rel="canonical" href="${atributo(cabecalho.canonical)}"/>${desenho.links}${desenho.scripts}`;
  html = trocar(html, /<\/head>/, `${extra}</head>`, '</head>');

  // O aviso para ativar o JavaScript deixa de ser verdade nestas páginas
  html = trocar(html, /<noscript>[\s\S]*?<\/noscript>/, '', 'noscript');

  html = trocar(html, /<div id="root"><\/div>/, `<div id="root">${desenho.html}</div>`, 'div#root vazio');
  return html;
}

async function main() {
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) falhar('não há build/index.html: correr primeiro o react-scripts build');

  // O modelo é o index.html do react-scripts, com o #root vazio. Fica guardado
  // como app.html (serve as outras páginas) e é dele que se parte se o script
  // correr outra vez sobre o mesmo build.
  if (!fs.existsSync(CONCHA)) fs.copyFileSync(path.join(BUILD, 'index.html'), CONCHA);
  const modelo = fs.readFileSync(CONCHA, 'utf8');
  if (!modelo.includes('<div id="root"></div>')) falhar('o build/app.html não tem o #root vazio');

  await esbuild.build({
    entryPoints: [path.join(__dirname, 'entrada-servidor.js')],
    outfile: PACOTE,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.css': 'empty' },
    // O React, o router e a biblioteca do SEO vêm do node_modules, os mesmos
    // que o react-scripts pôs no site
    packages: 'external',
    logLevel: 'warning',
  });

  // Como no react-scripts build. As variáveis REACT_APP_* chegam do ambiente,
  // as mesmas que o react-scripts leu.
  process.env.NODE_ENV = 'production';
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const { desenhar, cabecalhoDaPagina } = require(PACOTE);

  for (const pagina of PAGINAS) {
    const desenho = desenhar(pagina.endereco);
    if (!desenho.html || desenho.html.length < 1000) falhar(`${pagina.endereco} saiu vazia`);
    const html = paginaPreenchida(modelo, cabecalhoDaPagina(pagina.lang, pagina.page), desenho);
    const destino = path.join(BUILD, pagina.destino);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);
    console.log(`pre-renderizar: ${pagina.endereco} -> build/${pagina.destino.replace(/\\/g, '/')} (${Math.round(html.length / 1024)} KB)`);
  }
}

main().catch((erro) => falhar(erro && erro.stack ? erro.stack : String(erro)));
