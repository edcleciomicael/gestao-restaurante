import React from 'react';
import { Usuario } from '../types';

export type PageId = 'dashboard' | 'pedidos' | 'mesas' | 'produtos' | 'categorias' | 'clientes' | 'financeiro' | 'documentacao';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  currentUser: Usuario;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'pedidos', icon: '🧾', label: 'Pedidos' },
  { id: 'mesas', icon: '🪑', label: 'Mesas' },
  { id: 'produtos', icon: '🍽️', label: 'Produtos' },
  { id: 'categorias', icon: '📂', label: 'Categorias' },
  { id: 'clientes', icon: '👥', label: 'Clientes' },
  { id: 'financeiro', icon: '💰', label: 'Financeiro' },
  { id: 'documentacao', icon: '📑', label: 'Relatório & PDF' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <div
        className={`overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-inner">
            <div className="ico">🍽️</div>
            <div>
              <h2>Restaurante</h2>
              <span>Manager Pro</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu Principal</div>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {(currentUser?.nome || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{currentUser?.nome || 'Usuário'}</div>
              <div className="user-role">
                {currentUser?.perfil === 'admin' ? 'Administrador' : 'Garçom'}
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            ⏻ Sair do Sistema
          </button>
        </div>
      </div>
    </>
  );
};
