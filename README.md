# 🍕 SliceOS - Sistema de Gestão para Pizzarias SaaS

SliceOS é uma plataforma moderna e robusta para gestão de pizzarias e delivery, construída com foco em performance, experiência do usuário premium e escalabilidade via Supabase.

## 🚀 Funcionalidades Principais

### 🛒 Área do Cliente
- **Cardápio Interativo**: Seleção dinâmica de sabores (meio-a-meio), tamanhos e opcionais.
- **Checkout Inteligente**: Validação de endereço em tempo real e cálculo automático de taxas.
- **Acompanhamento de Pedido**: Rastreamento em tempo real do status da produção até a entrega.
- **LGPD Ready**: Área dedicada para exclusão de dados pessoais conforme a legislação.

### 👨‍🍳 Operacional e Cozinha
- **Painel de Produção (KDS)**: Gestão de pedidos em tempo real com notificações sonoras e visuais.
- **Impressão de Comanda**: Sistema de impressão térmica (80mm) automática ao aceitar pedidos e manual via botão dedicado.
- **Controle de Status**: Fluxo simplificado de produção: Pendente → Preparando → Pronto → Saiu para Entrega → Entregue.

### 📱 PWA (Progressive Web App)
- **Instalável**: O sistema pode ser instalado como um App nativo no Android, iOS e Desktop.
- **Modo Offline**: Carregamento instantâneo e suporte básico para operação em redes instáveis.
- **Standalone**: Interface limpa sem barras de navegação para maior imersão.

### 🛵 Módulo do Entregador
- **Dashboard Mobile-First**: Interface otimizada para smartphones.
- **Gestão de Corridas**: Aceitação de pedidos prontos e confirmação de entrega com segurança.
- **WhatsApp Direto**: Links integrados para contato rápido com o cliente ou com a loja.

### 🛠️ Administração (Backoffice)
- **Gestão de Cardápio**: Controle total sobre produtos, preços e categorias dinâmicas.
- **Configurações da Loja**: Personalização de horários de funcionamento, taxas de entrega e dados de contato.
- **Relatórios Financeiros**: Visão geral de vendas e desempenho por período.
- **Gestão de Usuários**: Controle de acesso baseado em cargos (Admin vs. Entregador).

## 💻 Tech Stack

- **Frontend**: [React 18](https://reactjs.org/), [Vite 6](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Estado e Cache**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Validação**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18+)
- Conta no Supabase

### Passo a Passo
1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/jamessonjps/slices-os.git
   cd slices-os
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz com:
   ```env
   VITE_SUPABASE_URL=sua-url-do-supabase
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
   VITE_STORE_ID=id-da-sua-loja-uuid
   ```

4. **Rodar o projeto**:
   ```bash
   npm run dev
   ```

## 📄 Documentação Adicional
- [Relatório Técnico](RELATORIO_TECNICO.md): Detalhes de arquitetura e decisões de design.
- [Relatório de Dados](RELATORIO_UNIFICACAO_DADOS.md): Detalhes sobre o esquema do banco de dados e integração Supabase.

---
Desenvolvido com ❤️ por James e Antigravity.