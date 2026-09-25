import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

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
        credentials: 'include', // envia e recebe cookies HttpOnly
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Falha no login.');
      }

      navigate('/admin/leads');
    } catch (err) {
      setError(err.message || 'Erro inesperado ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-texto flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-linha rounded-2xl bg-neve p-8">
        <h1 className="font-display text-2xl tracking-[0.08em] mb-2">Admin Leads</h1>
        <p className="text-texto text-sm mb-8">Acesso restrito com autenticação segura por cookie.</p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-[0.12em] text-texto mb-2">Usuário</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full bg-neve border border-linha rounded-xl px-4 py-3 text-azul-profundo focus:outline-none focus:border-azul-claro"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.12em] text-texto mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full bg-neve border border-linha rounded-xl px-4 py-3 text-azul-profundo focus:outline-none focus:border-azul-claro"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full border border-azul-medio rounded-full py-3 text-sm tracking-[0.12em] bg-azul-vivo/10 hover:bg-azul-vivo/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
