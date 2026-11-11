import React, { useState } from 'react';
import { AppDatabase } from '../db/initialData';
import { Produto } from '../types';
import { formatarMoeda } from '../db/storage';

interface ProdutosProps {
  db: AppDatabase;
  onUpdateDb: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const Produtos: React.FC<ProdutosProps> = ({ db, onUpdateDb }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(db.categorias[0]?.id || 1);
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number>(0);
  const [estoque, setEstoque] = useState<number>(10);
  const [ativo, setAtivo] = useState(true);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [confirmDeleteProd, setConfirmDeleteProd] = useState<{ id: number; nome: string } | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const getCategoryName = (catId: number) => {
    const c = db.categorias.find((cat) => cat.id === catId);
    return c ? c.nome : 'Sem Categoria';
  };

  const openNewModal = () => {
    setEditingProduto(null);
    setNome('');
    setCategoriaId(db.categorias[0]?.id || 1);
    setDescricao('');
    setPreco(0);
    setEstoque(10);
    setAtivo(true);
    setShowModal(true);
  };

  const openEditModal = (p: Produto) => {
    setEditingProduto(p);
    setNome(p.nome);
    setCategoriaId(p.categoria_id);
    setDescricao(p.descricao);
    setPreco(p.preco);
    setEstoque(p.estoque);
    setAtivo(p.ativo);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showMsg('Nome do produto é obrigatório.', 'danger');
      return;
    }

    if (editingProduto) {
      onUpdateDb((prev) => ({
        ...prev,
        produtos: prev.produtos.map((p) =>
          p.id === editingProduto.id
            ? {
                ...p,
                nome,
                categoria_id: Number(categoriaId),
                descricao,
                preco: Number(preco),
                estoque: Number(estoque),
                ativo,
              }
            : p
        ),
      }));
      showMsg(`Produto "${nome}" atualizado com sucesso!`);
    } else {
      const newId = db.next_ids.produtos;
      const newProd: Produto = {
        id: newId,
        nome,
        categoria_id: Number(categoriaId),
        descricao,
        preco: Number(preco),
        estoque: Number(estoque),
        ativo,
      };

      onUpdateDb((prev) => ({
        ...prev,
        produtos: [...prev.produtos, newProd],
        next_ids: { ...prev.next_ids, produtos: prev.next_ids.produtos + 1 },
      }));
      showMsg(`Produto "${nome}" cadastrado com sucesso!`);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number, prodName: string) => {
    setConfirmDeleteProd({ id, nome: prodName });
  };

  const confirmDelete = () => {
    if (!confirmDeleteProd) return;
    onUpdateDb((prev) => ({
      ...prev,
      produtos: prev.produtos.filter((p) => p.id !== confirmDeleteProd.id),
    }));
    showMsg(`Produto "${confirmDeleteProd.nome}" excluído.`);
    setConfirmDeleteProd(null);
  };

  const toggleAtivo = (id: number) => {
    onUpdateDb((prev) => ({
      ...prev,
      produtos: prev.produtos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)),
    }));
  };

  const filteredProdutos = db.produtos.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.categoria_id === selectedCategory;
    const matchSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
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
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '500px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar produto por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={openNewModal} className="btn btn-primary">
          ➕ Novo Produto
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Todos ({db.produtos.length})
        </button>
        {db.categorias.map((cat) => {
          const count = db.produtos.filter((p) => p.categoria_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat.nome} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-header">
          <h3>🍽️ Cardápio & Estoque ({filteredProdutos.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Nenhum produto cadastrado com esses critérios.
                  </td>
                </tr>
              ) : (
                filteredProdutos.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{p.descricao}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{getCategoryName(p.categoria_id)}</span>
                    </td>
                    <td style={{ color: '#e8a87c', fontWeight: 700, fontSize: '0.92rem' }}>
                      {formatarMoeda(p.preco)}
                    </td>
                    <td>
                      <span
                        style={{
                          color: p.estoque <= 10 ? '#e05c5c' : '#5cb85c',
                          fontWeight: 600,
                        }}
                      >
                        {p.estoque} un
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleAtivo(p.id)}
                        className={`badge ${p.ativo ? 'badge-success' : 'badge-danger'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Clique para alternar status"
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '6px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.nome)}
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              <span>{editingProduto ? '✏️ Editar Produto' : '➕ Novo Produto'}</span>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome do Produto *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Picanha na Brasa"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoria *</label>
                <select
                  className="form-control"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                  required
                >
                  {db.categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="col-6">
                  <div className="form-group">
                    <label>Preço de Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="form-control"
                      value={preco}
                      onChange={(e) => setPreco(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="col-6">
                  <div className="form-group">
                    <label>Estoque Atual *</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={estoque}
                      onChange={(e) => setEstoque(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Descrição do Prato / Ingredientes</label>
                <textarea
                  className="form-control"
                  placeholder="Ex: Acompanha arroz, farofa e vinagrete..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="prodAtivo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                />
                <label htmlFor="prodAtivo" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                  Produto ativo para vendas no cardápio
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDeleteProd && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteProd(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.92rem' }}>
              Deseja realmente excluir o produto <strong>"{confirmDeleteProd.nome}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmDeleteProd(null)} className="btn btn-secondary">
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
