# Relatorio Tecnico do Projeto SliceOS

Data da auditoria: 2026-05-12

## Status Geral do Projeto

Estabilidade estimada: 65%.

O frontend React/Vite esta funcional em nivel de compilacao e inicializacao. O build de producao executa sem erro critico, o Vite inicia localmente e a aplicacao nao depende obrigatoriamente do Base44 online para carregar. A maturidade atual e de prototipo operacional migrado: suficiente para validar telas e fluxos principais, mas ainda sem seguranca, persistencia e integracao real de backend.

Estado do frontend: funcional, com rotas registradas, providers globais ativos e UI ampla para cliente e administracao. Ha problemas de encoding em diversos textos, uso incompleto de Tailwind no CSS ativo e divergencias entre dados esperados pelas telas e os mocks disponiveis.

Estado do backend/mock: nao ha backend real integrado. Existem mocks em `src/mocks`, servicos locais em `src/services` e um stub em `src/api/base44Client.js`. Dados criados em alguns fluxos ficam apenas em memoria e podem divergir entre servicos e stubs.

Risco atual do projeto: medio-alto para producao. O risco principal nao e compilacao, mas ausencia de autenticacao real, ausencia de persistencia, autorizacao permissiva, stubs que mascaram falhas e partes do dominio ainda acopladas ao contrato Base44.

## Arquitetura Atual

Stack principal:

- React 18
- Vite 6
- React Router DOM
- TanStack React Query
- Tailwind/Radix UI
- Lucide React
- Sonner
- date-fns
- Recharts
- Framer Motion

Organizacao:

- `src/main.jsx`: inicializa React, importa `App` e aplica dark mode por preferencia do sistema.
- `src/App.jsx`: monta `AuthProvider`, `QueryClientProvider`, `BrowserRouter`, `NavigationTracker`, rotas e toasters.
- `src/pages.config.js`: registra rotas a partir das paginas importadas.
- `src/lib`: contexto de auth, query client, tracking e 404.
- `src/api`: stub Base44, cliente HTTP generico e endpoints futuros.
- `src/services`: camada local para auth, pedidos, clientes, cardapio, configuracoes e relatorios.
- `src/mocks`: massa fake para auth, pedidos, produtos, clientes, enderecos, relatorios e settings.
- `entities`: schemas legados exportados do Base44.
- `src/components/ui`: biblioteca de componentes Radix/shadcn-like.

Providers globais:

- `AuthProvider`: carrega usuario fake via `authService`, settings via `settingsService` e expoe estado global de autenticacao.
- `QueryClientProvider`: usa `queryClientInstance` com `refetchOnWindowFocus: false` e `retry: 1`.
- `BrowserRouter`: envolve rotas.
- `Toaster` e `SonnerToaster`: notificacoes globais.
- `NavigationTracker`: tenta registrar navegacao por pagina no stub `base44.appLogs`.

Roteamento:

- `/` renderiza a pagina configurada como `mainPage`, hoje `Home`.
- Cada chave de `PAGES` vira uma rota `/${NomeDaPagina}`.
- Rota `*` cai em `PageNotFound`.
- `createPageUrl` retorna `/${pageName}` com espacos convertidos para `-`.

Autenticacao:

- `authService` mantem `currentUser` em memoria inicializado como admin fake.
- `AuthContext` considera o usuario fake autenticado.
- `AuthGate` protege apenas paginas que o utilizam explicitamente; hoje a protecao efetiva e limitada.
- `ProtectedRoute` existe, mas nao e usado no roteamento atual.
- Nao ha login real, sessao, token, refresh, RBAC real ou logout persistente.

Mocks e Base44:

- `src/api/base44Client.js` substitui o SDK por um proxy generico.
- Qualquer entidade chamada via `base44.entities.Nome` recebe metodos `list`, `filter`, `create`, `update`, `delete`, `get`, `subscribe`.
- Esses metodos retornam arrays vazios ou objetos vazios; nao persistem dados.
- Alguns servicos (`orderService`, `customerService`, `settingsService`) usam mocks reais em memoria e sao mais funcionais.

Armazenamento local:

- `src/utils/storage.js` implementa `safeLocalStorage` e `safeJsonParse`.
- `Menu` salva `cart` no localStorage.
- `Checkout` le e remove `cart`.
- `MyOrders` salva `customer_phone`.
- `src/lib/app-params.js` ainda manipula chaves `base44_*`, mas nao esta central no fluxo atual.

## O Que Ja Foi Corrigido

- Plugin `@base44/vite-plugin` comentado em `vite.config.js`.
- Alias Vite `@` configurado para `./src`.
- Alias equivalente configurado em `jsconfig.json`.
- `AuthContext` substituido por fluxo local com `authService` e `settingsService`.
- `base44Client` criado como stub para evitar dependencia online.
- `safeLocalStorage` criado para evitar crashes por storage indisponivel.
- `safeJsonParse` usado em configuracoes e carrinho.
- `QueryClient` global criado em `src/lib/query-client.js`.
- `PageNotFound` atualizado para consultar `authService`.
- `AuthGate` criado para protecao local de pagina.
- `Kitchen`, `Orders` e `Customers` migrados parcialmente para `services`.
- Mocks estruturados adicionados em `src/mocks`.
- Servicos locais adicionados em `src/services`.
- `Checkout` passou a ler carrinho com fallback seguro.
- `Home` passou a tratar configuracoes ausentes com fallback de horario.
- Rotas principais centralizadas em `pages.config.js`.
- `postcss.config.cjs` existe e evita problemas de module type com config CommonJS.
- Build de producao validado com sucesso.

