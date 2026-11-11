export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  perfil: 'admin' | 'garcom';
  ativo: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria_id: number;
  estoque: number;
  imagem?: string;
  ativo: boolean;
}

export type MesaStatus = 'livre' | 'ocupada' | 'reservada';

export interface Mesa {
  id: number;
  numero: number | string;
  capacidade: number;
  status: MesaStatus;
  localizacao: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  criado_em: string;
}

export interface ItemPedido {
  produto_id: number;
  nome: string;
  quantidade: number;
  preco_unit: number;
  subtotal: number;
}

export type PedidoStatus = 'aberto' | 'preparando' | 'pronto' | 'entregue' | 'fechado' | 'cancelado' | 'finalizado';

export interface Pedido {
  id: number;
  mesa_id: number;
  cliente_id?: number | null;
  status: PedidoStatus;
  total: number;
  observacao: string;
  criado_em: string;
  fechado_em?: string | null;
  itens: ItemPedido[];
}

export interface Pagamento {
  id: number;
  pedido_id: number;
  forma: 'cartao' | 'dinheiro' | 'pix';
  valor: number;
  troco: number;
  criado_em: string;
}

export interface MovimentacaoFinanceira {
  id: number;
  pedido_id?: number | null;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  criado_em: string;
}
