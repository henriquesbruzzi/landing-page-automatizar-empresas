import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ContactPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const f = t.contact.form;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language: lang,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || (lang === 'pt' ? 'Falha ao enviar formulário.' : 'Failed to send form.'));
      }

      setIsSending(false);
      setIsSent(true);
      setFormData({ name: '', email: '', phone: '', company: '', service: '', message: '' });
    } catch (error) {
      setIsSending(false);
      setSubmitError(error.message || (lang === 'pt' ? 'Erro inesperado.' : 'Unexpected error.'));
    }
  };

  const goHome = () => {
    navigate(lang === 'pt' ? '/' : '/us');
  };

  const inputClasses =
    'w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-orbitron tracking-wide placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/50 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(0,209,255,0.1)] transition-all duration-300';

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30"
      >
        <source src="/videos/landingpage.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-[1]"></div>

      {/* Conteúdo */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header simples */}
        <div className="px-6 md:px-10 lg:px-16 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={goHome}
              className="font-orbitron text-white/50 text-xs sm:text-sm tracking-[0.15em] hover:text-cyan-neon transition-colors duration-300"
            >
              {t.contact.back}
            </button>
            <span className="font-orbitron text-white/70 text-lg font-bold tracking-[0.2em]">
              NEXUGAL
            </span>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="font-orbitron text-cyan-neon text-xs tracking-[0.3em] uppercase mb-4 block">
                {t.contact.subtitle}
              </span>
              <h1 id="contact-title" className="font-orbitron text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-4">
                {t.contact.title}
                <span className="text-cyan-neon">{t.contact.titleHighlight}</span>
              </h1>
              <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                {t.contact.description}
              </p>
            </div>

            {/* Mensagem de sucesso */}
            {isSent && (
              <div className="mb-10 p-6 rounded-2xl border border-cyan-neon/30 bg-cyan-neon/5 text-center animate-fade-in">
                <div className="text-cyan-neon text-3xl mb-3">✓</div>
                <p className="font-orbitron text-cyan-neon text-sm tracking-wide">
                  {f.success}
                </p>
              </div>
            )}

            {/* Form */}
            {!isSent && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome e Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="font-orbitron text-white/50 text-xs tracking-[0.15em] mb-2 block">
                      {f.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={f.namePlaceholder}
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="font-orbitron text-white/50 text-xs tracking-[0.15em] mb-2 block">
                      {f.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={f.emailPlaceholder}
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Telefone e Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="font-orbitron text-white/50 text-xs tracking-[0.15em] mb-2 block">
                      {f.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={f.phonePlaceholder}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="font-orbitron text-white/50 text-xs tracking-[0.15em] mb-2 block">
                      {f.company}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={f.companyPlaceholder}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Serviço */}
                <div>
                  <label className="font-orbitron text-white/50 text-xs tracking-[0.15em] mb-2 block">
                    {f.service}
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className={`${inputClasses} appearance-none cursor-pointer`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300D1FF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2rem',
                    }}
                  >
                    <option value="" disabled className="bg-black text-white/40">
                      {f.servicePlaceholder}
                    </option>
                    {f.serviceOptions.map((option, i) => (
                      <option key={i} value={option} className="bg-black text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="font-orbitron text-white/50 text-xs tracking-[0.15em] mb-2 block">
                    {f.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={f.messagePlaceholder}
                    required
                    rows={5}
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={isSending}
                  className={`
                    w-full
                    font-orbitron
                    text-sm
                    font-normal
                    tracking-[0.15em]
                    px-10
                    py-4
                    rounded-full
                    border
                    transition-all
                    duration-500
                    ${
                      isSending
                        ? 'border-white/20 text-white/40 bg-white/5 cursor-not-allowed'
                        : 'border-cyan-neon text-white bg-cyan-neon/10 hover:bg-cyan-neon/20 hover:shadow-neon-glow active:scale-[0.98]'
                    }
                  `}
                >
                  {isSending ? f.sending : f.submit}
                </button>

                {submitError && (
                  <p className="text-red-400 text-sm text-center">{submitError}</p>
                )}
              </form>
            )}

            {/* Botão de voltar a enviar após sucesso */}
            {isSent && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setIsSent(false)}
                  className="font-orbitron text-cyan-neon/60 text-xs tracking-[0.15em] hover:text-cyan-neon transition-colors duration-300"
                >
                  {lang === 'pt' ? 'Enviar outra mensagem' : 'Send another message'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pb-8">
          <p className="text-center text-white/15 text-xs tracking-[0.15em] font-orbitron">
            © {new Date().getFullYear()} NEXUGAL
          </p>
        </footer>
      </main>
    </div>
  );
}

export default ContactPage;
