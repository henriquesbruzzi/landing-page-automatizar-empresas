import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// A autenticação é gerida pelo cookie HttpOnly no servidor.
// O AdminLeadsPage redireciona automaticamente para login em caso de 401.
function RequireAdminAuth({ children }) {
  return children;
}

function Layout({ lang }) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <>
      <SEO lang={lang} page="home" />
      <div className="relative bg-black overflow-hidden">
        {/* Vídeo de fundo em loop — apenas no Hero */}
        <div className="relative min-h-screen">
          {/* Imagem estática — aparece até o vídeo carregar */}
          <img
            src="/images/foto principal.png"
            alt="NEXUGAL — Consultoria tecnológica, escritório moderno com equipa de desenvolvimento"
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            loading="eager"
            width="1920"
            height="1080"
          />

          {/* Vídeo de fundo */}
          <video
            autoPlay
            loop
            muted
            playsInline
            onCanPlayThrough={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          >
            <source src="/videos/landingpage.mp4" type="video/mp4" />
          </video>

          <div className="relative z-10">
            <Header />
            <main>
              <Hero />
            </main>
          </div>
        </div>

        {/* Secções com fundo sólido preto */}
        <Services />
        <Process />
        <About />
        <CallToAction />
        <Footer />
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
      </Routes>
    </LanguageProvider>
  );
}

export default App;
