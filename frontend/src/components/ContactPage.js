import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import Dropdown from './Dropdown';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// O backend recusa um pedido inválido com um campo `detail`, que tanto pode ser
// uma frase como a lista de erros do FastAPI: cada item traz o campo recusado
// em `loc` e a razão em `msg`, sempre em inglês.
//
// Até 24/09/2026 essa lista era entregue ao `new Error` tal e qual, e o
// visitante via "[object Object]" no ecrã. Aqui procura-se o campo recusado e
// devolve-se a frase que lhe corresponde no translations.js, na língua da
// página. Se o campo não for nenhum dos conhecidos, fica o aviso geral.
function erroLegivel(data, f) {
  const detalhe = data && data.detail;

  if (typeof detalhe === 'string' && detalhe.trim()) {
    return detalhe.trim();
  }

  if (Array.isArray(detalhe)) {
    const porCampo = {
      name: f.nameError,
      email: f.emailError,
      phone: f.phoneError,
      company: f.companyError,
      service: f.sourceError,
      message: f.messageError,
    };

    const frases = detalhe
      .map((item) => {
        const loc = item && item.loc;
        return Array.isArray(loc) ? porCampo[loc[loc.length - 1]] : undefined;
      })
      .filter((frase, i, todas) => frase && todas.indexOf(frase) === i);

    if (frases.length) {
      return frases.join(' ');
    }
  }

  return f.sendError;
}

// Um endereço tem de ter um @ e um domínio com terminação. O `type="email"` do
// browser não chega: aceita "rui@exemplo", que não existe em lado nenhum.
const EMAIL_VALIDO = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// Os domínios que aparecem quase sempre, em Portugal e fora dele. **Não é uma
// lista fechada de endereços aceites:** serve só para reconhecer uma gralha e
// sugerir a correção. Um domínio que não esteja aqui passa na mesma.
const DOMINIOS_COMUNS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'outlook.pt', 'live.com',
  'yahoo.com', 'yahoo.es', 'icloud.com', 'me.com', 'aol.com', 'gmx.com',
  'mail.com', 'protonmail.com', 'proton.me',
  'sapo.pt', 'iol.pt', 'clix.pt', 'netcabo.pt', 'meo.pt', 'nos.pt', 'vodafone.pt',
  'hotmail.pt', 'gmail.pt',
];

// Quantas letras é preciso trocar, juntar ou tirar para chegar de uma palavra à
// outra. Uma gralha fica a uma ou duas; um domínio diferente fica muito mais
// longe. É o que separa "gmail.con" de "nexugal.com".
function distancia(a, b) {
  const linha = Array.from({ length: b.length + 1 }, (uu, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const guardado = linha[j];
      linha[j] = a[i - 1] === b[j - 1]
        ? anterior
        : 1 + Math.min(anterior, linha[j], linha[j - 1]);
      anterior = guardado;
    }
  }
  return linha[b.length];
}

// Devolve o endereço corrigido quando o domínio escrito é quase um dos comuns,
// ou vazio quando não há nada a sugerir. Nunca recusa nada: só sugere.
function sugerirEmail(email) {
  const partes = String(email).trim().toLowerCase().split('@');
  if (partes.length !== 2 || !partes[0] || !partes[1]) {
    return '';
  }

  const dominio = partes[1];
  if (DOMINIOS_COMUNS.includes(dominio)) {
    return '';
  }

  let melhor = '';
  let menor = Infinity;
  DOMINIOS_COMUNS.forEach((candidato) => {
    const d = distancia(dominio, candidato);
    if (d < menor) {
      menor = d;
      melhor = candidato;
    }
  });

  // Nos domínios curtos uma só letra de diferença já pode ser outro domínio a
  // sério (sapo.pt e nos.pt são ambos reais), por isso aperta-se o critério.
  const limite = dominio.length <= 8 ? 1 : 2;
  return menor <= limite ? `${partes[0]}@${melhor}` : '';
}

