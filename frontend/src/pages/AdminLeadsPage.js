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

  // Upload CSV / Excel
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPriority, setUploadPriority] = useState('media');
  const [uploadClientType, setUploadClientType] = useState('PMEs');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  // Envio por Categoria
  const [categoryTemplates, setCategoryTemplates] = useState({});
  const [categoryOutreachCat, setCategoryOutreachCat] = useState('');
  const [categoryOutreachSubject, setCategoryOutreachSubject] = useState('');
  const [categoryOutreachMessage, setCategoryOutreachMessage] = useState('');
  const [categoryOutreachPriority, setCategoryOutreachPriority] = useState('');
  const [categoryOutreachStatus, setCategoryOutreachStatus] = useState('novo');
  const [isCategoryOutreaching, setIsCategoryOutreaching] = useState(false);
  const [categoryOutreachMsg, setCategoryOutreachMsg] = useState('');
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false);

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
    loadCategoryTemplates();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'scraper') {
      loadProspects();
    }
  }, [filterRegion, filterCategory, filterStatus, filterPriority, activeTab]);

  // Carregar templates de categoria do backend
  const loadCategoryTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/scraper/category-templates`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCategoryTemplates(data.templates || {});
      }
    } catch {}
  };

  // Quando muda a categoria, preenche automaticamente o template
  const handleCategoryChange = (cat) => {
    setCategoryOutreachCat(cat);
    setCategoryOutreachMsg('');
    if (cat && categoryTemplates[cat]) {
      setCategoryOutreachSubject(categoryTemplates[cat].subject);
      setCategoryOutreachMessage(categoryTemplates[cat].message);
    } else {
      setCategoryOutreachSubject('');
      setCategoryOutreachMessage('');
    }
  };

  // Enviar e-mails por categoria
  const handleCategoryOutreach = async () => {
    if (!categoryOutreachCat || !categoryOutreachSubject || !categoryOutreachMessage) return;
    setIsCategoryOutreaching(true);
    setCategoryOutreachMsg('');
    setShowCategoryConfirm(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/scraper/send-outreach-by-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: categoryOutreachCat,
          subject: categoryOutreachSubject,
          message: categoryOutreachMessage,
          priority_filter: categoryOutreachPriority || null,
          status_filter: categoryOutreachStatus,
        }),
      });
      if (res.status === 401) { navigate('/admin/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao enviar.');
      const parts = [`✓ ${data.sent_count} e-mail(s) enviado(s)!`];
      if (data.skipped_count > 0) parts.push(`${data.skipped_count} ignorado(s).`);
      if (data.failed_count > 0) parts.push(`${data.failed_count} falhado(s).`);
      setCategoryOutreachMsg(parts.join(' '));
      loadProspects();
    } catch (err) {
      setCategoryOutreachMsg(`❌ Erro: ${err.message}`);
    } finally {
      setIsCategoryOutreaching(false);
    }
  };

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

  // Upload de ficheiro CSV / Excel
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadMsg('');
    setUploadErrors([]);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('priority', uploadPriority);
    formData.append('client_type', uploadClientType);

    try {
      const response = await fetch(`${API_BASE_URL}/api/scraper/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erro ao importar ficheiro.');

      const parts = [`✓ Importação concluída! ${data.imported} novo(s) prospect(s) adicionado(s).`];
      if (data.duplicate > 0) parts.push(`${data.duplicate} ignorado(s) por duplicado.`);
      setUploadMsg(parts.join(' '));
      if (data.parse_errors && data.parse_errors.length > 0) {
        setUploadErrors(data.parse_errors);
      }
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadProspects();
    } catch (err) {
      setUploadMsg(`❌ Erro: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(ext)) {
        setUploadFile(file);
        setUploadMsg('');
        setUploadErrors([]);
      } else {
        setUploadMsg('❌ Apenas ficheiros .csv ou .xlsx são suportados.');
      }
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
            {/* Painel de Upload CSV / Excel */}
            <div className="bg-[#0e1117] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-neon/[0.02] blur-3xl pointer-events-none rounded-full" />

              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📂</span> Importar Prospects via CSV / Excel
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Faça upload de um ficheiro <span className="text-cyan-neon font-semibold">.csv</span> ou <span className="text-cyan-neon font-semibold">.xlsx</span> com a lista de empresas. O sistema detecta automaticamente as colunas (nome, email, telefone, empresa, website, região, categoria). Máximo: <span className="text-white font-medium">500 linhas · 5 MB</span>.
                </p>
              </div>

              <form onSubmit={handleFileUpload}>
                {/* Zona de Drag-and-Drop */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-5 ${
                    isDragging
                      ? 'border-cyan-neon bg-cyan-neon/10 scale-[1.01]'
                      : uploadFile
                      ? 'border-green-500/50 bg-green-500/[0.04]'
                      : 'border-white/15 hover:border-cyan-neon/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setUploadFile(f); setUploadMsg(''); setUploadErrors([]); }
                    }}
                  />

                  {uploadFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl">
                        {uploadFile.name.endsWith('.xlsx') || uploadFile.name.endsWith('.xls') ? '📊' : '📄'}
                      </div>
                      <p className="text-white font-semibold text-sm">{uploadFile.name}</p>
                      <p className="text-gray-400 text-xs">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setUploadFile(null); setUploadMsg(''); setUploadErrors([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="text-red-400/70 hover:text-red-400 text-xs underline mt-1"
                      >
                        Remover ficheiro
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-xl bg-cyan-neon/10 border border-cyan-neon/20 flex items-center justify-center text-2xl">
                        {isDragging ? '⬇️' : '☁️'}
                      </div>
                      <p className="text-white font-medium text-sm">
                        {isDragging ? 'Largue o ficheiro aqui' : 'Arraste o ficheiro ou clique para selecionar'}
                      </p>
                      <p className="text-gray-500 text-xs">Suporta .CSV e .XLSX · máx. 500 linhas · 5 MB</p>
                    </div>
                  )}
                </div>

                {/* Opções de Prioridade e Tipo de Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">
                      Prioridade a Atribuir
                    </label>
                    <select
                      value={uploadPriority}
                      onChange={(e) => setUploadPriority(e.target.value)}
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                    >
                      <option value="alta">🔴 Alta Prioridade</option>
                      <option value="media">🟡 Média Prioridade</option>
                      <option value="baixa">⚪ Baixa Prioridade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">
                      Tipo de Cliente
                    </label>
                    <select
                      value={uploadClientType}
                      onChange={(e) => setUploadClientType(e.target.value)}
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                    >
                      <option value="PMEs">PMEs (Pequenas e Médias)</option>
                      <option value="Micro-empresas">Micro-empresas & Locais</option>
                      <option value="Corporativo">Corporativo / Grandes Contas</option>
                    </select>
                  </div>
                </div>

                {/* Legenda de colunas aceites */}
                <div className="bg-black/40 border border-white/[0.07] rounded-xl px-4 py-3 mb-5">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Colunas reconhecidas automaticamente:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'email / e-mail / mail', required: true },
                      { label: 'nome / name' },
                      { label: 'empresa / company' },
                      { label: 'telefone / phone / tel' },
                      { label: 'website / site / url' },
                      { label: 'região / region / cidade' },
                      { label: 'categoria / setor' },
                      { label: 'notas / notes' },
                    ].map((col) => (
                      <span
                        key={col.label}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono ${
                          col.required
                            ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30'
                            : 'bg-white/[0.05] text-gray-400 border border-white/10'
                        }`}
                      >
                        {col.required ? '* ' : ''}{col.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-[10px] mt-2">* Campo obrigatório</p>
                </div>

                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="w-full sm:w-auto bg-cyan-neon text-black font-semibold text-xs tracking-widest uppercase px-8 py-3.5 rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      A Importar Prospects...
                    </>
                  ) : (
                    <><span>📤</span> Importar Ficheiro</>
                  )}
                </button>

                {/* Resultado do Upload */}
                {uploadMsg && (
                  <div className={`mt-4 p-4 rounded-xl text-xs font-medium ${uploadMsg.startsWith('✓') ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {uploadMsg}
                  </div>
                )}
                {uploadErrors.length > 0 && (
                  <div className="mt-3 p-4 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20">
                    <p className="text-yellow-400 text-xs font-semibold mb-2">⚠️ Avisos de importação ({uploadErrors.length}):</p>
                    <ul className="list-disc list-inside space-y-1">
                      {uploadErrors.map((err, i) => (
                        <li key={i} className="text-yellow-400/80 text-[11px] font-mono">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>

            {/* Painel de Envio Automático por Categoria */}
            <div className="bg-[#0e1117] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/[0.03] blur-3xl pointer-events-none rounded-full" />

              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📧</span> Envio Automático por Categoria
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Selecione uma categoria e o sistema preenche automaticamente um e-mail personalizado para esse setor. Pode editar antes de enviar. Substitui <span className="font-mono text-cyan-neon text-[11px]">{"{"}{"{"}name{"}"}{"}"}</span> e <span className="font-mono text-cyan-neon text-[11px]">{"{"}{"{"}company{"}"}{"}"}</span> automaticamente com os dados de cada empresa.
                </p>
              </div>

              <div className="space-y-5">
                {/* Linha 1: Categoria + Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">Categoria *</label>
                    <select
                      value={categoryOutreachCat}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                    >
                      <option value="">-- Selecione uma categoria --</option>
                      {Object.keys(categoryTemplates).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">Filtrar por Prioridade</label>
                    <select
                      value={categoryOutreachPriority}
                      onChange={(e) => setCategoryOutreachPriority(e.target.value)}
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                    >
                      <option value="">Todas as prioridades</option>
                      <option value="alta">🔴 Alta Prioridade</option>
                      <option value="media">🟡 Média Prioridade</option>
                      <option value="baixa">⚪ Baixa Prioridade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">Filtrar por Estado</label>
                    <select
                      value={categoryOutreachStatus}
                      onChange={(e) => setCategoryOutreachStatus(e.target.value)}
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-neon focus:outline-none"
                    >
                      <option value="novo">🆕 Apenas Novos</option>
                      <option value="contactado">📩 Já Contactados</option>
                      <option value="convertido">✅ Convertidos</option>
                    </select>
                  </div>
                </div>

                {/* Assunto */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-neon mb-2">Assunto do E-mail</label>
                  <input
                    type="text"
                    value={categoryOutreachSubject}
                    onChange={(e) => setCategoryOutreachSubject(e.target.value)}
                    placeholder="Ex: Digitalização & Automação para a {company} — NEXUGAL"
                    maxLength={200}
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-cyan-neon focus:outline-none"
                  />
                  <p className="text-gray-500 text-[10px] mt-1">Use <span className="font-mono text-cyan-neon/70">{'{name}'}</span> e <span className="font-mono text-cyan-neon/70">{'{company}'}</span> para personalização automática.</p>
                </div>

                {/* Corpo do Email */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-cyan-neon">Corpo do E-mail</label>
                    {categoryOutreachMessage && (
                      <span className="text-gray-500 text-[10px]">{categoryOutreachMessage.length}/5000 caracteres</span>
                    )}
                  </div>
                  <textarea
                    value={categoryOutreachMessage}
                    onChange={(e) => setCategoryOutreachMessage(e.target.value)}
                    rows={12}
                    maxLength={5000}
                    placeholder="O template da categoria aparece aqui automaticamente ao selecionar uma categoria acima..."
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyan-neon focus:outline-none font-mono leading-relaxed resize-y"
                  />
                </div>

                {/* Botão de Envio + Confirmação */}
                {!showCategoryConfirm ? (
                  <button
                    type="button"
                    disabled={!categoryOutreachCat || !categoryOutreachSubject || !categoryOutreachMessage || isCategoryOutreaching}
                    onClick={() => setShowCategoryConfirm(true)}
                    className="bg-purple-500 text-white font-semibold text-xs tracking-widest uppercase px-8 py-3.5 rounded-full hover:bg-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
                  >
                    <span>📤</span> Enviar a Todos de "{categoryOutreachCat || '...'}"
                  </button>
                ) : (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-purple-300 text-sm font-semibold">⚠️ Confirmar envio</p>
                      <p className="text-purple-200/70 text-xs mt-1">
                        Serão enviados e-mails a <strong>todos os prospects</strong> da categoria <strong>"{categoryOutreachCat}"</strong> com estado <strong>"{categoryOutreachStatus}"</strong>{categoryOutreachPriority ? ` e prioridade "${categoryOutreachPriority}"` : ''}. Esta ação não pode ser desfeita.
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setShowCategoryConfirm(false)}
                        className="px-4 py-2 text-xs rounded-full border border-white/20 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCategoryOutreach}
                        disabled={isCategoryOutreaching}
                        className="px-5 py-2 text-xs rounded-full bg-purple-500 text-white font-bold hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isCategoryOutreaching ? (
                          <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> A enviar...</>
                        ) : (
                          <>✓ Confirmar Envio</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Resultado */}
                {categoryOutreachMsg && (
                  <div className={`p-4 rounded-xl text-xs font-medium ${categoryOutreachMsg.startsWith('✓') ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {categoryOutreachMsg}
                  </div>
                )}
              </div>
            </div>

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

