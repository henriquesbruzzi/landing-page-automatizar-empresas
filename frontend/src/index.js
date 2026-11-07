import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';

const raiz = document.getElementById('root');

// A mesma árvore do scripts/entrada-servidor.js, que desenha / e /us no fim
// do build. Mudar uma obriga a mudar a outra.
const site = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// / e /us chegam já desenhadas no HTML (scripts/pre-renderizar.js): o React
// aproveita o que lá está e só lhe liga os cliques (hydrateRoot). As outras
// páginas chegam com o #root vazio e desenham-se de raiz, como sempre.
if (raiz.firstElementChild) {
  ReactDOM.hydrateRoot(raiz, site);
} else {
  ReactDOM.createRoot(raiz).render(site);
}
