import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import Dropdown from './Dropdown';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function ContactPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const f = t.contact.form;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    sourceOther: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [erroOrigem, setErroOrigem] = useState('');

  // A última opção da lista é sempre o "Outro". Quando é essa, abre-se um
  // campo de texto para o visitante escrever a origem pelas próprias palavras.
  const opcaoOutro = f.sourceOptions[f.sourceOptions.length - 1];
  const escreveOrigem = formData.source === opcaoOutro;

  // O que segue para o backend: a opção escolhida ou, no caso do "Outro",
  // o texto escrito à frente.
  const origem = escreveOrigem
    ? `${opcaoOutro}: ${formData.sourceOther.trim()}`
    : formData.source;

  // O aviso é o mesmo sítio, mas o realce vermelho vai para o campo em falta
  const erroLista = escreveOrigem ? '' : erroOrigem;
  const erroTexto = escreveOrigem ? erroOrigem : '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const escolherOrigem = (valor) => {
    setFormData((dados) => ({ ...dados, source: valor, sourceOther: '' }));
    setErroOrigem('');
  };

  const escreverOrigem = (e) => {
    setFormData((dados) => ({ ...dados, sourceOther: e.target.value }));
    setErroOrigem('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mensagem = formData.message.trim();

    // Validação também no envio, não apenas no que se vê no ecrã
    if (!formData.source) {
      setErroOrigem(f.sourceError);
      return;
    }

    if (escreveOrigem && !formData.sourceOther.trim()) {
      setErroOrigem(f.sourceOtherError);
      return;
    }

    setIsSending(true);
    setSubmitError('');
    setErroOrigem('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          // O backend guarda isto na coluna `service` (é dele, não se mexe).
          // Desde que o campo passou a ser "Como soube de nós?", é a origem
          // do contacto que vai nessa coluna.
          service: origem,
          // O backend exige mensagem. Quando o visitante não escreve nada,
          // segue uma linha automática, para o pedido não ser recusado.
          message: mensagem || `${f.messageAutoPrefix}${origem}.`,
          language: lang,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || (lang === 'pt' ? 'Falha ao enviar formulário.' : 'Failed to send form.'));
      }

      setIsSending(false);
      setIsSent(true);
      setFormData({ name: '', email: '', phone: '', company: '', source: '', sourceOther: '', message: '' });
    } catch (error) {
      setIsSending(false);
      setSubmitError(error.message || (lang === 'pt' ? 'Erro inesperado.' : 'Unexpected error.'));
    }
  };

  const goHome = () => {
    navigate(lang === 'pt' ? '/' : '/us');
  };

  const inputClasses =
    'w-full bg-white/[0.06] border border-white/20 rounded-xl px-5 py-4 text-white text-sm tracking-wide placeholder:text-gray-400 focus:outline-none focus:border-cyan-neon focus:bg-white/[0.1] focus:shadow-[0_0_20px_rgba(0,209,255,0.25)] transition-all duration-300';

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-25"
      >
        <source src="/videos/landingpage.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black z-[1]"></div>

      {/* Conteúdo */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header simples */}
        <div className="px-6 md:px-10 lg:px-16 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={goHome}
              className="text-gray-200 font-medium text-xs sm:text-sm tracking-[0.15em] hover:text-cyan-neon transition-colors duration-300 flex items-center gap-2"
            >
              <span>←</span> {t.contact.back}
            </button>
            <button
              type="button"
              onClick={goHome}
              aria-label={t.contact.logo}
              className="font-orbitron text-cyan-neon text-xl font-bold tracking-[0.2em] cursor-pointer hover:text-white transition-colors duration-300"
            >
              NEXUGAL
            </button>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="font-display text-cyan-neon text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {t.contact.subtitle}
              </span>
              <h1 id="contact-title" className="font-display text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-4">
                {t.contact.title}
                <span className="text-cyan-neon ml-3">{t.contact.titleHighlight}</span>
              </h1>
              <p className="text-gray-200 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                {t.contact.description}
              </p>
            </div>

            {/* Mensagem de sucesso */}
            {isSent && (
              <div className="mb-10 p-6 rounded-2xl border border-cyan-neon/40 bg-cyan-neon/10 text-center animate-fade-in">
                <div className="text-cyan-neon text-4xl mb-3 font-bold">✓</div>
                <p className="text-cyan-neon text-base tracking-wide font-semibold">
                  {f.success}
                </p>
              </div>
            )}

            {/* Form */}
            {!isSent && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome e Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-200 text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={f.namePlaceholder}
                      autoComplete="name"
                      maxLength={120}
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="text-gray-200 text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={f.emailPlaceholder}
                      autoComplete="email"
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Telefone e Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-200 text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.phone}
                    </label>
                    {/* Telefone de qualquer país: aceita o sinal +, espaços,
                        parênteses, pontos e traços, e não prende o número a
                        um número certo de dígitos. O limite de 40 caracteres
                        é o mesmo que o backend já aceita. */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={f.phonePlaceholder}
                      inputMode="tel"
                      autoComplete="tel"
                      pattern="[+0-9 ().-]+"
                      title={f.phoneHint}
                      maxLength={40}
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="text-gray-200 text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.company}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={f.companyPlaceholder}
                      autoComplete="organization"
                      maxLength={120}
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Como soube de nós */}
                <div>
                  <label id="etiqueta-origem" className="text-gray-200 text-xs font-medium tracking-[0.15em] mb-2 block">
                    {f.source}
                  </label>
                  <Dropdown
                    labelId="etiqueta-origem"
                    value={formData.source}
                    options={f.sourceOptions}
                    placeholder={f.sourcePlaceholder}
                    onChange={escolherOrigem}
                    campoClasses={inputClasses}
                    erro={erroLista}
                    erroId="erro-origem"
                  />
                  {escreveOrigem && (
                    <input
                      type="text"
                      name="sourceOther"
                      value={formData.sourceOther}
                      onChange={escreverOrigem}
                      placeholder={f.sourceOtherPlaceholder}
                      // O backend só aceita 120 caracteres nesta coluna, e o
                      // prefixo "Outro: " já leva alguns
                      maxLength={100}
                      autoFocus
                      aria-label={f.sourceOtherPlaceholder}
                      aria-invalid={erroTexto ? 'true' : 'false'}
                      aria-describedby={erroTexto ? 'erro-origem' : undefined}
                      className={`${inputClasses} mt-3 ${erroTexto ? 'ring-1 ring-red-400/70' : ''}`}
                    />
                  )}
                  {erroOrigem && (
                    <p id="erro-origem" role="alert" className="text-red-400 text-xs mt-2 leading-relaxed">
                      {erroOrigem}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="message" className="text-gray-200 text-xs font-medium tracking-[0.15em] mb-2 block">
                    {f.messageOptional}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={f.messagePlaceholder}
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
                    text-sm
                    font-semibold
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
                        : 'border-cyan-neon text-white bg-cyan-neon/20 hover:bg-cyan-neon/30 hover:shadow-neon-glow-lg active:scale-[0.98]'
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
                  className="text-cyan-neon text-sm tracking-[0.15em] hover:underline transition-colors duration-300"
                >
                  {lang === 'pt' ? 'Enviar outra mensagem' : 'Send another message'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pb-8">
          <p className="text-center text-gray-400 text-xs tracking-[0.15em]">
            © {new Date().getFullYear()} NEXUGAL
          </p>
        </footer>
      </main>
    </div>
  );
}

export default ContactPage;
