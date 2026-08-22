import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function formatDate(value) {
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
}

function AdminLeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeads = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/leads`, {
          credentials: 'include', // envia o cookie HttpOnly automaticamente
        });

        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Erro ao carregar leads.');
        }

        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Erro inesperado ao carregar leads.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeads();
  }, [navigate]);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignora erro de rede — redireciona de qualquer forma
    }
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 md:px-10 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl tracking-[0.08em]">Leads Recebidos</h1>

          </div>
          <button
            onClick={logout}
            className="border border-white/20 hover:border-cyan-neon rounded-full px-5 py-2 text-xs tracking-[0.12em] transition-colors duration-300"
          >
            Sair
          </button>
        </div>

        {isLoading && <p className="text-white/60">Carregando leads...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!isLoading && !error && (
          <div className="overflow-x-auto border border-white/10 rounded-2xl">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.04]">
                <tr>
                  <th className="px-4 py-3 text-white/70">Data</th>
                  <th className="px-4 py-3 text-white/70">Nome</th>
                  <th className="px-4 py-3 text-white/70">Email</th>
                  <th className="px-4 py-3 text-white/70">Telefone</th>
                  <th className="px-4 py-3 text-white/70">Empresa</th>
                  <th className="px-4 py-3 text-white/70">Serviço</th>
                  <th className="px-4 py-3 text-white/70">Idioma</th>
                  <th className="px-4 py-3 text-white/70">Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-white/50" colSpan={8}>
                      Nenhum lead registrado ainda.
                    </td>
                  </tr>
                )}
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/5 align-top">
                    <td className="px-4 py-4 text-white/50 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-4">{lead.name}</td>
                    <td className="px-4 py-4">
                      <a className="text-cyan-neon hover:underline" href={`mailto:${lead.email}`}>
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-4">{lead.phone || '-'}</td>
                    <td className="px-4 py-4">{lead.company || '-'}</td>
                    <td className="px-4 py-4">{lead.service || '-'}</td>
                    <td className="px-4 py-4 uppercase">{lead.language || '-'}</td>
                    <td className="px-4 py-4 text-white/80 max-w-[320px] whitespace-pre-wrap">{lead.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLeadsPage;
