import React, { useEffect, useRef } from 'react';
import { AppDatabase } from '../db/initialData';
import { formatarMoeda, formatarDataHora } from '../db/storage';
import { PageId } from '../components/Sidebar';

interface DashboardProps {
  db: AppDatabase;
  onNavigate: (page: PageId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ db, onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Computations
  const finalizedOrders = db.pedidos.filter((p) => p.status === 'finalizado' || p.status === 'fechado');
  const totalVendas = finalizedOrders.reduce((sum, p) => sum + (p.total || 0), 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const pedidosHoje = db.pedidos.filter((p) => p.criado_em && p.criado_em.startsWith(todayStr)).length;
  const pedidosAbertos = db.pedidos.filter((p) => p.status === 'aberto' || p.status === 'preparando').length;

  const totalMesas = db.mesas.length;
  const mesasOcupadas = db.mesas.filter((m) => m.status === 'ocupada').length;
  const totalClientes = db.clientes.length;

  // Monthly sales calculation
  const salesByMonthMap: Record<string, number> = {};
  finalizedOrders.forEach((p) => {
    if (p.criado_em) {
      const parts = p.criado_em.split(' ')[0].split('-');
      if (parts.length >= 2) {
        const monthKey = `${parts[1]}/${parts[0]}`;
        salesByMonthMap[monthKey] = (salesByMonthMap[monthKey] || 0) + (p.total || 0);
      }
    }
  });

  const monthLabels = Object.keys(salesByMonthMap);
  const monthValues = Object.values(salesByMonthMap);

  // Default demo months if empty
  if (monthLabels.length === 0) {
    monthLabels.push('01/2026', '02/2026', '03/2026', '04/2026', '05/2026');
    monthValues.push(120, 240, 450, 310, totalVendas || 500);
  }

  // Draw chart exactly like index.php
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 220 * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = 220;
    const pad = 40;
    const bPad = 30;

    ctx.clearRect(0, 0, W, H);

    if (!monthLabels.length) {
      ctx.fillStyle = '#888';
      ctx.font = '14px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('Sem dados ainda', W / 2, 110);
      return;
    }

    const max = Math.max(...monthValues, 10);
    const xStep = (W - pad * 2) / Math.max(monthLabels.length - 1, 1);
    const yScale = (H - bPad - pad) / max;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + ((H - bPad - pad) / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(W - pad, y);
      ctx.stroke();
    }

    const pts = monthLabels.map((_, i) => ({
      x: pad + i * xStep,
      y: H - bPad - monthValues[i] * yScale,
    }));

    // Area fill with gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, 'rgba(232,168,124,0.35)');
    grad.addColorStop(1, 'rgba(232,168,124,0)');

    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineTo(pts[pts.length - 1].x, H - bPad);
    ctx.lineTo(pts[0].x, H - bPad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = '#e8a87c';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#e8a87c';
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#888';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    monthLabels.forEach((l, i) => {
      ctx.fillText(l, pad + i * xStep, H - 8);
    });
  }, [monthLabels, monthValues]);

  // Last 10 orders
  const ultimosPedidos = [...db.pedidos].reverse().slice(0, 10);

  const getClientName = (cliId?: number | null) => {
    if (!cliId) return 'Cliente Geral';
    const cli = db.clientes.find((c) => c.id === cliId);
    return cli ? cli.nome : 'Cliente Geral';
  };

  const getTableNumber = (mesaId: number) => {
    const m = db.mesas.find((tbl) => tbl.id === mesaId);
    return m ? `Mesa ${m.numero}` : `Mesa ${mesaId}`;
  };

  return (
    <div>
      {/* 4 Stat Cards */}
      <div className="row" style={{ marginBottom: '24px' }}>
        <div className="col-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(232,168,124,0.12)' }}>💰</div>
            <div>
              <div className="stat-label">Total Vendas</div>
              <div className="stat-value">{formatarMoeda(totalVendas)}</div>
              <div className="stat-sub">Todos os tempos</div>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(91,155,213,0.12)' }}>🧾</div>
            <div>
              <div className="stat-label">Pedidos Hoje</div>
              <div className="stat-value">{pedidosHoje}</div>
              <div className="stat-sub">{pedidosAbertos} em aberto</div>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(224,92,92,0.12)' }}>🪑</div>
            <div>
              <div className="stat-label">Mesas Ocupadas</div>
              <div className="stat-value">{mesasOcupadas}/{totalMesas}</div>
              <div className="stat-sub">{totalMesas - mesasOcupadas} disponíveis</div>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(92,184,92,0.12)' }}>👥</div>
            <div>
              <div className="stat-label">Clientes</div>
              <div className="stat-value">{totalClientes}</div>
              <div className="stat-sub">Cadastrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Table Status */}
      <div className="row" style={{ marginBottom: '24px' }}>
        <div className="col-6">
          <div className="card" style={{ height: '100%', marginBottom: 0 }}>
            <div className="card-header">
              <h3>📈 Vendas por Mês</h3>
            </div>
            <div className="card-body">
              <canvas ref={canvasRef} style={{ width: '100%', height: '220px', display: 'block' }} />
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card" style={{ height: '100%', marginBottom: 0 }}>
            <div className="card-header">
              <h3>🪑 Status das Mesas</h3>
              <button onClick={() => onNavigate('mesas')} className="btn btn-secondary btn-sm">
                Gerenciar Mesas
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {db.mesas.map((mesa) => {
                  const bg =
                    mesa.status === 'livre'
                      ? 'rgba(92,184,92,0.1)'
                      : mesa.status === 'ocupada'
                      ? 'rgba(224,92,92,0.1)'
                      : 'rgba(230,168,23,0.1)';
                  const border =
                    mesa.status === 'livre'
                      ? 'rgba(92,184,92,0.3)'
                      : mesa.status === 'ocupada'
                      ? 'rgba(224,92,92,0.3)'
                      : 'rgba(230,168,23,0.3)';
                  const color =
                    mesa.status === 'livre'
                      ? '#5cb85c'
                      : mesa.status === 'ocupada'
                      ? '#e05c5c'
                      : '#e6a817';

                  return (
                    <div
                      key={mesa.id}
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        textAlign: 'center',
                        minWidth: '85px',
                        flex: '1 0 85px',
                      }}
                    >
                      <div style={{ fontSize: '1.4rem' }}>🪑</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e8e8f0', marginTop: '2px' }}>
                        Mesa {mesa.numero}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize', color }}>
                        {mesa.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h3>🧾 Últimos Pedidos</h3>
          <button onClick={() => onNavigate('pedidos')} className="btn btn-secondary btn-sm">
            Ver Todos
          </button>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mesa</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {ultimosPedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                ultimosPedidos.map((p) => {
                  let badgeClass = 'badge-primary';
                  if (p.status === 'fechado' || p.status === 'finalizado') badgeClass = 'badge-success';
                  if (p.status === 'aberto') badgeClass = 'badge-warning';
                  if (p.status === 'cancelado') badgeClass = 'badge-danger';
                  if (p.status === 'preparando') badgeClass = 'badge-info';

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>#{p.id}</td>
                      <td>{getTableNumber(p.mesa_id)}</td>
                      <td>{getClientName(p.cliente_id)}</td>
                      <td style={{ color: '#e8a87c', fontWeight: 700 }}>
                        {formatarMoeda(p.total)}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{p.status}</span>
                      </td>
                      <td style={{ color: '#888' }}>{formatarDataHora(p.criado_em)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
