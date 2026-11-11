import React, { useState, useEffect } from 'react';

interface TopbarProps {
  title: string;
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onToggleSidebar }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setTimeStr(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="hamburger"
          onClick={onToggleSidebar}
          aria-label="Abrir Menu"
        >
          ☰
        </button>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <span className="topbar-badge">🕐 {timeStr}</span>
      </div>
    </div>
  );
};