## O Que Ainda Depende do Base44

Dependencias instaladas:

- `@base44/sdk`
- `@base44/vite-plugin`

Arquivos com chamadas diretas a `base44`:

- `src/lib/NavigationTracker.jsx`
- `src/pages/AdminHome.jsx`
- `src/pages/Home.jsx`
- `src/pages/Menu.jsx`
- `src/pages/Checkout.jsx`
- `src/pages/MyOrders.jsx`
- `src/pages/NewOrder.jsx`
- `src/pages/OrderDetail.jsx`
- `src/pages/TrackOrder.jsx`
- `src/pages/Reports.jsx`
- `src/pages/Stock.jsx`
- `src/pages/Settings.jsx`
- `src/pages/MenuManagement.jsx`
- `src/pages/UserManagement.jsx`
- `src/pages/DeleteAccount.jsx`

Riscos:

- `base44.entities.MenuItem.list()` retorna `[]`; o cardapio publico pode ficar vazio.
- `base44.entities.Order.create()` retorna `{}`; checkout pode navegar para `TrackOrder?id=undefined`.
- `base44.entities.Order.filter()` retorna `[]`; rastreio e detalhe de pedido tendem a mostrar "nao encontrado".
- `Settings` salva em stub sem persistencia real.
- `Stock`, `MenuManagement` e `UserManagement` exibem dados vazios e mutacoes sem efeito real.
- `DeleteAccount` chama `SendEmail` stubado; nao envia email real.
- `AdminHome` usa usuario admin fake via stub, liberando opcoes administrativas.

## Rotas Estaveis

- `/` e `/Home`: renderizam com fallback de settings; dependem apenas de stub vazio para configuracoes.
- `/AdminHome`: renderiza com admin fake; funcional para navegacao.
- `/Orders`: usa `orderService` com pedidos mockados; lista pedidos e estatisticas.
- `/Kitchen`: usa `orderService` e `settingsService`; permite avancar status em memoria.
- `/Customers`: usa `customerService` e `orderService`; lista clientes, pedidos e enderecos mockados.
- `/Checkout`: renderiza com fallback seguro quando carrinho esta ausente.
- `/MyOrders`: renderiza busca por telefone sem crash critico.
- `/DeleteAccount`: fluxo visual renderiza e finaliza com stub.
- `*`: 404 renderiza corretamente.

## Rotas Frageis

- `/Menu`: depende de `base44.entities.MenuItem.list()`, que hoje retorna vazio. Pode ficar sem produtos.
- `/Checkout`: criar pedido usa stub; sucesso pode gerar `order.id` indefinido.
- `/TrackOrder`: depende de `Order.filter` e `Order.list` do stub; geralmente nao encontra pedido.
- `/OrderDetail`: depende de `Order.filter` e `Order.update` do stub; geralmente nao encontra pedido.
- `/NewOrder`: depende de `MenuItem.list` e `Order.create` do stub; criacao nao entra no `orderService`.
- `/Reports`: depende de `Order.list` do stub; relatorios tendem a ficar zerados.
- `/Stock`: depende de `Product.list/create/update/delete` do stub; estoque sem persistencia.
- `/Settings`: depende de `Settings.list/create/update` do stub; alteracoes nao alimentam `settingsService`.
- `/MenuManagement`: depende de `MenuItem` via stub; gestao sem dados reais.
- `/UserManagement`: depende de `StaffProfile`, `User` e `inviteUser` via stub; permissao baseada em admin fake.

## Riscos de Producao

Auth e seguranca:

- Usuario admin fake por padrao.
- Sem login real.
- Sem controle de sessao.
- Sem autorizacao efetiva no roteamento global.
- `AuthGate` nao cobre todas as paginas administrativas.
- Dados sensiveis como senha padrao aparecem em formulario e seriam inseguros se persistidos.

Dados e backend:

- Sem banco de dados.
- Sem API real conectada.
- Stubs retornam sucesso vazio, mascarando falhas.
- Dados em memoria se perdem ao reiniciar.
- Servicos locais e `base44Client` nao compartilham a mesma fonte de dados.

Navegacao:

- Checkout pode navegar para rastreio com id indefinido.
- Detalhe e rastreio podem nao localizar pedidos criados por outro fluxo.
- Rotas administrativas estao acessiveis por URL.

Crashes possiveis:

- Uso de `window` em alguns utilitarios pressupoe ambiente browser.
- `window.open` pode ser bloqueado pelo navegador.
- Dados vazios do stub podem gerar telas vazias inesperadas.
- Alguns formatos de data invalidos podem afetar `date-fns`.

UI/CSS:

