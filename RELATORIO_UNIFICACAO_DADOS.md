# Relatório de Unificação e Persistência de Dados (Supabase)

Data da última atualização: 2026-05-14

## O Que Foi Unificado
A aplicação agora possui uma fonte de verdade única e persistente: **Supabase (PostgreSQL)**. O antigo banco de dados em memória (`src/data/database.js`) foi desativado em favor de uma integração direta via serviços assíncronos.

O fluxo arquitetural agora é:
```text
React Components
  -> React Query (Cache Layer)
    -> Services (Abstraction Layer)
      -> Supabase API (Real Persistence)
```

## Dados Centralizados e Persistentes
O Supabase centraliza as seguintes entidades, agora com IDs UUID e relacionamentos reais:

- **`orders`**: Pedidos persistentes com esquema unificado.
- **`menu_items`**: Cardápio editável via painel administrativo.
- **`settings`**: Configurações da loja (nome, WhatsApp, taxas, horários).
- **`customers`**: Perfis de clientes criados/atualizados automaticamente no checkout.
- **`staff_profiles`**: Controle de acesso administrativo.

## Unificação do Esquema de Itens (JSONB)
Uma das maiores evoluções desta etapa foi a unificação do campo `items` na tabela `orders` utilizando o tipo **JSONB**. Isso resolveu a inconsistência entre diferentes tipos de produtos:

- **Pizzas**: Suporta sabores simples, meio-a-meio, bordas recheadas e tamanhos variados.
- **Bebidas e Outros**: Itens simples com quantidade e preço.
- **Vantagem**: O frontend agora consome um objeto JSON estruturado, facilitando a renderização na Cozinha e no Checkout sem necessidade de múltiplas consultas ou joins complexos.

## Camada de Serviços (Services)
Todos os serviços foram refatorados para utilizar o cliente `@supabase/supabase-js`:

- **`orderService.js`**: CRUD completo de pedidos com estados (`pending`, `preparing`, `ready`, etc.).
- **`menuService.js`**: Gestão de produtos e categorias.
- **`settingsService.js`**: Configurações globais da loja.
- **`authService.js`**: Integrado ao Supabase Auth para login e gestão de usuários reais.

## Resiliência de Dados
- **Exponential Backoff**: Implementado em `src/utils/fetchWithBackoff.js` para garantir que falhas temporárias na API não quebrem o fluxo do usuário.
- **Zod Schemas**: Todos os dados que entram no sistema são validados via schemas Zod, garantindo que o banco de dados permaneça íntegro e sem "lixo" eletrônico.

## Conclusão da Migração
A dependência do framework legado `Base44` foi **100% eliminada**. Não existem mais stubs ou mocks mascarando o comportamento do sistema. O SliceOS agora opera com dados reais, persistentes e escaláveis.
