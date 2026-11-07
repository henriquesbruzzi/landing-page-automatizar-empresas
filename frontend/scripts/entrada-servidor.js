// Desenha uma página do site em Node, sem browser. Quem a usa é o
// scripts/pre-renderizar.js, que a junta num só ficheiro com o esbuild.
//
// A árvore é a do src/index.js, com o StaticRouter (o endereço vem de fora)
// no lugar do BrowserRouter. Mudar uma obriga a mudar a outra: o primeiro
// desenho no browser tem de dar exatamente este HTML.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '../src/App';

export { cabecalhoDaPagina } from '../src/components/SEO';

export function desenhar(endereco) {
  const contexto = {};
  const html = renderToString(
    <React.StrictMode>
      <HelmetProvider context={contexto}>
        <StaticRouter location={endereco}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
  const { helmet } = contexto;
  // A biblioteca escreve os hreflang e o JSON-LD (ver o topo do SEO.js)
  return { html, links: helmet.link.toString(), scripts: helmet.script.toString() };
}
