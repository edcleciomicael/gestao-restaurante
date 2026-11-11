import React, { useState } from 'react';
import { AppDatabase } from '../db/initialData';
import { Pedido, PedidoStatus } from '../types';
import { formatarMoeda, formatarDataHora } from '../db/storage';

interface PedidosProps {
  db: AppDatabase;
  onUpdateDb: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const Pedidos: React.FC<PedidosProps> = ({ db, onUpdateDb }) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [activePedido, setActivePedido] = useState<Pedido | null>(null);

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [newMesaId, setNewMesaId] = useState<number>(db.mesas[0]?.id || 1);
  const [newClienteId, setNewClienteId] = useState<number | string>('');
  const [newObs, setNewObs] = useState('');

  // Add item form inside order details
  const [selectedProdutoId, setSelectedProdutoId] = useState<number>(db.produtos[0]?.id || 1);
  const [itemQtd, setItemQtd] = useState<number>(1);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<'cartao' | 'dinheiro' | 'pix'>('cartao');
  const [valorPago, setValorPago] = useState<number>(0);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Helper getters
  const getTable = (mesaId: number) => db.mesas.find((m) => m.id === mesaId);
  const getClient = (cliId?: number | null) => (cliId ? db.clientes.find((c) => c.id === cliId) : null);

  // Filtered orders
  const filteredPedidos = db.pedidos
    .filter((p) => {
      if (filterStatus === 'todos') return true;
      if (filterStatus === 'finalizado') return p.status === 'finalizado' || p.status === 'fechado';
      return p.status === filterStatus;
    })
    .slice()
    .reverse();

