import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const ADMIN_TOKEN_KEY = 'acrobatic_admin_token';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        throw new Error(data.detail || 'Falha no login.');
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token);
      navigate('/admin/leads');
    } catch (err) {
      setError(err.message || 'Erro inesperado ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-white/10 rounded-2xl bg-white/[0.03] p-8">
        <h1 className="font-orbitron text-2xl tracking-[0.08em] mb-2">Admin Leads</h1>
        <p className="text-white/50 text-sm mb-8">Acesso restrito com autenticação JWT.</p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-[0.12em] text-white/60 mb-2">Usuário</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-neon/60"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.12em] text-white/60 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-neon/60"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full border border-cyan-neon rounded-full py-3 text-sm tracking-[0.12em] bg-cyan-neon/10 hover:bg-cyan-neon/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
