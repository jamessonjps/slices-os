# SliceOS

Sistema web para operação de pizzaria, com área pública de pedidos online e painel administrativo para pedidos, cozinha, clientes, estoque, cardápio, usuários e relatórios.

## Visão Geral

O SliceOS é uma aplicação fullstack moderna construída com React + Vite no frontend e **Supabase** no backend. O objetivo do sistema é centralizar o fluxo operacional de uma pizzaria: o cliente acessa o cardápio, monta o pedido e acompanha o status; a equipe administrativa gerencia pedidos, cozinha, clientes, estoque, configurações e indicadores.

A aplicação está totalmente integrada com um banco de dados real em produção (PostgreSQL via Supabase), possuindo sistema de Autenticação (Auth) e políticas rígidas de segurança (Row Level Security - RLS).

## Tecnologias Utilizadas

- **Frontend:** React 18, Vite 6, React Router DOM, TanStack React Query v5
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **UI/Estilização:** Tailwind CSS, Radix UI, Lucide React, Framer Motion
- **Validação e Formulários:** React Hook Form, Zod
- **Utilitários:** date-fns, sonner (notificações)

## Estrutura do Projeto

```text
src/
  components/     Componentes compartilhados e componentes de UI (shadcn)
  hooks/          Hooks utilitários
  lib/            Providers, contexto de autenticação e configuração do Supabase
  pages/          Telas públicas e administrativas
  services/       Serviços de integração com o Supabase (pedidos, clientes, etc.)
  utils/          Utilitários de URL, storage e cálculos de horário
```

## Funcionalidades

**Área do Cliente:**
- Página inicial pública com status de loja (Aberto/Fechado) sincronizado em tempo real
- Cardápio online dinâmico
- Carrinho e checkout inteligente (validação de endereço para Entrega vs. Retirada)
- Criação de pedidos com integração automática via WhatsApp
- Rastreamento de pedido pelo cliente
- Solicitação de exclusão de conta (Conformidade LGPD)

**Painel Administrativo:**
- Gestão de pedidos e painel de status
- Tela de cozinha otimizada para tablets (com sons de notificação e fluxo dinâmico para retirada/entrega)
- Cadastro e consulta de clientes (CRM populado automaticamente a cada pedido)
- Gestão de cardápio e produtos
- Controle de configurações (Horários de funcionamento, WhatsApp, Taxa de Entrega)
- Gestão de usuários (Admins/Funcionários)

## Instalação e Execução

### Pré-requisitos
Certifique-se de configurar o arquivo `.env.local` na raiz do projeto com as credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_STORE_ID=id_da_sua_loja
```

### Execução Local
```bash
npm install
npm run dev
```

Por padrão, o Vite inicia em `http://localhost:5173`.

### Build de Produção
```bash
npm run build
```
O build gera os arquivos otimizados na pasta `dist/`.

## Estrutura de Rotas

As rotas são protegidas e registradas em `src/pages.config.js`.

- `/` e `/Home` - Página inicial
- `/Menu` - Cardápio público
- `/Checkout` - Finalização de pedido
- `/TrackOrder` - Acompanhamento de pedido
- `/DeleteAccount` - Solicitação de exclusão de dados
- `/Login` - Autenticação da equipe
- `/AdminHome` - Painel administrativo (Requer login)
- `/Orders`, `/Kitchen`, `/Customers`, `/MenuManagement`, `/Settings`, `/UserManagement` - Módulos administrativos

## Estado Atual do Projeto

O projeto encontra-se em um estado **Production-Ready**. Toda a dívida técnica da migração de sistemas legados foi resolvida. O Supabase cuida da persistência, e a aplicação frontend reage de maneira otimista e segura.

Políticas de segurança do Supabase (RLS) garantem que apenas administradores autenticados possam modificar configurações, enquanto o público pode criar pedidos e atualizar seu próprio cadastro.

## Licença

Projeto privado. Defina uma licença formal antes de publicar ou distribuir este repositório.