// Um número português tem nove dígitos. O máximo internacional são quinze
// (norma E.164), contando o indicativo do país.
const MINIMO_DIGITOS = 9;
const MAXIMO_DIGITOS = 15;
const contarDigitos = (valor) => String(valor).replace(/\D/g, '').length;

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
  const [sugestaoEmail, setSugestaoEmail] = useState('');

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
    // Enquanto a pessoa escreve o email, a sugestão antiga deixa de valer
    if (e.target.name === 'email') {
      setSugestaoEmail('');
    }
  };

  // A gralha só se procura quando a pessoa sai do campo. A meio da escrita
  // qualquer endereço parece errado, e sugerir aí é ruído.
  const verificarEmail = () => {
    setSugestaoEmail(sugerirEmail(formData.email));
  };

  const aceitarSugestaoEmail = () => {
    setFormData((dados) => ({ ...dados, email: sugestaoEmail }));
    setSugestaoEmail('');
    setSubmitError('');
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

    const nome = formData.name.trim();
    const mensagem = formData.message.trim();

    setSubmitError('');

    // Validação também no envio, não apenas no que se vê no ecrã.
    // O nome e a mensagem têm mínimos que o backend recusa (2 e 5 caracteres):
    // são apanhados aqui para o visitante saber logo o que falta, na língua da
    // página, em vez de esperar pela recusa do servidor.
    if (nome.length < 2) {
      setSubmitError(f.nameError);
      return;
    }

    const email = formData.email.trim();
    if (!EMAIL_VALIDO.test(email)) {
      setSubmitError(f.emailError);
      return;
    }

    // Conta os dígitos e ignora o resto: assim "+351 912 345 678" e
    // "912345678" valem o mesmo, e um número cortado a meio não passa.
    const digitos = contarDigitos(formData.phone);
    if (digitos < MINIMO_DIGITOS || digitos > MAXIMO_DIGITOS) {
      setSubmitError(f.phoneDigitsError);
      return;
    }

    if (!formData.source) {
      setErroOrigem(f.sourceError);
      return;
    }

    if (escreveOrigem && !formData.sourceOther.trim()) {
      setErroOrigem(f.sourceOtherError);
      return;
    }

    setIsSending(true);
    setErroOrigem('');

    // O backend exige uma mensagem com pelo menos 5 caracteres, mas no site ela
    // é facultativa. Em vez de travar quem escreve pouco ("ola", "sim"), a
    // linha automática vai à frente e o que a pessoa escreveu segue atrás:
    // assim nenhum contacto se perde por causa do tamanho da mensagem.
    // (Solução do Henrique, 23/09/2026. Decisão do Rui a 24/09.)
    let mensagemFinal = mensagem;
    if (!mensagemFinal) {
      mensagemFinal = `${f.messageAutoPrefix}${origem}.`;
    } else if (mensagemFinal.length < 5) {
      mensagemFinal = `${f.messageAutoPrefix}${origem}. ${mensagemFinal}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nome,
          email,
          phone: formData.phone,
          company: formData.company,
          // O backend guarda isto na coluna `service` (é dele, não se mexe).
          // Desde que o campo passou a ser "Como soube de nós?", é a origem
          // do contacto que vai nessa coluna.
          service: origem,
          message: mensagemFinal,
          language: lang,
        }),
      });

      // Uma resposta que não seja JSON (o servidor em baixo devolve uma página
      // de erro) não pode rebentar aqui: trata-se como recusa sem detalhe.
      let data = null;
      try {
        data = await response.json();
      } catch (semJson) {
        data = null;
      }

      if (!response.ok || !data || !data.success) {
        setIsSending(false);
        setSubmitError(erroLegivel(data, f));
        return;
      }

      setIsSending(false);
      setIsSent(true);
      setSugestaoEmail('');
      setFormData({ name: '', email: '', phone: '', company: '', source: '', sourceOther: '', message: '' });
    } catch (error) {
      // Aqui só chegam as falhas de rede: sem internet, servidor inalcançável ou
      // pedido barrado antes de sair. A mensagem do browser ("Failed to fetch")
      // vem sempre em inglês e não diz nada a ninguém, por isso não se mostra.
      setIsSending(false);
      setSubmitError(f.networkError);
    }
  };

  const goHome = () => {
    navigate(lang === 'pt' ? '/' : '/us');
  };

  const inputClasses =
    'w-full bg-white border border-linha rounded-xl px-5 py-4 text-azul-profundo text-sm tracking-wide placeholder:text-suave focus:outline-none focus:border-azul-medio focus:shadow-azul transition-all duration-300';

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Havia aqui um vídeo de fundo (1,7 MB), do tempo do site preto, com um
          véu branco a 90-95% por cima: via-se a 2%. Saiu a 21/09/2026. */}

      {/* Conteúdo */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header simples */}
        <div className="px-6 md:px-10 lg:px-16 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={goHome}
              className="text-texto font-medium text-xs sm:text-sm tracking-[0.15em] hover:text-azul-medio transition-colors duration-300 flex items-center gap-2"
            >
              <span>←</span> {t.contact.back}
            </button>
            <button
              type="button"
              onClick={goHome}
              aria-label={t.contact.logo}
              className="font-orbitron text-azul-medio text-xl font-bold tracking-[0.2em] cursor-pointer hover:text-azul-profundo transition-colors duration-300"
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
              <span className="font-display text-azul-medio text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {t.contact.subtitle}
              </span>
              <h1 id="contact-title" className="font-display text-azul-profundo text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-4">
                {t.contact.title}
                <span className="text-azul-vivo">{t.contact.titleHighlight}</span>
              </h1>
              <p className="text-texto text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                {t.contact.description}
              </p>
            </div>

            {/* Mensagem de sucesso */}
            {isSent && (
              <div className="mb-10 p-6 rounded-2xl border border-azul-claro bg-azul-vivo/10 text-center animate-fade-in">
                <div className="text-azul-vivo text-4xl mb-3 font-bold">✓</div>
                <p className="text-azul-profundo text-base tracking-wide font-semibold">
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
                    <label className="text-texto text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={f.namePlaceholder}
                      autoComplete="name"
                      minLength={2}
                      maxLength={120}
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="text-texto text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={verificarEmail}
                      placeholder={f.emailPlaceholder}
                      autoComplete="email"
                      required
                      className={inputClasses}
                    />
                    {sugestaoEmail && (
                      <p className="text-suave text-xs mt-2 leading-relaxed">
                        {f.emailSuggestion.split('{email}')[0]}
                        <button
                          type="button"
                          onClick={aceitarSugestaoEmail}
                          className="text-azul-medio font-semibold underline underline-offset-2 hover:text-azul-profundo transition-colors duration-300"
                        >
                          {sugestaoEmail}
                        </button>
                        {f.emailSuggestion.split('{email}')[1]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Telefone e Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-texto text-xs font-medium tracking-[0.15em] mb-2 block">
                      {f.phone}
                    </label>
                    {/* Telefone de qualquer país: aceita o sinal +, espaços,
                        parênteses, pontos e traços, e não prende o número a
                        um número certo de dígitos. O limite de 40 caracteres
                        é o mesmo que o backend já aceita.

                        Os parênteses e o traço vão escapados de propósito: o
                        browser compila este pattern como uma expressão regular
                        moderna (modo "v"), onde "(", ")" e "-" soltos dentro
                        dos parênteses retos são erro. Um pattern que não
                        compila é ignorado em silêncio, e até 24/09/2026 era o
                        que acontecia: o campo aceitava letras e barras. */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={f.phonePlaceholder}
                      inputMode="tel"
                      autoComplete="tel"
                      pattern="[+0-9 \(\)\.\-]+"
                      title={f.phoneHint}
                      maxLength={40}
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="text-texto text-xs font-medium tracking-[0.15em] mb-2 block">
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
                  <label id="etiqueta-origem" className="text-texto text-xs font-medium tracking-[0.15em] mb-2 block">
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
                      className={`${inputClasses} mt-3 ${erroTexto ? 'ring-1 ring-red-500' : ''}`}
                    />
                  )}
                  {erroOrigem && (
                    <p id="erro-origem" role="alert" className="text-red-600 text-xs mt-2 leading-relaxed">
                      {erroOrigem}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="message" className="text-texto text-xs font-medium tracking-[0.15em] mb-2 block">
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
                        ? 'border-linha text-suave bg-neve cursor-not-allowed'
                        : 'bg-azul-medio text-white shadow-azul hover:bg-azul-profundo active:scale-[0.98]'
                    }
                  `}
                >
                  {isSending ? f.sending : f.submit}
                </button>

                {submitError && (
                  <p className="text-red-600 text-sm text-center">{submitError}</p>
                )}
              </form>
            )}

            {/* Botão de voltar a enviar após sucesso */}
            {isSent && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setIsSent(false)}
                  className="text-azul-medio text-sm tracking-[0.15em] hover:underline transition-colors duration-300"
                >
                  {lang === 'pt' ? 'Enviar outra mensagem' : 'Send another message'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pb-8">
          <p className="text-center text-texto text-xs tracking-[0.15em]">
            © {new Date().getFullYear()} Nexugal
          </p>
        </footer>
      </main>
    </div>
  );
}

export default ContactPage;
