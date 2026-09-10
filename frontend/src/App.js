import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import SEO from './components/SEO';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Process from './components/Process';
import About from './components/About';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLeadsPage from './pages/AdminLeadsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookieBanner from './components/CookieBanner';

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
        <Services />
        <Process />
        <About />
        <CallToAction />
        <Footer />
        <CookieBanner />
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

        {/* Admin — Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin — Leads (restrito) */}
        <Route
          path="/admin/leads"
          element={
            <RequireAdminAuth>
              <AdminLeadsPage />
            </RequireAdminAuth>
          }
        />

        {/* PT — Política de Privacidade */}
        <Route
          path="/privacidade"
          element={
            <>
              <SEO lang="pt" page="home" />
              <PrivacyPolicyPage />
            </>
          }
        />

        {/* EN — Privacy Policy */}
        <Route
          path="/us/privacy"
          element={
            <>
              <SEO lang="en" page="home" />
              <PrivacyPolicyPage />
            </>
          }
        />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
