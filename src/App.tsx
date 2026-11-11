import React, { useState, useEffect } from 'react';
import { loadDatabase, saveDatabase } from './db/storage';
import { AppDatabase } from './db/initialData';
import { Usuario } from './types';
import { Sidebar, PageId } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Pedidos } from './pages/Pedidos';
import { Mesas } from './pages/Mesas';
import { Produtos } from './pages/Produtos';
import { Categorias } from './pages/Categorias';
import { Clientes } from './pages/Clientes';
import { Financeiro } from './pages/Financeiro';
import { Documentacao } from './pages/Documentacao';

export const App: React.FC = () => {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('restaurante_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return db.usuarios[0] || null;
      }
    }
    return db.usuarios[0] || null;
  });

  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync db changes to localStorage
  const handleUpdateDb = (updater: (prev: AppDatabase) => AppDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem('restaurante_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('restaurante_user');
  };

  if (!currentUser) {
    return <Login usuarios={db.usuarios} onLogin={handleLogin} />;
  }

  const pageTitles: Record<PageId, string> = {
    dashboard: 'Dashboard',
    pedidos: 'Pedidos',
    mesas: 'Mesas',
    produtos: 'Produtos',
    categorias: 'Categorias',
    clientes: 'Clientes',
    financeiro: 'Financeiro',
    documentacao: 'Relatório do Sistema & Documentação PDF',
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main">
        <Topbar
          title={pageTitles[currentPage]}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="content">
          {currentPage === 'dashboard' && (
            <Dashboard db={db} onNavigate={(page) => setCurrentPage(page)} />
          )}
          {currentPage === 'pedidos' && (
            <Pedidos db={db} onUpdateDb={handleUpdateDb} />
          )}
          {currentPage === 'mesas' && (
            <Mesas db={db} onUpdateDb={handleUpdateDb} />
          )}
          {currentPage === 'produtos' && (
            <Produtos db={db} onUpdateDb={handleUpdateDb} />
          )}
          {currentPage === 'categorias' && (
            <Categorias db={db} onUpdateDb={handleUpdateDb} />
          )}
          {currentPage === 'clientes' && (
            <Clientes db={db} onUpdateDb={handleUpdateDb} />
          )}
          {currentPage === 'financeiro' && (
            <Financeiro db={db} onUpdateDb={handleUpdateDb} />
          )}
          {currentPage === 'documentacao' && (
            <Documentacao db={db} onUpdateDb={handleUpdateDb} />
          )}
        </div>

        <footer>Desenvolvido por: EDCLECIO</footer>
      </div>
    </div>
  );
};

export default App;
