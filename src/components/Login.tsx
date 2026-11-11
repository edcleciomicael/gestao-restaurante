import React, { useState } from 'react';
import { Usuario } from '../types';

interface LoginProps {
  usuarios: Usuario[];
  onLogin: (user: Usuario) => void;
}

export const Login: React.FC<LoginProps> = ({ usuarios, onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const user = usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.ativo
    );

    if (user && (user.senha === senha || (!user.senha && senha === 'admin123'))) {
      onLogin(user);
    } else {
      setErro('E-mail ou senha inválidos.');
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setSenha(userPass);
    setErro('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '44px 36px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #e8a87c, #c97b4b)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 14px',
                boxShadow: '0 8px 24px rgba(232, 168, 124, 0.3)',
              }}
            >
              🍽️
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Restaurante Manager
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.82rem', marginTop: '4px' }}>
              Sistema de Gestão Completo
            </p>
          </div>

          {erro && (
            <div
              style={{
                background: 'rgba(220, 53, 69, 0.15)',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                color: '#ff6b7a',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              ⚠️ {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px', borderRadius: '10px' }}
            >
              🔐 Entrar no Sistema
            </button>
          </form>

          <div
            style={{
              marginTop: '22px',
              padding: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.78rem', textAlign: 'center', marginBottom: '8px' }}>
              Clique para preencher as credenciais de teste:
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => fillCredentials('admin@restaurante.com', 'admin123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem' }}
              >
                👤 Admin (admin123)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('garcom@restaurante.com', 'garcom123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem' }}
              >
                🧑‍🍳 Garçom (garcom123)
              </button>
            </div>
          </div>
        </div>

        <footer>Desenvolvido por: EDCLECIO</footer>
      </div>
    </div>
  );
};
