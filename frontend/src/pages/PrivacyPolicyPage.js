import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const goHome = () => navigate(lang === 'pt' ? '/' : '/us');

  const pt = lang === 'pt';

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Glow de fundo */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-neon/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16">
          <button
            onClick={goHome}
            className="text-gray-300 text-xs sm:text-sm tracking-[0.15em] hover:text-cyan-neon transition-colors duration-300 flex items-center gap-2"
          >
            <span>←</span> {pt ? 'Voltar ao início' : 'Back to home'}
          </button>
          <span className="font-orbitron text-cyan-neon text-xl font-bold tracking-[0.2em]">NEXUGAL</span>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 lg:px-16 py-16">
        {/* Título */}
        <div className="mb-12">
          <span className="font-display text-cyan-neon text-xs font-semibold tracking-[0.3em] uppercase block mb-4">
            {pt ? 'Documentos Legais' : 'Legal Documents'}
          </span>
          <h1 className="font-display text-white text-3xl md:text-4xl font-bold tracking-[0.05em] mb-4">
            {pt ? 'Política de Privacidade' : 'Privacy Policy'}
            <span className="text-cyan-neon"> & Cookies</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed text-justify">
            {pt
              ? 'Última atualização: agosto de 2025 · Em conformidade com o RGPD (Regulamento Geral sobre a Proteção de Dados) e a Lei n.º 41/2004 (Lei do ePrivacy).'
              : 'Last updated: August 2025 · In compliance with the GDPR (General Data Protection Regulation) and Directive 2002/58/EC (ePrivacy Directive).'}
          </p>
        </div>

        {/* Secções */}
        <div className="space-y-10 text-gray-200 text-sm leading-relaxed text-justify">

          {/* 1 — Responsável */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">01</span>
              {pt ? 'Responsável pelo Tratamento' : 'Data Controller'}
            </h2>
            <div className="pl-8 border-l border-white/10 space-y-2">
              <p><strong className="text-white">NEXUGAL</strong></p>
              <p>Braga, Portugal</p>
              <p>
                {pt ? 'Contacto: ' : 'Contact: '}
                <a href="mailto:nexugal.geral@gmail.com" className="text-cyan-neon hover:underline">nexugal.geral@gmail.com</a>
              </p>
            </div>
          </section>

          {/* 2 — Dados recolhidos */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">02</span>
              {pt ? 'Dados Pessoais Recolhidos' : 'Personal Data Collected'}
            </h2>
            <div className="pl-8 border-l border-white/10 space-y-3">
              <p>{pt ? 'Recolhemos os seguintes dados através do formulário de contacto:' : 'We collect the following data through the contact form:'}</p>
              <ul className="list-none space-y-1.5">
                {[
                  pt ? '• Nome completo' : '• Full name',
                  pt ? '• Endereço de e-mail' : '• Email address',
                  pt ? '• Número de telefone (opcional)' : '• Phone number (optional)',
                  pt ? '• Nome da empresa (opcional)' : '• Company name (optional)',
                  pt ? '• Serviço de interesse' : '• Service of interest',
                  pt ? '• Mensagem / descrição do projeto' : '• Message / project description',
                ].map((item) => (
                  <li key={item} className="text-gray-300">{item}</li>
                ))}
              </ul>
              <p className="text-gray-400 text-xs">
                {pt
                  ? 'Não recolhemos dados de categorias especiais (dados sensíveis) na aceção do Artigo 9.º do RGPD.'
                  : 'We do not collect special category data (sensitive data) as defined in Article 9 of the GDPR.'}
              </p>
            </div>
          </section>

          {/* 3 — Finalidade e Base Legal */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">03</span>
              {pt ? 'Finalidade e Base Legal' : 'Purpose and Legal Basis'}
            </h2>
            <div className="pl-8 border-l border-white/10 space-y-4">
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <p className="text-white font-medium mb-1">{pt ? 'Gestão de Contactos e Propostas' : 'Contact and Proposal Management'}</p>
                <p className="text-gray-300 text-xs">
                  {pt
                    ? 'Tratamos os seus dados para responder ao seu pedido de contacto e elaborar propostas comerciais. Base legal: Interesse legítimo (Art. 6.º, n.º 1, al. f) do RGPD) / Execução de pré-contrato (Art. 6.º, n.º 1, al. b)).'
                    : 'We process your data to respond to your contact request and prepare commercial proposals. Legal basis: Legitimate interest (Art. 6(1)(f) GDPR) / Pre-contractual measures (Art. 6(1)(b) GDPR).'}
                </p>
              </div>
            </div>
          </section>

          {/* 4 — Prazo de Conservação */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">04</span>
              {pt ? 'Prazo de Conservação' : 'Retention Period'}
            </h2>
            <div className="pl-8 border-l border-white/10">
              <p>
                {pt
                  ? 'Os seus dados são conservados pelo período necessário para a gestão da relação comercial, nunca superior a 3 anos após o último contacto, salvo obrigação legal de conservação mais prolongada.'
                  : 'Your data is retained for the period necessary for commercial relationship management, never exceeding 3 years after the last contact, unless a longer legal retention obligation applies.'}
              </p>
            </div>
          </section>

          {/* 5 — Direitos */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">05</span>
              {pt ? 'Os Seus Direitos (RGPD)' : 'Your Rights (GDPR)'}
            </h2>
            <div className="pl-8 border-l border-white/10 space-y-2">
              <p className="text-gray-300 mb-3">
                {pt
                  ? 'Nos termos do RGPD, tem direito a:'
                  : 'Under the GDPR, you have the right to:'}
              </p>
              {(pt
                ? [
                    '• Acesso — obter confirmação e cópia dos seus dados',
                    '• Retificação — corrigir dados inexatos ou incompletos',
                    '• Apagamento — solicitar a eliminação dos seus dados ("direito ao esquecimento")',
                    '• Limitação — restringir o tratamento em determinadas circunstâncias',
                    '• Portabilidade — receber os dados em formato estruturado e legível',
                    '• Oposição — opor-se ao tratamento baseado em interesse legítimo',
                    '• Reclamação — apresentar queixa à CNPD (www.cnpd.pt)',
                  ]
                : [
                    '• Access — obtain confirmation and a copy of your data',
                    '• Rectification — correct inaccurate or incomplete data',
                    '• Erasure — request deletion of your data ("right to be forgotten")',
                    '• Restriction — restrict processing in certain circumstances',
                    '• Portability — receive data in a structured, machine-readable format',
                    '• Objection — object to processing based on legitimate interest',
                    '• Complaint — lodge a complaint with the supervisory authority',
                  ]
              ).map((item) => (
                <p key={item} className="text-gray-300">{item}</p>
              ))}
              <p className="text-gray-400 text-xs mt-3">
                {pt
                  ? 'Para exercer os seus direitos, contacte-nos em nexugal.geral@gmail.com. Respondemos no prazo máximo de 30 dias.'
                  : 'To exercise your rights, contact us at nexugal.geral@gmail.com. We respond within a maximum of 30 days.'}
              </p>
            </div>
          </section>

          {/* 6 — Cookies */}
          <section id="cookies">
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">06</span>
              {pt ? 'Política de Cookies' : 'Cookie Policy'}
            </h2>
            <div className="pl-8 border-l border-white/10 space-y-4">
              <p>
                {pt
                  ? 'Este site utiliza cookies e tecnologias semelhantes. Nos termos da Lei n.º 41/2004 (transposta da Diretiva ePrivacy), é necessário o seu consentimento para cookies não essenciais.'
                  : 'This website uses cookies and similar technologies. Under the ePrivacy Directive, your consent is required for non-essential cookies.'}
              </p>

              {/* Tabela de cookies */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      <th className="px-4 py-3 text-white/70 font-medium">{pt ? 'Cookie' : 'Cookie'}</th>
                      <th className="px-4 py-3 text-white/70 font-medium">{pt ? 'Tipo' : 'Type'}</th>
                      <th className="px-4 py-3 text-white/70 font-medium">{pt ? 'Finalidade' : 'Purpose'}</th>
                      <th className="px-4 py-3 text-white/70 font-medium">{pt ? 'Duração' : 'Duration'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="px-4 py-3 text-cyan-neon font-mono">nexugal_auth</td>
                      <td className="px-4 py-3 text-gray-300">{pt ? 'Essencial' : 'Essential'}</td>
                      <td className="px-4 py-3 text-gray-300">{pt ? 'Autenticação segura da área de administração (HttpOnly, não acessível a scripts)' : 'Secure authentication for the admin area (HttpOnly, not accessible to scripts)'}</td>
                      <td className="px-4 py-3 text-gray-400">2h</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-cyan-neon font-mono">nexugal_cookie_consent</td>
                      <td className="px-4 py-3 text-gray-300">{pt ? 'Essencial' : 'Essential'}</td>
                      <td className="px-4 py-3 text-gray-300">{pt ? 'Guarda as suas preferências de cookies (localStorage)' : 'Stores your cookie preferences (localStorage)'}</td>
                      <td className="px-4 py-3 text-gray-400">{pt ? 'Persistente' : 'Persistent'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-gray-400 text-xs">
                {pt
                  ? 'Pode revogar o seu consentimento a qualquer momento, limpando os dados do site nas definições do seu browser, ou contactando-nos.'
                  : 'You can withdraw your consent at any time by clearing site data in your browser settings, or by contacting us.'}
              </p>
            </div>
          </section>

          {/* 7 — Segurança */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">07</span>
              {pt ? 'Segurança dos Dados' : 'Data Security'}
            </h2>
            <div className="pl-8 border-l border-white/10">
              <p>
                {pt
                  ? 'Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Os dados são transmitidos através de ligações HTTPS cifradas e as passwords são armazenadas com hashing PBKDF2-SHA256 e salt único.'
                  : 'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Data is transmitted over encrypted HTTPS connections and passwords are stored using PBKDF2-SHA256 hashing with a unique salt.'}
              </p>
            </div>
          </section>

          {/* 8 — Alterações */}
          <section>
            <h2 className="font-display text-white text-base font-semibold tracking-[0.08em] mb-3 flex items-center gap-3">
              <span className="text-cyan-neon text-xs font-bold">08</span>
              {pt ? 'Alterações a esta Política' : 'Changes to this Policy'}
            </h2>
            <div className="pl-8 border-l border-white/10">
              <p>
                {pt
                  ? 'Podemos atualizar esta Política periodicamente. A data da última atualização está sempre indicada no topo do documento. Para alterações substanciais, notificaremos os utilizadores através do site.'
                  : 'We may update this Policy periodically. The date of the last update is always shown at the top of the document. For substantial changes, we will notify users through the website.'}
              </p>
            </div>
          </section>

        </div>

        {/* Rodapé da página */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-xs tracking-[0.1em]">
            © {new Date().getFullYear()} NEXUGAL · nexugal.geral@gmail.com
          </p>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicyPage;
