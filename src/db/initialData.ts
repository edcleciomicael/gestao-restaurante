import { Usuario, Categoria, Produto, Mesa, Cliente, Pedido, Pagamento, MovimentacaoFinanceira } from '../types';

export interface AppDatabase {
  usuarios: Usuario[];
  categorias: Categoria[];
  produtos: Produto[];
  mesas: Mesa[];
  clientes: Cliente[];
  pedidos: Pedido[];
  pagamentos: Pagamento[];
  financeiro: MovimentacaoFinanceira[];
  next_ids: {
    usuarios: number;
    categorias: number;
    produtos: number;
    mesas: number;
    clientes: number;
    pedidos: number;
    pagamentos: number;
    financeiro: number;
  };
}

export const initialData: AppDatabase = {
  usuarios: [
    {
      id: 1,
      nome: "Administrador",
      email: "admin@restaurante.com",
      senha: "admin123",
      perfil: "admin",
      ativo: true
    },
    {
      id: 2,
      nome: "Garçom Carlos",
      email: "garcom@restaurante.com",
      senha: "garcom123",
      perfil: "garcom",
      ativo: true
    }
  ],
  categorias: [
    {
      id: 1,
      nome: "Entradas",
      descricao: "Pratos de entrada",
      ativo: true
    },
    {
      id: 2,
      nome: "Pratos Principais",
      descricao: "Pratos principais do cardapio",
      ativo: true
    },
    {
      id: 3,
      nome: "Bebidas",
      descricao: "Bebidas em geral",
      ativo: true
    },
    {
      id: 4,
      nome: "Sobremesas",
      descricao: "Doces e sobremesas",
      ativo: true
    }
  ],
  produtos: [
    {
      id: 1,
      nome: "Bruschetta",
      descricao: "Pao italiano com tomate e manjericao",
      preco: 18.9,
      categoria_id: 1,
      estoque: 50,
      ativo: true
    },
    {
      id: 2,
      nome: "Frango Grelhado",
      descricao: "Frango grelhado com legumes",
      preco: 42.9,
      categoria_id: 2,
      estoque: 30,
      ativo: true
    },
    {
      id: 3,
      nome: "Picanha na Brasa",
      descricao: "Picanha grelhada com arroz e feijao",
      preco: 89.9,
      categoria_id: 2,
      estoque: 20,
      ativo: true
    },
    {
      id: 4,
      nome: "Suco de Laranja",
      descricao: "Suco natural 500ml",
      preco: 12.0,
      categoria_id: 3,
      estoque: 100,
      ativo: true
    },
    {
      id: 5,
      nome: "Coca-Cola 350ml",
      descricao: "Refrigerante gelado",
      preco: 7.0,
      categoria_id: 3,
      estoque: 200,
      ativo: true
    },
    {
      id: 6,
      nome: "Pudim de Leite",
      descricao: "Pudim cremoso com calda de caramelo",
      preco: 16.0,
      categoria_id: 4,
      estoque: 25,
      ativo: true
    }
  ],
  mesas: [
    {
      id: 1,
      numero: 1,
      capacidade: 4,
      status: "livre",
      localizacao: "Salao Principal"
    },
    {
      id: 2,
      numero: 2,
      capacidade: 2,
      status: "ocupada",
      localizacao: "Salao Principal"
    },
    {
      id: 3,
      numero: 3,
      capacidade: 6,
      status: "livre",
      localizacao: "Salao Principal"
    },
    {
      id: 4,
      numero: 4,
      capacidade: 4,
      status: "reservada",
      localizacao: "Varanda"
    },
    {
      id: 5,
      numero: 5,
      capacidade: 8,
      status: "livre",
      localizacao: "Varanda"
    },
    {
      id: 6,
      numero: 6,
      capacidade: 4,
      status: "livre",
      localizacao: "Terraco"
    }
  ],
  clientes: [
    {
      id: 1,
      nome: "João Silva",
      email: "joao@email.com",
      telefone: "(11) 99999-1111",
      cpf: "123.456.789-00",
      endereco: "Rua A, 100",
      criado_em: "2024-01-10"
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@email.com",
      telefone: "(11) 99999-2222",
      cpf: "987.654.321-00",
      endereco: "Rua B, 200",
      criado_em: "2024-01-15"
    }
  ],
  pedidos: [
    {
      id: 1,
      mesa_id: 1,
      cliente_id: 1,
      status: "finalizado",
      total: 150.7,
      observacao: "",
      criado_em: "2024-06-01 12:30:00",
      fechado_em: "2024-06-01 13:45:00",
      itens: [
        {
          produto_id: 2,
          nome: "Frango Grelhado",
          quantidade: 2,
          preco_unit: 42.9,
          subtotal: 85.8
        },
        {
          produto_id: 4,
          nome: "Suco de Laranja",
          quantidade: 2,
          preco_unit: 12.0,
          subtotal: 24.0
        },
        {
          produto_id: 1,
          nome: "Bruschetta",
          quantidade: 2,
          preco_unit: 18.9,
          subtotal: 37.8
        },
        {
          produto_id: 6,
          nome: "Pudim de Leite",
          quantidade: 2,
          preco_unit: 16.0,
          subtotal: 32.0
        }
      ]
    },
    {
      id: 2,
      mesa_id: 2,
      cliente_id: 2,
      status: "aberto",
      total: 89.9,
      observacao: "Esses são vips",
      criado_em: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fechado_em: null,
      itens: [
        {
          produto_id: 3,
          nome: "Picanha na Brasa",
          quantidade: 1,
          preco_unit: 89.9,
          subtotal: 89.9
        }
      ]
    }
  ],
  pagamentos: [
    {
      id: 1,
      pedido_id: 1,
      forma: "cartao",
      valor: 150.7,
      troco: 0,
      criado_em: "2024-06-01 13:45:00"
    }
  ],
  financeiro: [
    {
      id: 1,
      pedido_id: 1,
      tipo: "entrada",
      descricao: "Pagamento Pedido #1 (Cartão)",
      valor: 150.7,
      criado_em: "2024-06-01 13:45:00"
    },
    {
      id: 2,
      pedido_id: null,
      tipo: "saida",
      descricao: "Compra de Hortifruti e Bebidas",
      valor: 65.0,
      criado_em: "2024-06-02 09:15:00"
    }
  ],
  next_ids: {
    usuarios: 3,
    categorias: 5,
    produtos: 7,
    mesas: 7,
    clientes: 3,
    pedidos: 3,
    pagamentos: 2,
    financeiro: 3
  }
};
