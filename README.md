# Inventory Management — Backend

API REST para gerenciamento de estoque, produtos, despesas e usuários. Construída com NestJS, Prisma e PostgreSQL.

> Este repositório contém apenas o **backend** da aplicação. O frontend está disponível em [inventory.management.ui](https://github.com/Gabriel-Leao/inventory.management.ui).

---

## Tecnologias

- **NestJS 11**
- **TypeScript**
- **Prisma 7** com adapter PostgreSQL (`@prisma/adapter-pg`)
- **PostgreSQL**
- **nestjs-pino** para logging estruturado
- **class-validator** + **class-transformer** para validação de DTOs
- **Helmet** para headers de segurança
- **Prettier** + **ESLint** para padronização de código

---

## Pré-requisitos

- Node.js 18+
- npm ou equivalente
- PostgreSQL em execução

---

## Instalação

```bash
git clone https://github.com/Gabriel-Leao/inventory.management.api
cd inventory.management.api
npm install
```

O `postinstall` roda `prisma generate` automaticamente após a instalação.

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/inventory_management?schema=public"
```

---

## Banco de dados

Rode as migrations para criar as tabelas:

```bash
npx prisma migrate deploy
```

Para popular o banco com dados de seed:

```bash
npm run "db seed"
```

O seed carrega dados dos arquivos JSON em `prisma/seedData/` na seguinte ordem: produtos → resumo de despesas → vendas → resumo de vendas → compras → resumo de compras → usuários → despesas → despesas por categoria.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo watch |
| `npm run build` | Gera o build de produção |
| `npm run prod` | Inicia o servidor de produção a partir do build |
| `npm run debug` | Inicia em modo debug com watch |
| `npm test` | Executa os testes unitários |
| `npm run test:watch` | Executa os testes em modo watch |
| `npm run test:cov` | Executa os testes e gera relatório de cobertura |
| `npm run lint` | Executa o ESLint com auto-fix |
| `npm run format` | Formata o código com Prettier |

O servidor sobe na porta `3333` por padrão (configurável via variável de ambiente `PORT`).

---

## Estrutura do projeto

```
src/
├── main.ts                     # Bootstrap da aplicação (CORS, Helmet, pipes globais)
├── app.module.ts               # Módulo raiz
│
├── common/
│   └── prisma/
│       ├── prisma.module.ts    # Módulo global do Prisma
│       └── prisma.service.ts   # Serviço de conexão com o banco
│
└── modules/
    ├── dashboard/              # Métricas consolidadas do dashboard
    ├── product/                # CRUD de produtos
    │   └── dto/                # DTOs com validação via class-validator
    ├── expense/                # Despesas por categoria
    └── user/                   # Listagem de usuários

prisma/
├── schema.prisma               # Modelos e datasource
├── prisma.config.ts            # Configuração de migrations e seed
├── seed.ts                     # Script de seed
└── seedData/                   # Dados iniciais em JSON por entidade
```

---

## Endpoints

### Dashboard

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/dashboard` | Retorna métricas consolidadas: produtos, resumo de vendas, compras, despesas e despesas por categoria |

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/products` | Lista todos os produtos. Aceita `?name=` para filtro por nome exato |
| `POST` | `/products` | Cria um novo produto |

**Body — POST `/products`:**

```json
{
  "name": "string (3–120 caracteres)",
  "price": "number (≥ 0, até 2 casas decimais)",
  "rating": "number (1–5, até 2 casas decimais, opcional)",
  "stockQuantity": "integer (≥ 0)"
}
```

### Despesas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/expenses` | Lista despesas agrupadas por categoria, ordenadas por data decrescente |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users` | Lista todos os usuários |

---

## Schema do banco

| Tabela | Descrição |
|---|---|
| `users` | Usuários da aplicação |
| `products` | Produtos do estoque |
| `sales` | Registros individuais de vendas |
| `purchases` | Registros individuais de compras |
| `expenses` | Despesas individuais |
| `sales_summary` | Resumo agregado de vendas por período |
| `purchase_summary` | Resumo agregado de compras por período |
| `expense_summary` | Resumo agregado de despesas por período |
| `expense_by_category` | Despesas agrupadas por categoria |

---

## Arquitetura

A aplicação segue a arquitetura modular do NestJS. Cada domínio (dashboard, product, expense, user) é isolado em seu próprio módulo com controller, service e, quando aplicável, DTOs. O `PrismaModule` é global e injetado em todos os serviços. O logging é feito via `nestjs-pino` com formatação colorida em desenvolvimento.
