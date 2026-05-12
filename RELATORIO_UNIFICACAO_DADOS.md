# Relatorio de Unificacao da Camada de Dados

Data: 2026-05-12

## O Que Foi Unificado

A aplicacao agora possui uma fonte unica de dados local temporaria em `src/data/database.js`.

O fluxo arquitetural efetivo passou a ser:

```text
pages
  -> services
    -> src/data/database.js
```

O `base44Client` deixou de retornar stubs genericos vazios e passou a atuar como adaptador de compatibilidade para os services locais. Isso permite estabilizar as paginas ainda nao refatoradas sem manter quatro fontes ativas de dados.

## Dados Centralizados

`src/data/database.js` centraliza:

- `orders`
- `customers`
- `addresses`
- `menuItems`
- `products`
- `settings`
- `staffProfiles`
- `users`
- `currentUser`

Tambem foram adicionados utilitarios locais para:

- criacao de IDs reais em memoria
- ordenacao por campo
- filtro por objeto
- remocao por ID

## Services Refatorados

Services que agora usam diretamente o database local:

- `authService`
- `orderService`
- `customerService`
- `menuService`
- `settingsService`
- `reportService`
- `stockService`
- `staffService`

Novos services adicionados:

- `src/services/stockService.js`
- `src/services/staffService.js`

## Chamadas Base44 Eliminadas Operacionalmente

As chamadas ainda existentes nas paginas para `base44.entities.*` nao dependem mais de stubs vazios. Elas agora sao redirecionadas internamente:

- `base44.entities.Order.*` -> `orderService`
- `base44.entities.MenuItem.*` -> `menuService`
- `base44.entities.Product.*` -> `stockService`
- `base44.entities.Customer.*` -> `customerService`
- `base44.entities.Address.*` -> `customerService`
- `base44.entities.Settings.*` -> `settingsService`
- `base44.entities.StaffProfile.*` -> `staffService`
- `base44.entities.User.*` -> `staffService`

O adaptador agora falha explicitamente se uma entidade nao implementada for chamada. Isso evita listas vazias silenciosas mascarando erros.

## Fluxos Agora Funcionais

Fluxo de pedidos:

- `Menu` lista itens reais do database.
- `Checkout` cria pedido com ID real.
- Pedido criado entra em `database.orders`.
- `Orders` lista o mesmo pedido.
- `Kitchen` lista o mesmo pedido como ativo.
- `TrackOrder` encontra o pedido por ID.
- `OrderDetail` encontra e atualiza o pedido.
- `Reports` passa a considerar pedidos do periodo, exceto cancelados.

Fluxo de cardapio:

- `MenuManagement` cria, edita, ativa/desativa e remove itens.
- `Menu` passa a refletir os itens do mesmo database local.
- O formulario foi ajustado para nao depender de `FormData` em selects Radix.

Fluxo de estoque:

- `Stock` lista produtos reais do database.
- Cria, edita e remove produtos em memoria.
- Categoria e unidade foram ajustadas para usar estado controlado em vez de `FormData` de select Radix.

Fluxo de clientes:

- `Customers` lista clientes do database.
- Novos pedidos atualizam ou criam cliente automaticamente por telefone.
- Enderecos de pedidos delivery sao associados ao cliente em memoria.
- Historico e metricas passam a usar a mesma lista de pedidos.

Fluxo de configuracoes:

- `Settings` salva no database local.
- `Home`, `Checkout` e `Kitchen` leem a mesma fonte por meio do adaptador/services.

Auth:

- Fake auth foi mantido.
- Usuario atual agora vive no database local.
- Roles foram normalizadas (`admin` e `user`).
- O roteamento global bloqueia paginas administrativas quando o usuario atual nao possui role `admin`.

## Paginas Estabilizadas

- `/`
- `/Home`
- `/Menu`
- `/Checkout`
- `/Orders`
- `/Kitchen`
- `/TrackOrder`
- `/OrderDetail`
- `/Reports`
- `/Customers`
- `/Stock`
- `/Settings`
- `/MenuManagement`
- `/UserManagement`
- `/AdminHome`

## Riscos Restantes

- A persistencia ainda e somente em memoria; recarregar o processo restaura os mocks iniciais.
- Ainda existem imports de `base44Client` em paginas, embora operacionalmente redirecionados para services.
- A autenticacao ainda e fake e nao deve ser usada em producao.
- React Query pode manter cache ate a proxima invalidação/refetch em alguns fluxos.
- O CSS/Tailwind ainda merece revisao separada, pois o foco desta etapa foi camada de dados.
- Textos com encoding quebrado continuam existindo em varias telas.
- O backend real ainda nao existe.

## Validacao

Executado:

```bash
npm.cmd run build
npm.cmd run dev -- --host 127.0.0.1
```

Resultado:

- Build Vite concluido com sucesso.
- Vite iniciou localmente.
- Rotas testadas por HTTP com status 200:
  - `/`
  - `/Menu`
  - `/AdminHome`

Observacao: ja havia uma instancia Vite em `127.0.0.1:5173`; a validacao desta etapa subiu em `127.0.0.1:5174` e foi encerrada apos os testes.

## Proxima Etapa Recomendada

Remover gradualmente os imports de `base44Client` das paginas e trocar por chamadas diretas aos services. Depois disso, o adaptador Base44 pode ser removido ou mantido apenas como compatibilidade temporaria isolada.

Na etapa seguinte, a prioridade tecnica deve ser:

1. Trocar chamadas `base44.entities.*` remanescentes nas paginas por services.
2. Padronizar invalidacoes do React Query por fluxo.
3. Corrigir encoding dos textos.
4. Revisar CSS/Tailwind ativo.
5. Substituir o database em memoria por backend/API persistente.
