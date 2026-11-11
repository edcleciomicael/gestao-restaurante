import React, { useState } from 'react';
import { AppDatabase } from '../db/initialData';
import { Categoria } from '../types';

interface CategoriasProps {
  db: AppDatabase;
  onUpdateDb: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const Categorias: React.FC<CategoriasProps> = ({ db, onUpdateDb }) => {
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<{ id: number; nome: string } | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEditClick = (cat: Categoria) => {
    setEditingCat(cat);
    setNome(cat.nome);
    setDescricao(cat.descricao);
    setAtivo(cat.ativo);
  };

  const handleCancelEdit = () => {
    setEditingCat(null);
    setNome('');
    setDescricao('');
    setAtivo(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showMsg('Nome da categoria é obrigatório.', 'danger');
      return;
    }

    if (editingCat) {
      onUpdateDb((prev) => ({
        ...prev,
        categorias: prev.categorias.map((c) =>
          c.id === editingCat.id ? { ...c, nome, descricao, ativo } : c
        ),
      }));
      showMsg(`Categoria "${nome}" atualizada!`);
      handleCancelEdit();
    } else {
      const newId = db.next_ids.categorias;
      const newCat: Categoria = {
        id: newId,
        nome,
        descricao,
        ativo,
      };

      onUpdateDb((prev) => ({
        ...prev,
        categorias: [...prev.categorias, newCat],
        next_ids: { ...prev.next_ids, categorias: prev.next_ids.categorias + 1 },
      }));
      showMsg(`Categoria "${nome}" cadastrada com sucesso!`);
      setNome('');
      setDescricao('');
    }
  };

  const handleDelete = (id: number, catNome: string) => {
    const productsInCat = db.produtos.filter((p) => p.categoria_id === id);
    if (productsInCat.length > 0) {
      showMsg(`Esta categoria possui ${productsInCat.length} produto(s) vinculado(s) e não pode ser excluída.`, 'danger');
      return;
    }
    setConfirmDeleteCat({ id, nome: catNome });
  };

  const confirmDelete = () => {
    if (!confirmDeleteCat) return;
    onUpdateDb((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c.id !== confirmDeleteCat.id),
    }));
    showMsg(`Categoria "${confirmDeleteCat.nome}" excluída.`);
    setConfirmDeleteCat(null);
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
              <h3>{editingCat ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h3>
              {editingCat && (
                <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm">
                  Cancelar
                </button>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome da Categoria *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Sobremesas, Bebidas..."
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    className="form-control"
                    placeholder="Descrição breve dos pratos ou itens..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="catAtivo"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="catAtivo" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                    Categoria ativa no cardápio
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {editingCat ? '💾 Salvar Alterações' : '➕ Cadastrar Categoria'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Table Column */}
        <div style={{ flex: '1 1 500px' }}>
          <div className="card">
            <div className="card-header">
              <h3>📂 Categorias Cadastradas ({db.categorias.length})</h3>
            </div>
            <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Produtos</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {db.categorias.map((c) => {
                    const prodCount = db.produtos.filter((p) => p.categoria_id === c.id).length;
                    return (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td style={{ fontWeight: 600 }}>{c.nome}</td>
                        <td style={{ color: '#888' }}>{c.descricao || '—'}</td>
                        <td>
                          <span className="badge badge-secondary">{prodCount} produtos</span>
                        </td>
                        <td>
                          <span className={`badge ${c.ativo ? 'badge-success' : 'badge-danger'}`}>
                            {c.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleEditClick(c)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {confirmDeleteCat && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteCat(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.92rem' }}>
              Deseja realmente excluir a categoria <strong>"{confirmDeleteCat.nome}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmDeleteCat(null)} className="btn btn-secondary">
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
