import React, { useState } from 'react';
import { AppDatabase } from '../db/initialData';
import { MovimentacaoFinanceira } from '../types';
import { formatarMoeda, formatarDataHora } from '../db/storage';

interface FinanceiroProps {
  db: AppDatabase;
  onUpdateDb: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const Financeiro: React.FC<FinanceiroProps> = ({ db, onUpdateDb }) => {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number>(0);
  const [pedidoId, setPedidoId] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Calculations
  const totalEntradas = db.financeiro
    .filter((f) => f.tipo === 'entrada')
    .reduce((sum, f) => sum + (f.valor || 0), 0);

  const totalSaidas = db.financeiro
    .filter((f) => f.tipo === 'saida')
    .reduce((sum, f) => sum + (f.valor || 0), 0);

  const saldo = totalEntradas - totalSaidas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      showMsg('Descrição da movimentação é obrigatória.', 'danger');
      return;
    }
    if (valor <= 0) {
      showMsg('Informe um valor válido maior que zero.', 'danger');
      return;
    }

    const newId = db.next_ids.financeiro;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const novaMovimentacao: MovimentacaoFinanceira = {
      id: newId,
      tipo,
      descricao,
      valor: Number(valor),
      pedido_id: pedidoId ? Number(pedidoId) : null,
      criado_em: nowStr,
    };

    onUpdateDb((prev) => ({
      ...prev,
      financeiro: [novaMovimentacao, ...prev.financeiro],
      next_ids: { ...prev.next_ids, financeiro: prev.next_ids.financeiro + 1 },
    }));

    showMsg(`Movimentação de ${tipo.toUpperCase()} cadastrada com sucesso!`);
    setDescricao('');
    setValor(0);
    setPedidoId('');
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId === null) return;
    onUpdateDb((prev) => ({
      ...prev,
      financeiro: prev.financeiro.filter((f) => f.id !== confirmDeleteId),
    }));
    showMsg('Lançamento excluído.');
    setConfirmDeleteId(null);
  };

  return (
    <div>
      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3 Summary Cards */}
      <div className="row" style={{ marginBottom: '24px' }}>
        <div className="col-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(92,184,92,0.15)', color: '#5cb85c' }}>
              ↗️
            </div>
            <div>
              <div className="stat-label">Total Entradas</div>
              <div className="stat-value" style={{ color: '#5cb85c' }}>
                {formatarMoeda(totalEntradas)}
              </div>
              <div className="stat-sub">Vendas & Recebimentos</div>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(224,92,92,0.15)', color: '#e05c5c' }}>
              ↘️
            </div>
            <div>
              <div className="stat-label">Total Saídas</div>
              <div className="stat-value" style={{ color: '#e05c5c' }}>
                {formatarMoeda(totalSaidas)}
              </div>
              <div className="stat-sub">Custos & Despesas</div>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(232,168,124,0.15)', color: '#e8a87c' }}>
              💰
            </div>
            <div>
              <div className="stat-label">Saldo Atual</div>
              <div className="stat-value" style={{ color: saldo >= 0 ? '#e8a87c' : '#e05c5c' }}>
                {formatarMoeda(saldo)}
              </div>
              <div className="stat-sub">{saldo >= 0 ? 'Resultado Positivo' : 'Resultado Negativo'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Form Column */}
        <div className="col-4">
          <div className="card">
            <div className="card-header">
              <h3>➕ Nova Movimentação</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tipo de Movimentação</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setTipo('entrada')}
                      className={`btn ${tipo === 'entrada' ? 'btn-success' : 'btn-secondary'}`}
                      style={{ padding: '10px' }}
                    >
                      ↗️ Entrada
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('saida')}
                      className={`btn ${tipo === 'saida' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '10px' }}
                    >
                      ↘️ Saída
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição do Lançamento *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Pagamento Fornecedor de Carnes"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    className="form-control"
                    value={valor || ''}
                    placeholder="0,00"
                    onChange={(e) => setValor(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pedido Vinculado (Opcional)</label>
                  <select
                    className="form-control"
                    value={pedidoId}
                    onChange={(e) => setPedidoId(e.target.value)}
                  >
                    <option value="">Nenhum pedido vinculado</option>
                    {db.pedidos.map((p) => (
                      <option key={p.id} value={p.id}>
                        Pedido #{p.id} — {formatarMoeda(p.total)} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  💾 Gravar Lançamento
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Transactions Table Column */}
        <div style={{ flex: '1 1 500px' }}>
          <div className="card">
            <div className="card-header">
              <h3>📑 Histórico Financeiro ({db.financeiro.length})</h3>
            </div>
            <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Pedido</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th style={{ textAlign: 'center' }}>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {db.financeiro.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        Nenhum registro financeiro encontrado.
                      </td>
                    </tr>
                  ) : (
                    db.financeiro.map((f) => (
                      <tr key={f.id}>
                        <td>#{f.id}</td>
                        <td style={{ color: '#888', fontSize: '0.8rem' }}>{formatarDataHora(f.criado_em)}</td>
                        <td>
                          <span className={`badge ${f.tipo === 'entrada' ? 'badge-success' : 'badge-danger'}`}>
                            {f.tipo === 'entrada' ? '↗ Entrada' : '↘ Saída'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{f.descricao}</td>
                        <td style={{ color: '#aaa', fontSize: '0.8rem' }}>
                          {f.pedido_id ? `#${f.pedido_id}` : '—'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: f.tipo === 'entrada' ? '#5cb85c' : '#e05c5c',
                          }}
                        >
                          {f.tipo === 'entrada' ? '+' : '-'} {formatarMoeda(f.valor)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {confirmDeleteId !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.92rem' }}>
              Deseja realmente excluir este lançamento financeiro?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmDeleteId(null)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                🗑️ Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