- `src/index.css` esta minimalista e nao inclui diretivas Tailwind.
- `src/globals.css` existe, mas nao e importado em `main.jsx`.
- A aplicacao pode compilar, mas a UI pode perder parte importante do estilo esperado.
- Ha varios textos com problemas de encoding.

Dependencias:

- Pacotes Base44 ainda instalados.
- Muitas dependencias parecem herdadas do template e podem estar sem uso direto.
- `npm install` reportou 2 vulnerabilidades moderadas.

## Paginas e Componentes Criticos

Criticos para o cliente:

- `Home`
- `Menu`
- `Checkout`
- `TrackOrder`
- `MyOrders`

Criticos para operacao:

- `AdminHome`
- `Orders`
- `OrderDetail`
- `Kitchen`
- `NewOrder`
- `Customers`

Criticos para administracao:

- `Settings`
- `MenuManagement`
- `Stock`
- `Reports`
- `UserManagement`

Componentes/infra criticos:

- `AuthContext`
- `AuthGate`
- `base44Client`
- `query-client`
- `safeLocalStorage`
- `pages.config.js`

## Dependencias Mortas ou Suspeitas

Suspeitas por legado ou uso nao confirmado na auditoria:

- `@base44/sdk`
- `@base44/vite-plugin`
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`
- `react-leaflet`
- `three`
- `react-quill`
- `react-markdown`
- `html2canvas`
- `jspdf`
- `canvas-confetti`
- `lodash`
- `moment`
- `next-themes`

Antes de remover, confirmar com busca automatizada e teste de build, porque algumas dependencias podem ser usadas indiretamente por componentes UI.

## Melhorias Futuras

Prioridade alta:

- Definir backend real e contrato de API.
- Substituir chamadas restantes de `base44.entities.*`.
- Corrigir persistencia de pedidos entre `Menu`, `Checkout`, `Orders`, `Kitchen` e `TrackOrder`.
- Implementar autenticacao real e protecao de rotas administrativas.
- Reativar ou corrigir pipeline Tailwind/CSS.
- Corrigir encoding dos textos.

Prioridade media:

- Normalizar schemas entre `entities`, mocks e servicos.
- Centralizar regras de status de pedido.
- Criar testes de fluxo para pedido, checkout, cozinha e relatorios.
- Implementar camada de erro e empty states padronizados.
- Revisar vulnerabilidades npm.

Prioridade baixa:

- Remover dependencias nao usadas.
- Organizar nomenclatura do projeto no `package.json`.
- Melhorar documentacao interna de dominio.
- Revisar componentes UI herdados sem uso.

## Divida Tecnica

A maior divida tecnica e a coexistencia de tres fontes conceituais de dados: schemas Base44 em `entities`, stubs `base44.entities.*` e servicos locais com mocks. Isso cria acoplamento perigoso e comportamento inconsistente entre rotas.

O segundo ponto e autenticacao: a aplicacao parece protegida visualmente, mas o usuario admin fake libera a maioria dos fluxos. Para producao, o modelo atual nao deve ser reutilizado.

O terceiro ponto e persistencia: `orderService` consegue manipular pedidos em memoria, mas rotas que criam ou buscam pedido pelo stub nao enxergam esses dados.

Arquitetura futura recomendada:

- Manter `pages` focadas em UI e orquestracao.
- Consolidar `services` como unica camada de acesso a dados.
- Trocar mocks por adaptadores HTTP reais gradualmente.
- Criar um `authService` real com login, logout, refresh e roles.
- Remover o stub Base44 apos migrar todas as chamadas.

## Roadmap Recomendado

Fase 1 - Estabilizacao local:

- Corrigir CSS/Tailwind ativo.
- Corrigir encoding.
- Fazer `base44Client` usar os mesmos services/mocks enquanto backend nao existe.
- Garantir que checkout crie pedido rastreavel.
- Proteger rotas administrativas de forma consistente.

Fase 2 - Contrato de backend:

- Definir modelos de Pedido, Cliente, Produto, Cardapio, Usuario e Configuracao.
- Criar endpoints reais.
- Substituir mocks por API em uma camada de servico unica.
- Adicionar tratamento de erro e loading padronizado.

Fase 3 - Producao funcional:

- Implementar autenticacao real.
- Persistir pedidos e eventos de status.
- Integrar WhatsApp/email de forma controlada.
- Criar testes de regressao dos fluxos criticos.

Fase 4 - Maturidade:

- Remover dependencias legadas.
- Criar observabilidade e logs reais.
- Melhorar relatorios com dados persistentes.
- Revisar seguranca, LGPD e permissoes por papel.

## Validacao de Execucao

Comandos executados:

- `npm.cmd install`: sucesso. O npm reportou 2 vulnerabilidades moderadas.
- `npm.cmd run build`: sucesso. Build Vite concluido sem erro critico.
- `npm.cmd run dev -- --host 127.0.0.1`: sucesso. Servidor Vite iniciado.

Validacao HTTP:

- `http://127.0.0.1:5173/`: HTTP 200.
- `http://127.0.0.1:5174/`: HTTP 200.

Observacao: ja havia um servidor Vite ativo na porta 5173. A nova instancia iniciou na porta 5174.
