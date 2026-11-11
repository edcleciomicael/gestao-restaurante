# Restaurante Manager Pro

Sistema completo de gestão de restaurante para controle de pedidos, mesas, cardápio, clientes e financeiro.
Migrado para React + TypeScript (Vite) para o ambiente AI Studio.

## 🚀 Funcionalidades Portadas

1. **Dashboard Executivo**:
   - Total de Vendas acumulado
   - Total de Pedidos Hoje e em aberto
   - Ocupação de Mesas em tempo real
   - Gráfico de Vendas por Mês (renderização com gradiente)
   - Status visual de todas as mesas
   - Tabela dos últimos pedidos realizados

2. **Gestão de Pedidos**:
   - Abertura de novos pedidos com vínculo a mesas e clientes
   - Ciclo de vida completo: Aberto, Preparando, Pronto, Entregue, Fechado, Cancelado, Finalizado
   - Adição e remoção de itens com recálculo automático de subtotais e totais
   - Modal de cobrança e pagamento (Cartão, PIX, Dinheiro com cálculo de troco)
   - Baixa automática no status da mesa após liquidação

3. **Gestão de Mesas**:
   - Cadastro e edição de mesas (número, capacidade, localização: Salão Principal, Varanda, Terraço, etc.)
   - Controle de status (Livre, Ocupada, Reservada) com ações rápidas
   - Grid interativo com identificação de capacidade e localização

4. **Cardápio & Estoque de Produtos**:
   - Catálogo de produtos com preço de venda, estoque e categoria
   - Filtro por categoria (Entradas, Pratos Principais, Bebidas, Sobremesas) e busca por texto
   - Cadastro, edição, controle de estoque e ativação/desativação

5. **Categorias**:
   - Cadastro e gerenciamento de categorias do cardápio com contagem de produtos

6. **Clientes**:
   - Cadastro e edição de clientes (nome, telefone/WhatsApp, e-mail, CPF, endereço)
   - Busca rápida por qualquer campo

7. **Financeiro**:
   - Resumo de Entradas, Saídas e Saldo Atual
   - Registro de entradas automáticas via pagamentos de pedidos
   - Registro de novas movimentações avulsas (entradas e saídas)
   - Histórico financeiro completo

8. **Autenticação & Sessão**:
   - Acesso seguro com perfil Administrador (`admin@restaurante.com` / `admin123`) ou Garçom (`garcom@restaurante.com` / `garcom123`)
   - Alternância rápida e persistência de sessão

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Estilização**: Tema escuro original fiel (`--bg: #0f0f13`, `--accent: #e8a87c`)
- **Persistência**: LocalStorage com seed de dados completo
- **Porta**: 3000 (`0.0.0.0`)
