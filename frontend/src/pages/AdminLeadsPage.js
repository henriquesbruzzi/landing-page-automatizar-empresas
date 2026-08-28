import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function formatDate(value) {
  try {
    return new Date(value).toLocaleString('pt-PT');
  } catch {
    return value;
  }
}

const REGIOES = [
  'Braga',
  'Porto',
  'Lisboa',
  'Viana do Castelo',
  'Aveiro',
  'Leiria',
  'Coimbra',
  'Faro',
  'Setúbal',
  'Viseu',
  'Vila Real',
];

const CATEGORIAS = [
  'Oficinas & Automóvel',
  'Restauração & Hotelaria',
  'Imobiliárias & Construção',
  'Clínicas & Saúde',
  'Lojas & Comércio Local',
  'Serviços Profissionais',
  'Tecnologia & Consultoria',
];

function AdminLeadsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'scraper'

  // Estado dos Leads
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leadsError, setLeadsError] = useState('');

  // Estado do Scraper & Prospects
  const [prospects, setProspects] = useState([]);
  const [isLoadingProspects, setIsLoadingProspects] = useState(false);
  const [prospectsError, setProspectsError] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingMsg, setScrapingMsg] = useState('');

  // Formulário do Scraper
  const [searchRegion, setSearchRegion] = useState('Braga');
  const [searchCategory, setSearchCategory] = useState('Oficinas & Automóvel');
  const [searchClientType, setSearchClientType] = useState('PMEs');
  const [searchPriority, setSearchPriority] = useState('alta');

  // Filtros da Tabela de Prospects
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Seleção para Envio de E-mails
  const [selectedProspectIds, setSelectedProspectIds] = useState([]);
  const [isSendingOutreach, setIsSendingOutreach] = useState(false);
  const [outreachSubject, setOutreachSubject] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');
  const [outreachStatusMsg, setOutreachStatusMsg] = useState('');
  const [showOutreachModal, setShowOutreachModal] = useState(false);

  // Carregar Leads do Website
  const loadLeads = async () => {
    setIsLoadingLeads(true);
    setLeadsError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        credentials: 'include',
      });
      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erro ao carregar leads.');
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setLeadsError(err.message || 'Erro ao carregar leads.');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Carregar Prospects do Scraper
  const loadProspects = async () => {
    setIsLoadingProspects(true);
    setProspectsError('');
    try {
      const queryParams = new URLSearchParams();
      if (filterRegion) queryParams.append('region', filterRegion);
      if (filterCategory) queryParams.append('category', filterCategory);
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterPriority) queryParams.append('priority', filterPriority);

      const response = await fetch(`${API_BASE_URL}/api/scraper/prospects?${queryParams.toString()}`, {
        credentials: 'include',
      });
      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erro ao carregar prospects.');
      setProspects(Array.isArray(data) ? data : []);
    } catch (err) {
      setProspectsError(err.message || 'Erro ao carregar prospects.');
    } finally {
      setIsLoadingProspects(false);
    }
  };

  useEffect(() => {
    loadLeads();
    loadProspects();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'scraper') {
      loadProspects();
    }
  }, [filterRegion, filterCategory, filterStatus, filterPriority, activeTab]);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    navigate('/admin/login');
  };

  // Executar o Scraper
  const handleRunScraper = async (e) => {
    e.preventDefault();
    setIsScraping(true);
    setScrapingMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/scraper/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          region: searchRegion,
          category: searchCategory,
          client_type: searchClientType,
          priority: searchPriority,
        }),
      });

      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erro ao executar o scraper.');

      setScrapingMsg(`✓ Pesquisa concluída! Encontrados ${data.found} prospects (${data.new_inserted} novos guardados).`);
      loadProspects();
    } catch (err) {
      setScrapingMsg(`❌ Erro: ${err.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  // Atualizar Estado / Prioridade do Prospect
  const handleUpdateProspect = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scraper/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        setProspects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
      }
    } catch (err) {
      console.error('Erro ao atualizar prospect:', err);
    }
  };

  // Enviar E-mail de Prospecção (Outreach)
  const handleSendOutreach = async () => {
    if (selectedProspectIds.length === 0) return;
    setIsSendingOutreach(true);
    setOutreachStatusMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/scraper/send-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prospect_ids: selectedProspectIds,
          subject: outreachSubject || undefined,
          message: outreachMessage || undefined,
        }),
      });

      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erro ao enviar e-mails de prospecção.');

      setOutreachStatusMsg(`✓ E-mails enviados com sucesso para ${data.sent_count} prospects!`);
      setSelectedProspectIds([]);
      setShowOutreachModal(false);
      loadProspects();
    } catch (err) {
      setOutreachStatusMsg(`❌ Erro: ${err.message}`);
    } finally {
      setIsSendingOutreach(false);
    }
  };

  const toggleSelectProspect = (id) => {
    setSelectedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProspectIds.length === prospects.length) {
      setSelectedProspectIds([]);
    } else {
      setSelectedProspectIds(prospects.map((p) => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-10 lg:px-16 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-cyan-neon font-bold text-xl tracking-[0.2em]">NEXUGAL</span>
              <span className="bg-cyan-neon/10 border border-cyan-neon/30 text-cyan-neon text-xs px-2.5 py-0.5 rounded-full font-mono uppercase">
                Painel Admin
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Gestão de Leads Inbound e Automação de Prospecção B2B
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="border border-white/20 hover:border-red-500/50 hover:text-red-400 rounded-full px-5 py-2 text-xs tracking-[0.12em] transition-all duration-300"
            >
              Sair da Sessão
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-cyan-neon text-cyan-neon bg-cyan-neon/[0.04]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>📥</span> Leads do Website ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('scraper')}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 ${
              activeTab === 'scraper'
                ? 'border-cyan-neon text-cyan-neon bg-cyan-neon/[0.04]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>🔍</span> Web Scraper & Prospecção B2B ({prospects.length})
          </button>
        </div>

        {/* TAB 1: LEADS DO WEBSITE */}
        {activeTab === 'leads' && (
          <div>
            {isLoadingLeads && <p className="text-gray-400 text-sm">A carregar leads do formulário...</p>}
            {leadsError && <p className="text-red-400 text-sm mb-4">{leadsError}</p>}

            {!isLoadingLeads && !leadsError && (
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#0a0a0a]">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-gray-400 uppercase text-[11px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3.5">Data</th>
                      <th className="px-4 py-3.5">Nome</th>
                      <th className="px-4 py-3.5">E-mail</th>
                      <th className="px-4 py-3.5">Telefone</th>
                      <th className="px-4 py-3.5">Empresa</th>
                      <th className="px-4 py-3.5">Serviço</th>
                      <th className="px-4 py-3.5">Idioma</th>
                      <th className="px-4 py-3.5">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                          Nenhum lead recebido pelo website até ao momento.
                        </td>
                      </tr>
                    )}
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors align-top">
                        <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(lead.created_at)}</td>
                        <td className="px-4 py-4 font-medium text-white">{lead.name}</td>
                        <td className="px-4 py-4">
                          <a className="text-cyan-neon hover:underline" href={`mailto:${lead.email}`}>
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-4 py-4 text-gray-300">{lead.phone || '-'}</td>
                        <td className="px-4 py-4 text-gray-300">{lead.company || '-'}</td>
                        <td className="px-4 py-4 text-cyan-neon/90 text-xs font-mono">{lead.service || '-'}</td>
                        <td className="px-4 py-4 uppercase text-xs text-gray-400">{lead.language || '-'}</td>
                        <td className="px-4 py-4 text-gray-300 text-xs max-w-[320px] whitespace-pre-wrap">{lead.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WEB SCRAPER & PROSPECÇÃO B2B */}
        {activeTab === 'scraper' && (
          <div className="space-y-8">
            {/* Painel de Controlo do Scraper */}
            <div className="bg-[#0e1117] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-neon/[0.03] blur-3xl pointer-events-none rounded-full" />
              
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚡</span> Gerador de Leads & Web Scraper B2B
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Selecione os parâmetros do seu mercado-alvo em Portugal para recolher e prospectar empresas automaticamente.
                </p>
              </div>

              <form onSubmit={handleRunScraper} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Região */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">
                    Região / Cidade
                  </label>
                  <select
                    value={searchRegion}
                    onChange={(e) => setSearchRegion(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                  >
                    {REGIOES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">
                    Categoria de Negócio
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Cliente */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">
                    Tipo de Cliente
                  </label>
                  <select
                    value={searchClientType}
                    onChange={(e) => setSearchClientType(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                  >
                    <option value="PMEs">PMEs (Pequenas e Médias)</option>
                    <option value="Micro-empresas">Micro-empresas & Locais</option>
                    <option value="Corporativo">Corporativo / Grandes Contas</option>
                  </select>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">
                    Prioridade
                  </label>
                  <select
                    value={searchPriority}
                    onChange={(e) => setSearchPriority(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                  >
                    <option value="alta">🔴 Alta Prioridade</option>
                    <option value="media">🟡 Média Prioridade</option>
                    <option value="baixa">⚪ Baixa Prioridade</option>
                  </select>
                </div>

                {/* Botão Submeter */}
                <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isScraping}
                    className="w-full sm:w-auto bg-cyan-neon text-black font-semibold text-xs tracking-widest uppercase px-8 py-3.5 rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isScraping ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        A Pesquisar & Raspando Leads...
                      </>
                    ) : (
                      <>
                        <span>🔍</span> Executar Web Scraper
                      </>
                    )}
                  </button>
                </div>
              </form>

              {scrapingMsg && (
                <div className={`p-4 rounded-xl text-xs font-medium ${scrapingMsg.startsWith('✓') ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  {scrapingMsg}
                </div>
              )}
            </div>

            {/* Barra de Filtros & Ações da Tabela */}
            <div className="bg-[#0e1117] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Filtros:</span>
                
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="bg-black text-xs text-white border border-white/15 rounded-lg px-3 py-1.5 focus:border-cyan-neon focus:outline-none"
                >
                  <option value="">Todas as Regiões</option>
                  {REGIOES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-black text-xs text-white border border-white/15 rounded-lg px-3 py-1.5 focus:border-cyan-neon focus:outline-none"
                >
                  <option value="">Todas as Categorias</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black text-xs text-white border border-white/15 rounded-lg px-3 py-1.5 focus:border-cyan-neon focus:outline-none"
                >
                  <option value="">Todos os Estados</option>
                  <option value="novo">Novo</option>
                  <option value="contactado">Contactado</option>
                  <option value="convertido">Convertido</option>
                  <option value="ignorado">Ignorado</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-black text-xs text-white border border-white/15 rounded-lg px-3 py-1.5 focus:border-cyan-neon focus:outline-none"
                >
                  <option value="">Todas as Prioridades</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>

              {/* Botão de Envio de Outreach */}
              <button
                onClick={() => setShowOutreachModal(true)}
                disabled={selectedProspectIds.length === 0}
                className="w-full md:w-auto bg-cyan-neon/15 border border-cyan-neon text-cyan-neon text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-full hover:bg-cyan-neon hover:text-black transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <span>✉️</span> Enviar E-mail de Prospecção ({selectedProspectIds.length})
              </button>
            </div>

            {/* Tabela de Prospects */}
            {isLoadingProspects && <p className="text-gray-400 text-sm">A carregar lista de prospects...</p>}
            {prospectsError && <p className="text-red-400 text-sm">{prospectsError}</p>}

            {!isLoadingProspects && !prospectsError && (
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#0a0a0a]">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-gray-400 uppercase text-[11px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={prospects.length > 0 && selectedProspectIds.length === prospects.length}
                          onChange={toggleSelectAll}
                          className="rounded border-white/20 text-cyan-neon focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3.5">Empresa / Nome</th>
                      <th className="px-4 py-3.5">E-mail</th>
                      <th className="px-4 py-3.5">Telefone</th>
                      <th className="px-4 py-3.5">Região</th>
                      <th className="px-4 py-3.5">Categoria</th>
                      <th className="px-4 py-3.5">Prioridade</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="px-4 py-3.5">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {prospects.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-gray-500" colSpan={9}>
                          Nenhum prospect captado com os filtros atuais.
                        </td>
                      </tr>
                    )}
                    {prospects.map((p) => {
                      const isSelected = selectedProspectIds.includes(p.id);
                      return (
                        <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-cyan-neon/[0.03]' : ''}`}>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProspect(p.id)}
                              className="rounded border-white/20 text-cyan-neon focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">{p.company || p.name}</div>
                            {p.website && (
                              <a href={p.website} target="_blank" rel="noreferrer" className="text-gray-400 text-xs hover:text-cyan-neon">
                                {p.website.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <a href={`mailto:${p.email}`} className="text-cyan-neon hover:underline text-xs">
                              {p.email}
                            </a>
                          </td>
                          <td className="px-4 py-4 text-gray-300 text-xs">{p.phone || '-'}</td>
                          <td className="px-4 py-4 text-gray-300 text-xs">{p.region}</td>
                          <td className="px-4 py-4 text-gray-300 text-xs">{p.category}</td>
                          <td className="px-4 py-4 text-xs">
                            <span className={`px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                              p.priority === 'alta'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : p.priority === 'media'
                                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                                : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                            }`}>
                              {p.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <select
                              value={p.status}
                              onChange={(e) => handleUpdateProspect(p.id, { status: e.target.value })}
                              className={`bg-black border rounded-lg px-2.5 py-1 text-xs focus:outline-none ${
                                p.status === 'contactado'
                                  ? 'border-green-500/40 text-green-400'
                                  : p.status === 'convertido'
                                  ? 'border-cyan-neon/40 text-cyan-neon'
                                  : p.status === 'ignorado'
                                  ? 'border-gray-500/40 text-gray-400'
                                  : 'border-blue-500/40 text-blue-400'
                              }`}
                            >
                              <option value="novo">Novo</option>
                              <option value="contactado">Contactado</option>
                              <option value="convertido">Convertido</option>
                              <option value="ignorado">Ignorado</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <button
                              onClick={() => {
                                setSelectedProspectIds([p.id]);
                                setShowOutreachModal(true);
                              }}
                              className="text-cyan-neon hover:underline font-medium"
                            >
                              Enviar E-mail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal de Envio de E-mail de Prospecção */}
            {showOutreachModal && (
              <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#12161f] border border-white/15 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span>✉️</span> Prospecção por E-mail (Resend)
                  </h3>
                  <p className="text-gray-400 text-xs mb-6">
                    A enviar para <strong className="text-cyan-neon">{selectedProspectIds.length}</strong> prospect(s) selecionado(s).
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                        Assunto do E-mail (Opcional - Deixe em branco para assunto padrão)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Automação tecnológica & desenvolvimento web para o seu negócio"
                        value={outreachSubject}
                        onChange={(e) => setOutreachSubject(e.target.value)}
                        className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                        Mensagem Personalizada (Opcional - Deixe em branco para proposta padrão)
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Escreva uma mensagem de apresentação personalizada ou deixe em branco para usar o modelo oficial da NEXUGAL."
                        value={outreachMessage}
                        onChange={(e) => setOutreachMessage(e.target.value)}
                        className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none font-mono text-xs leading-relaxed"
                      />
                    </div>
                  </div>

                  {outreachStatusMsg && (
                    <div className="mb-4 text-xs font-medium text-cyan-neon bg-cyan-neon/10 p-3 rounded-xl border border-cyan-neon/30">
                      {outreachStatusMsg}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowOutreachModal(false)}
                      className="px-5 py-2.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSendOutreach}
                      disabled={isSendingOutreach}
                      className="bg-cyan-neon text-black font-semibold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSendingOutreach ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          A Enviar...
                        </>
                      ) : (
                        '🚀 Disparar E-mails'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLeadsPage;