  // Create new order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMesaId) {
      showMsg('Selecione uma mesa.', 'danger');
      return;
    }

    const orderId = db.next_ids.pedidos;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newOrder: Pedido = {
      id: orderId,
      mesa_id: Number(newMesaId),
      cliente_id: newClienteId ? Number(newClienteId) : null,
      observacao: newObs,
      status: 'aberto',
      total: 0,
      criado_em: nowStr,
      fechado_em: null,
      itens: [],
    };

    onUpdateDb((prev) => ({
      ...prev,
      pedidos: [...prev.pedidos, newOrder],
      mesas: prev.mesas.map((m) => (m.id === Number(newMesaId) ? { ...m, status: 'ocupada' } : m)),
      next_ids: { ...prev.next_ids, pedidos: prev.next_ids.pedidos + 1 },
    }));

    setShowNewModal(false);
    setNewObs('');
    showMsg(`Pedido #${orderId} aberto com sucesso!`);
    setActivePedido(newOrder);
  };

  // Add Item to Order
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePedido) return;

    const produto = db.produtos.find((p) => p.id === Number(selectedProdutoId));
    if (!produto) {
      showMsg('Produto não encontrado.', 'danger');
      return;
    }

    const qtd = Math.max(1, Number(itemQtd));
    const subtotal = produto.preco * qtd;

    const existingIndex = activePedido.itens.findIndex((i) => i.produto_id === produto.id);
    let updatedItens = [...activePedido.itens];

    if (existingIndex >= 0) {
      const existing = updatedItens[existingIndex];
      const newQtd = existing.quantidade + qtd;
      updatedItens[existingIndex] = {
        ...existing,
        quantidade: newQtd,
        subtotal: existing.preco_unit * newQtd,
      };
    } else {
      updatedItens.push({
        produto_id: produto.id,
        nome: produto.nome,
        quantidade: qtd,
        preco_unit: produto.preco,
        subtotal,
      });
    }

    const newTotal = updatedItens.reduce((sum, item) => sum + item.subtotal, 0);

    const updatedOrder: Pedido = {
      ...activePedido,
      itens: updatedItens,
      total: newTotal,
    };

    onUpdateDb((prev) => ({
      ...prev,
      pedidos: prev.pedidos.map((p) => (p.id === activePedido.id ? updatedOrder : p)),
    }));

    setActivePedido(updatedOrder);
    setItemQtd(1);
    showMsg(`Item "${produto.nome}" adicionado!`);
  };

  // Remove Item from Order
  const handleRemoveItem = (produtoId: number) => {
    if (!activePedido) return;
    const updatedItens = activePedido.itens.filter((i) => i.produto_id !== produtoId);
    const newTotal = updatedItens.reduce((sum, item) => sum + item.subtotal, 0);

    const updatedOrder: Pedido = {
      ...activePedido,
      itens: updatedItens,
      total: newTotal,
    };

    onUpdateDb((prev) => ({
      ...prev,
      pedidos: prev.pedidos.map((p) => (p.id === activePedido.id ? updatedOrder : p)),
    }));

    setActivePedido(updatedOrder);
    showMsg('Item removido do pedido.');
  };

  // Update Status
  const handleUpdateStatus = (newStatus: PedidoStatus) => {
    if (!activePedido) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const isClosing = newStatus === 'fechado' || newStatus === 'cancelado' || newStatus === 'finalizado';

    const updatedOrder: Pedido = {
      ...activePedido,
      status: newStatus,
      fechado_em: isClosing ? nowStr : activePedido.fechado_em,
    };

    onUpdateDb((prev) => {
      let mesas = prev.mesas;
      if (isClosing) {
        // Free the table
        mesas = prev.mesas.map((m) => (m.id === activePedido.mesa_id ? { ...m, status: 'livre' } : m));
      }
      return {
        ...prev,
        pedidos: prev.pedidos.map((p) => (p.id === activePedido.id ? updatedOrder : p)),
        mesas,
      };
    });

    setActivePedido(updatedOrder);
    showMsg(`Status atualizado para "${newStatus}".`);
  };

  // Finalize payment
  const handleFinalizePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePedido) return;

    const total = activePedido.total;
    const pago = formaPagamento === 'dinheiro' ? Math.max(valorPago, total) : total;
    const troco = Math.max(0, pago - total);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const pagamentoId = db.next_ids.pagamentos;
    const financeiroId = db.next_ids.financeiro;

    const novoPagamento = {
      id: pagamentoId,
      pedido_id: activePedido.id,
      forma: formaPagamento,
      valor: total,
      troco,
      criado_em: nowStr,
    };

    const novaMovimentacao = {
      id: financeiroId,
      pedido_id: activePedido.id,
      tipo: 'entrada' as const,
      descricao: `Recebimento Pedido #${activePedido.id} (${formaPagamento.toUpperCase()})`,
      valor: total,
      criado_em: nowStr,
    };

    const updatedOrder: Pedido = {
      ...activePedido,
      status: 'finalizado',
      fechado_em: nowStr,
    };

    onUpdateDb((prev) => ({
      ...prev,
      pedidos: prev.pedidos.map((p) => (p.id === activePedido.id ? updatedOrder : p)),
      mesas: prev.mesas.map((m) => (m.id === activePedido.mesa_id ? { ...m, status: 'livre' } : m)),
      pagamentos: [...prev.pagamentos, novoPagamento],
      financeiro: [...prev.financeiro, novaMovimentacao],
      next_ids: {
        ...prev.next_ids,
        pagamentos: prev.next_ids.pagamentos + 1,
        financeiro: prev.next_ids.financeiro + 1,
      },
    }));

    setShowPaymentModal(false);
    setActivePedido(updatedOrder);
    showMsg(`Pagamento registrado com sucesso! Pedido #${activePedido.id} finalizado.`);
  };

  return (
    <div>
      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['todos', 'aberto', 'preparando', 'pronto', 'entregue', 'finalizado', 'cancelado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>

        <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
          ➕ Abrir Novo Pedido
        </button>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header">
          <h3>🧾 Lista de Pedidos ({filteredPedidos.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mesa</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data Abertura</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                    Nenhum pedido encontrado neste filtro.
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((pedido) => {
                  const mesa = getTable(pedido.mesa_id);
                  const cliente = getClient(pedido.cliente_id);

                  let badgeClass = 'badge-primary';
                  if (pedido.status === 'finalizado' || pedido.status === 'fechado') badgeClass = 'badge-success';
                  if (pedido.status === 'aberto') badgeClass = 'badge-warning';
                  if (pedido.status === 'preparando') badgeClass = 'badge-info';
                  if (pedido.status === 'cancelado') badgeClass = 'badge-danger';

                  return (
                    <tr key={pedido.id}>
                      <td style={{ fontWeight: 700 }}>#{pedido.id}</td>
                      <td>{mesa ? `Mesa ${mesa.numero} (${mesa.localizacao})` : `Mesa ${pedido.mesa_id}`}</td>
                      <td>{cliente ? cliente.nome : <span style={{ color: '#888' }}>Cliente Balcão</span>}</td>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {pedido.itens.reduce((acc, i) => acc + i.quantidade, 0)} itens
                        </span>
                      </td>
                      <td style={{ color: '#e8a87c', fontWeight: 700, fontSize: '0.95rem' }}>
                        {formatarMoeda(pedido.total)}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{pedido.status}</span>
                      </td>
                      <td style={{ color: '#888', fontSize: '0.8rem' }}>{formatarDataHora(pedido.criado_em)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setActivePedido(pedido)}
                          className="btn btn-secondary btn-sm"
                          style={{ marginRight: '6px' }}
                        >
                          👁️ Detalhes
                        </button>
                        {pedido.status !== 'finalizado' && pedido.status !== 'fechado' && pedido.status !== 'cancelado' && (
                          <button
                            onClick={() => {
                              setActivePedido(pedido);
                              setShowPaymentModal(true);
                              setValorPago(pedido.total);
                            }}
                            className="btn btn-success btn-sm"
                          >
                            💳 Cobrar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ORDER MODAL */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              <span>➕ Abrir Novo Pedido</span>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </h3>

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Selecione a Mesa *</label>
                <select
                  className="form-control"
                  value={newMesaId}
                  onChange={(e) => setNewMesaId(Number(e.target.value))}
                  required
                >
                  {db.mesas.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mesa {m.numero} — {m.localizacao} ({m.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cliente (Opcional)</label>
                <select
                  className="form-control"
                  value={newClienteId}
                  onChange={(e) => setNewClienteId(e.target.value)}
                >
                  <option value="">Nenhum (Cliente Avulso/Balcão)</option>
                  {db.clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.telefone ? `(${c.telefone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Observação / Nota</label>
                <textarea
                  className="form-control"
                  placeholder="Ex: Mesa na sombra, sem cebola nos lanches..."
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {activePedido && !showPaymentModal && (
        <div className="modal-overlay" onClick={() => setActivePedido(null)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <h3>
              <span>🧾 Pedido #{activePedido.id}</span>
              <button
                onClick={() => setActivePedido(null)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.86rem',
              }}
            >
              <div>
                <strong>Mesa:</strong> {getTable(activePedido.mesa_id)?.numero || activePedido.mesa_id} (
                {getTable(activePedido.mesa_id)?.localizacao})
                <br />
                <strong>Cliente:</strong> {getClient(activePedido.cliente_id)?.nome || 'Avulso'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Status:</strong>{' '}
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                  {activePedido.status}
                </span>
                <br />
                <span style={{ color: '#888', fontSize: '0.78rem' }}>{formatarDataHora(activePedido.criado_em)}</span>
              </div>
            </div>

            {/* Change Status Buttons */}
            {activePedido.status !== 'finalizado' && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.76rem', color: '#888', fontWeight: 600, marginBottom: '6px' }}>
                  ALTERAR STATUS DO PEDIDO:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(['aberto', 'preparando', 'pronto', 'entregue', 'cancelado'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(st)}
                      className={`btn btn-sm ${activePedido.status === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Item form */}
            {activePedido.status !== 'finalizado' && activePedido.status !== 'cancelado' && (
              <form
                onSubmit={handleAddItem}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--card-border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.74rem', color: '#888', display: 'block', marginBottom: '4px' }}>
                    ADICIONAR PRODUTO
                  </label>
                  <select
                    className="form-control"
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(Number(e.target.value))}
                    style={{ padding: '8px 12px' }}
                  >
                    {db.produtos
                      .filter((p) => p.ativo)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} — {formatarMoeda(p.preco)}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={{ width: '80px' }}>
                  <label style={{ fontSize: '0.74rem', color: '#888', display: 'block', marginBottom: '4px' }}>
                    QTD
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={itemQtd}
                    onChange={(e) => setItemQtd(Number(e.target.value))}
                    style={{ padding: '8px 12px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  ➕ Adicionar
                </button>
              </form>
            )}

            {/* Items Table */}
            <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qtd</th>
                    <th style={{ textAlign: 'right' }}>Preço Unit.</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    {activePedido.status !== 'finalizado' && <th style={{ textAlign: 'center' }}>Remover</th>}
                  </tr>
                </thead>
                <tbody>
                  {activePedido.itens.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Nenhum item adicionado ainda.
                      </td>
                    </tr>
                  ) : (
                    activePedido.itens.map((item) => (
                      <tr key={item.produto_id}>
                        <td style={{ fontWeight: 600 }}>{item.nome}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                        <td style={{ textAlign: 'right', color: '#aaa' }}>{formatarMoeda(item.preco_unit)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#e8a87c' }}>
                          {formatarMoeda(item.subtotal)}
                        </td>
                        {activePedido.status !== 'finalizado' && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.produto_id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '3px 8px' }}
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--card-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>Total a pagar:</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8a87c' }}>
                  {formatarMoeda(activePedido.total)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setActivePedido(null)} className="btn btn-secondary">
                  Fechar
                </button>
                {activePedido.status !== 'finalizado' && activePedido.status !== 'cancelado' && (
                  <button
                    onClick={() => {
                      setShowPaymentModal(true);
                      setValorPago(activePedido.total);
                    }}
                    className="btn btn-success"
                  >
                    💳 Realizar Pagamento
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && activePedido && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              <span>💳 Fechamento & Pagamento</span>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </h3>

            <div
              style={{
                background: 'rgba(232,168,124,0.1)',
                border: '1px solid rgba(232,168,124,0.3)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#888' }}>VALOR TOTAL DO PEDIDO #{activePedido.id}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e8a87c', margin: '6px 0' }}>
                {formatarMoeda(activePedido.total)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                {getTable(activePedido.mesa_id)?.numero ? `Mesa ${getTable(activePedido.mesa_id)?.numero}` : ''} •{' '}
                {getClient(activePedido.cliente_id)?.nome || 'Cliente Balcão'}
              </div>
            </div>

            <form onSubmit={handleFinalizePayment}>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {(['cartao', 'pix', 'dinheiro'] as const).map((forma) => (
                    <button
                      key={forma}
                      type="button"
                      onClick={() => setFormaPagamento(forma)}
                      className={`btn ${formaPagamento === forma ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.8rem' }}
                    >
                      {forma === 'cartao' && '💳 Cartão'}
                      {forma === 'pix' && '⚡ PIX'}
                      {forma === 'dinheiro' && '💵 Dinheiro'}
                    </button>
                  ))}
                </div>
              </div>

              {formaPagamento === 'dinheiro' && (
                <div className="form-group">
                  <label>Valor Entregue pelo Cliente (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={activePedido.total}
                    className="form-control"
                    value={valorPago}
                    onChange={(e) => setValorPago(Number(e.target.value))}
                  />
                  {valorPago > activePedido.total && (
                    <div style={{ marginTop: '8px', color: '#5cb85c', fontWeight: 700, fontSize: '0.9rem' }}>
                      Troco: {formatarMoeda(valorPago - activePedido.total)}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success" style={{ padding: '10px 20px' }}>
                  ✅ Confirmar Pagamento & Liberar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
