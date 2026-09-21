import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import SEO from './components/SEO';
import Header from './components/Header';
import Hero from './components/Hero';
import Exemplos from './components/Exemplos';
import Process from './components/Process';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import SobrePage from './pages/SobrePage';
import CookieBanner from './components/CookieBanner';
import BotaoContactoFlutuante from './components/BotaoContactoFlutuante';

// Páginas que quase nenhum visitante abre vêm num ficheiro à parte, que só
// descarrega quando alguém as pede. Até 21/09/2026 iam no ficheiro principal, e
// quem abria a página inicial descarregava também a administração (11% do
// código). O resto do site continua no ficheiro principal, para abrir de imediato.
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminLeadsPage = lazy(() => import('./pages/AdminLeadsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));

// Enquanto o ficheiro da página chega, fica o branco da página.
function APedido({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

// A autenticação é gerida pelo cookie HttpOnly no servidor.
// O AdminLeadsPage redireciona automaticamente para login em caso de 401.
function RequireAdminAuth({ children }) {
  return children;
}

function Layout({ lang }) {
  return (
    <>
      <SEO lang={lang} page="home" />
      <div className="relative bg-white overflow-hidden">
        {/* O hero era um vídeo escuro com um véu branco a 95% por cima, para o
            texto azul se ler. Saíram os dois: o hero traz agora o seu próprio
            fundo, e o desenho do esquema é que conta a história. */}
        <Header />
        <main>
          <Hero />
        </main>

        {/* Secções seguintes */}
        <Exemplos />
        <Process />
        <CallToAction />
        <Footer />
        <CookieBanner />
        <BotaoContactoFlutuante />
      </div>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Routes>
        {/* PT — Página principal */}
        <Route
          path="/"
          element={
            <Layout lang="pt" />
          }
        />
        {/* PT — Formulário de contacto */}
        <Route
          path="/contacto"
          element={
            <>
              <SEO lang="pt" page="contact" />
              <ContactPage />
            </>
          }
        />

        {/* PT — FAQ */}
        <Route
          path="/faq"
          element={
            <>
              <SEO lang="pt" page="faq" />
              <FAQPage />
            </>
          }
        />

        {/* EN — Página principal */}
        <Route
          path="/us"
          element={
            <Layout lang="en" />
          }
        />
        {/* EN — Contact form */}
        <Route
          path="/us/contact"
          element={
            <>
              <SEO lang="en" page="contact" />
              <ContactPage />
            </>
          }
        />
        {/* EN — FAQ */}
        <Route
          path="/us/faq"
          element={
            <>
              <SEO lang="en" page="faq" />
              <FAQPage />
            </>
          }
        />

        {/* PT, quem somos */}
        <Route
          path="/sobre"
          element={
            <>
              <SEO lang="pt" page="about" />
              <SobrePage />
            </>
          }
        />
        {/* EN, about */}
        <Route
          path="/us/about"
          element={
            <>
              <SEO lang="en" page="about" />
              <SobrePage />
            </>
          }
        />

        {/* Admin — Login */}
        <Route
          path="/admin/login"
          element={
            <APedido>
              <AdminLoginPage />
            </APedido>
          }
        />

        {/* Admin — Leads (restrito) */}
        <Route
          path="/admin/leads"
          element={
            <RequireAdminAuth>
              <APedido>
                <AdminLeadsPage />
              </APedido>
            </RequireAdminAuth>
          }
        />

        {/* PT — Política de Privacidade */}
        <Route
          path="/privacidade"
          element={
            <>
              <SEO lang="pt" page="privacy" />
              <APedido>
                <PrivacyPolicyPage />
              </APedido>
            </>
          }
        />

        {/* EN — Privacy Policy */}
        <Route
          path="/us/privacy"
          element={
            <>
              <SEO lang="en" page="privacy" />
              <APedido>
                <PrivacyPolicyPage />
              </APedido>
            </>
          }
        />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
