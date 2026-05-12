# SliceOS

Sistema web para operacao de pizzaria, com area publica de pedidos online e painel administrativo para pedidos, cozinha, clientes, estoque, cardapio, usuarios e relatorios.

## Visao Geral

O SliceOS e uma aplicacao frontend criada originalmente no Base44 e migrada para execucao local com React + Vite. O objetivo do sistema e centralizar o fluxo operacional de uma pizzaria: o cliente acessa o cardapio, monta o pedido e acompanha o status; a equipe administrativa gerencia pedidos, cozinha, clientes, estoque, configuracoes e indicadores.

O projeto esta em fase de transicao tecnica. A interface compila e executa localmente, parte dos fluxos ja usa servicos mockados internos e parte ainda passa por stubs de compatibilidade com Base44. O backend real ainda nao esta integrado.

## Tecnologias Utilizadas

- React 18
- Vite 6
- React Router DOM
- TanStack React Query
- Tailwind CSS
- Radix UI
- Lucide React
- Sonner
- date-fns
- Recharts
- Framer Motion

## Estrutura do Projeto

```text
src/
  api/            Stubs e clientes de API para transicao fora do Base44
  components/     Componentes compartilhados e componentes de UI
  hooks/          Hooks utilitarios
  lib/            Providers, contexto de autenticacao e utilitarios globais
  mocks/          Dados fake usados pela aplicacao local
  pages/          Telas publicas e administrativas
  services/       Servicos locais que encapsulam dados mockados
  utils/          Utilitarios de URL, storage e parsing seguro

entities/         Esquemas legados exportados do Base44
public/           Assets publicos
```

## Funcionalidades

- Pagina inicial publica da pizzaria
- Cardapio online
- Carrinho e checkout
- Criacao de pedidos
- Acompanhamento de pedido pelo cliente
- Historico de pedidos por telefone
- Painel administrativo
- Gestao de pedidos
- Tela de cozinha com avancos de status
- Cadastro e consulta de clientes
- Gestao de cardapio
- Controle de estoque
- Configuracoes de horario e WhatsApp
- Gestao de usuarios
- Relatorios de vendas
- Solicitação de exclusao de conta

## Instalacao

```bash
npm install
npm run dev
```

Por padrao, o Vite inicia em:

```text
http://localhost:5173
```

Se a porta estiver ocupada, o Vite usara a proxima porta disponivel.

## Build

```bash
npm run build
```

O build gera os arquivos finais em `dist/`.

## Estrutura de Rotas

As rotas sao registradas em `src/pages.config.js`.

Principais rotas:

- `/` - pagina inicial
- `/Home` - pagina inicial
- `/Menu` - cardapio publico
- `/Checkout` - finalizacao de pedido
- `/TrackOrder` - acompanhamento de pedido
- `/MyOrders` - historico do cliente
- `/AdminHome` - painel administrativo
- `/Orders` - pedidos
- `/NewOrder` - criacao manual de pedido
- `/OrderDetail` - detalhes do pedido
- `/Kitchen` - cozinha
- `/Customers` - clientes
- `/MenuManagement` - gestao de cardapio
- `/Stock` - estoque
- `/Reports` - relatorios
- `/Settings` - configuracoes
- `/UserManagement` - usuarios
- `/DeleteAccount` - solicitacao de exclusao de conta

## Estado Atual do Projeto

O projeto foi migrado do Base44 para uma aplicacao local React/Vite. O plugin do Base44 esta comentado na configuracao do Vite e existe um stub local em `src/api/base44Client.js` para evitar dependencia obrigatoria do Base44 online durante o desenvolvimento.

Parte da aplicacao ja usa servicos locais em `src/services`, alimentados por mocks em `src/mocks`. Outra parte ainda chama `base44.entities.*`, que atualmente retorna dados vazios ou respostas simuladas. Por isso, o frontend executa, mas algumas telas administrativas podem aparecer vazias ou nao persistir alteracoes reais.

## Roadmap

- Substituir chamadas restantes de `base44.entities.*` por servicos locais ou API real.
- Implementar backend persistente para pedidos, clientes, cardapio, estoque, usuarios e configuracoes.
- Criar autenticacao real com sessoes, papeis e protecao de rotas.
- Normalizar modelos de dados entre `entities`, mocks e servicos.
- Corrigir textos com problemas de encoding.
- Reativar pipeline de CSS/Tailwind completo se necessario.
- Adicionar testes focados nos fluxos criticos de pedido, checkout, cozinha e administracao.
- Remover dependencias legadas nao utilizadas apos a migracao final.

## Observacoes Tecnicas

- O projeto ainda contem dependencias Base44 em `package.json`, mas o plugin Vite esta desativado.
- `src/api/base44Client.js` e um stub de compatibilidade, nao um backend real.
- Os dados mockados ficam em memoria e podem ser perdidos ao recarregar o ambiente.
- A autenticacao atual e temporaria e baseada em usuario fake/admin.
- Fluxos que dependem de WhatsApp abrem URLs externas via `wa.me`.
- O sistema ainda nao deve ser considerado pronto para producao sem backend real, autenticacao real e persistencia.

## Licenca

Projeto privado. Defina uma licenca formal antes de publicar ou distribuir este repositorio.
