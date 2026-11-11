import React, { useState } from 'react';
import { AppDatabase } from '../db/initialData';
import { Cliente } from '../types';

interface ClientesProps {
  db: AppDatabase;
  onUpdateDb: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const Clientes: React.FC<ClientesProps> = ({ db, onUpdateDb }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [confirmDeleteCli, setConfirmDeleteCli] = useState<{ id: number; nome: string } | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const openNewModal = () => {
    setEditingCliente(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setEndereco('');
    setShowModal(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setNome(c.nome);
    setEmail(c.email);
    setTelefone(c.telefone);
    setCpf(c.cpf || '');
    setEndereco(c.endereco || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showMsg('Nome do cliente é obrigatório.', 'danger');
      return;
    }

    if (editingCliente) {
      onUpdateDb((prev) => ({
        ...prev,
        clientes: prev.clientes.map((c) =>
          c.id === editingCliente.id ? { ...c, nome, email, telefone, cpf, endereco } : c
        ),
      }));
      showMsg(`Cliente "${nome}" atualizado!`);
    } else {
      const newId = db.next_ids.clientes;
      const today = new Date().toISOString().slice(0, 10);
      const newCli: Cliente = {
        id: newId,
        nome,
        email,
        telefone,
        cpf,
        endereco,
        criado_em: today,
      };

      onUpdateDb((prev) => ({
        ...prev,
        clientes: [...prev.clientes, newCli],
        next_ids: { ...prev.next_ids, clientes: prev.next_ids.clientes + 1 },
      }));
      showMsg(`Cliente "${nome}" cadastrado com sucesso!`);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number, cliNome: string) => {
    setConfirmDeleteCli({ id, nome: cliNome });
  };

  const confirmDelete = () => {
    if (!confirmDeleteCli) return;
    onUpdateDb((prev) => ({
      ...prev,
      clientes: prev.clientes.filter((c) => c.id !== confirmDeleteCli.id),
    }));
    showMsg(`Cliente "${confirmDeleteCli.nome}" excluído.`);
    setConfirmDeleteCli(null);
  };

  const filteredClientes = db.clientes.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.nome.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefone.toLowerCase().includes(q) ||
      (c.cpf && c.cpf.includes(q))
    );
  });

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

      {/* Top Filter and Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px', maxWidth: '450px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar cliente por nome, telefone, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={openNewModal} className="btn btn-primary">
          ➕ Novo Cliente
        </button>
      </div>

      {/* Clientes Table */}
      <div className="card">
        <div className="card-header">
          <h3>👥 Clientes Cadastrados ({filteredClientes.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>CPF</th>
                <th>Endereço</th>
                <th>Cadastrado Em</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td style={{ color: 'var(--accent)' }}>{c.telefone || '—'}</td>
                    <td style={{ color: '#aaa' }}>{c.email || '—'}</td>
                    <td style={{ color: '#888' }}>{c.cpf || '—'}</td>
                    <td style={{ color: '#888', maxWidth: '200px' }}>{c.endereco || '—'}</td>
                    <td style={{ color: '#888', fontSize: '0.8rem' }}>{c.criado_em}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '6px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.nome)}
                        className="btn btn-danger btn-sm"
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              <span>{editingCliente ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</span>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="col-6">
                  <div className="form-group">
                    <label>Telefone / WhatsApp</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="(11) 99999-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-6">
                  <div className="form-group">
                    <label>CPF</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Endereço Completo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rua, número, bairro..."
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDeleteCli && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteCli(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.92rem' }}>
              Deseja realmente excluir o cliente <strong>"{confirmDeleteCli.nome}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmDeleteCli(null)} className="btn btn-secondary">
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
