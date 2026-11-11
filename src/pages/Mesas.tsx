import React, { useState } from 'react';
import { AppDatabase } from '../db/initialData';
import { Mesa, MesaStatus } from '../types';

interface MesasProps {
  db: AppDatabase;
  onUpdateDb: (updater: (prev: AppDatabase) => AppDatabase) => void;
  onOpenOrderForTable?: (mesaId: number) => void;
}

export const Mesas: React.FC<MesasProps> = ({ db, onUpdateDb }) => {
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [numero, setNumero] = useState<string>('');
  const [capacidade, setCapacidade] = useState<number>(4);
  const [localizacao, setLocalizacao] = useState<string>('Salao Principal');
  const [status, setStatus] = useState<MesaStatus>('livre');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEditClick = (mesa: Mesa) => {
    setEditingMesa(mesa);
    setNumero(String(mesa.numero));
    setCapacidade(mesa.capacidade);
    setLocalizacao(mesa.localizacao);
    setStatus(mesa.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMesa(null);
    setNumero('');
    setCapacidade(4);
    setLocalizacao('Salao Principal');
    setStatus('livre');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) {
      showMsg('Número da mesa é obrigatório.', 'danger');
      return;
    }

    if (editingMesa) {
      // Update
      onUpdateDb((prev) => ({
        ...prev,
        mesas: prev.mesas.map((m) =>
          m.id === editingMesa.id
            ? {
                ...m,
                numero: isNaN(Number(numero)) ? numero : Number(numero),
                capacidade: Number(capacidade),
                localizacao,
                status,
              }
            : m
        ),
      }));
      showMsg('Mesa atualizada com sucesso!');
      handleCancelEdit();
    } else {
      // Create
      const newId = db.next_ids.mesas;
      const newMesa: Mesa = {
        id: newId,
        numero: isNaN(Number(numero)) ? numero : Number(numero),
        capacidade: Number(capacidade),
        localizacao,
        status,
      };

      onUpdateDb((prev) => ({
        ...prev,
        mesas: [...prev.mesas, newMesa],
        next_ids: { ...prev.next_ids, mesas: prev.next_ids.mesas + 1 },
      }));
      showMsg('Mesa cadastrada com sucesso!');
      setNumero('');
      setCapacidade(4);
    }
  };

  const updateTableStatus = (mesaId: number, newStatus: MesaStatus) => {
    onUpdateDb((prev) => ({
      ...prev,
      mesas: prev.mesas.map((m) => (m.id === mesaId ? { ...m, status: newStatus } : m)),
    }));
    showMsg(`Mesa atualizada para ${newStatus}!`);
  };

  const handleDelete = (mesaId: number) => {
    const activeOrder = db.pedidos.find(
      (p) => p.mesa_id === mesaId && (p.status === 'aberto' || p.status === 'preparando')
    );
    if (activeOrder) {
      showMsg('Esta mesa possui um pedido ativo em andamento e não pode ser excluída.', 'danger');
      return;
    }
    setConfirmDeleteId(mesaId);
  };

  const confirmDelete = () => {
    if (confirmDeleteId === null) return;
    onUpdateDb((prev) => ({
      ...prev,
      mesas: prev.mesas.filter((m) => m.id !== confirmDeleteId),
    }));
    setConfirmDeleteId(null);
    showMsg('Mesa excluída com sucesso.');
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

      <div className="row">
        {/* Form Column */}
        <div className="col-4">
          <div className="card">
            <div className="card-header">
              <h3>{editingMesa ? '✏️ Editar Mesa' : '➕ Nova Mesa'}</h3>
              {editingMesa && (
                <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm">
                  Cancelar
                </button>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Número / Identificação *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 7, 08 ou VIP 1"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Capacidade (Pessoas)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="form-control"
                    value={capacidade}
                    onChange={(e) => setCapacidade(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Localização</label>
                  <select
                    className="form-control"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                  >
                    <option value="Salao Principal">Salão Principal</option>
                    <option value="Varanda">Varanda</option>
                    <option value="Terraco">Terraço</option>
                    <option value="Área Externa">Área Externa</option>
                    <option value="Espaço VIP">Espaço VIP</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status Inicial</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MesaStatus)}
                  >
                    <option value="livre">Livre</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="reservada">Reservada</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {editingMesa ? '💾 Salvar Alterações' : '➕ Cadastrar Mesa'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mesas Grid Column */}
        <div style={{ flex: '1 1 500px' }}>
          <div className="card">
            <div className="card-header">
              <h3>🪑 Mesas do Estabelecimento ({db.mesas.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-success">
                  {db.mesas.filter((m) => m.status === 'livre').length} Livres
                </span>
                <span className="badge badge-danger">
                  {db.mesas.filter((m) => m.status === 'ocupada').length} Ocupadas
                </span>
                <span className="badge badge-warning">
                  {db.mesas.filter((m) => m.status === 'reservada').length} Reservadas
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="mesas-grid">
                {db.mesas.map((mesa) => {
                  let badgeClass = 'badge-success';
                  if (mesa.status === 'ocupada') badgeClass = 'badge-danger';
                  if (mesa.status === 'reservada') badgeClass = 'badge-warning';

                  return (
                    <div key={mesa.id} className={`mesa-card ${mesa.status}`}>
                      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🪑</div>
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '4px 0' }}>
                          Mesa {mesa.numero}
                        </h3>
                        <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{mesa.localizacao}</p>
                        <p style={{ color: '#777', fontSize: '0.75rem', marginTop: '2px' }}>
                          Capacidade: {mesa.capacidade} pessoas
                        </p>
                        <div style={{ marginTop: '10px' }}>
                          <span className={`badge ${badgeClass}`}>{mesa.status}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {mesa.status !== 'livre' && (
                            <button
                              onClick={() => updateTableStatus(mesa.id, 'livre')}
                              className="btn btn-success btn-sm"
                              style={{ flex: 1 }}
                            >
                              Liberar
                            </button>
                          )}
                          {mesa.status !== 'ocupada' && (
                            <button
                              onClick={() => updateTableStatus(mesa.id, 'ocupada')}
                              className="btn btn-danger btn-sm"
                              style={{ flex: 1 }}
                            >
                              Ocupar
                            </button>
                          )}
                          {mesa.status !== 'reservada' && (
                            <button
                              onClick={() => updateTableStatus(mesa.id, 'reservada')}
                              className="btn btn-warning btn-sm"
                              style={{ flex: 1 }}
                            >
                              Reservar
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleEditClick(mesa)}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(mesa.id)}
                            className="btn btn-danger btn-sm"
                            style={{ flex: 1 }}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmDeleteId !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.92rem' }}>
              Deseja realmente excluir esta mesa do estabelecimento?
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
