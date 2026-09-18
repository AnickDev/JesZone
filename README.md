# JESZONE

Plataforma completa de gerenciamento e acompanhamento dos Jogos Estudantis do SESI. O sistema conta com painel administrativo para gestão de jogos, turmas, regulamentos, avisos e resultados, além de uma interface pública em tempo real com mapa de eventos, acompanhamento ao vivo, chaveamento (mata-mata) e suporte a telão.

---

## ⚡ Funcionalidades Principais

* **Painel Administrativo:** Gestão completa de turmas, séries, jogos, resultados individuais/únicos, regulamentos e emissão de avisos.
* **Acompanhamento Ao Vivo:** Visualização de partidas em andamento e histórico de resultados.
* **Chaveamento Dinâmico:** Gerenciamento visual do mata-mata.
* **Mapa de Eventos e Locais:** Integração e exibição visual das quadras de jogos.
* **Modo Telão:** Exibição para transmissão ou telas grandes em locais de evento.
* **Notificações e Busca:** Busca rápida e central de alertas/notificações.
* **Importação de Dados:** Suporte à leitura e processamento de planilhas Excel (.xlsx).

---

## 🚀 Tecnologias Utilizadas

### Frontend
* **Core:** React 19 (react, react-dom)
* **Build Tool:** Vite 7
* **Roteamento & Estado:** @tanstack/react-router (com geração automática de `routeTree.gen.js` via `@tanstack/router-plugin`) e @tanstack/react-query
* **Estilização & UI:** Tailwind CSS v4 (via `@tailwindcss/vite`), tw-animate-css, motion (Framer Motion)
* **Componentes & Utilitários:** lucide-react, clsx, tailwind-merge, xlsx

> O cliente HTTP do frontend (`src/services/api.js`) usa `fetch` nativo — não há dependência de Axios.

### Backend
* **Ambiente de Execução:** Node.js (v18+) em Módulos ES (`"type": "module"`)
* **Framework Web:** Express.js
* **Banco de Dados & ORM:** MySQL (mysql2) via Sequelize
* **Segurança:** JSON Web Token (jsonwebtoken), helmet e cors
* **Validação de Dados:** Zod
* **Testes:** Vitest e Supertest (unitários, de integração e funcionais)
* **Dev Tools:** dotenv e nodemon

---

## 📁 Estrutura de Pastas e Arquivos

```
JESZONE-DadosAutomatico/
├── backend/
│   ├── src/
│   │   ├── config/              # Configuração do banco (banco.js) e locais (locais.js)
│   │   ├── controllers/         # Regras de negócio (Autenticação, Jogos, Turmas, Séries,
│   │   │                          Regulamento, Resultados Únicos, Notificações, Estado)
│   │   ├── middlewares/         # autenticar.js, autenticarOpcional.js, tratadorErros.js
│   │   ├── models/              # Modelos Sequelize (Turma, Jogo, SerieSelecao,
│   │   │                          Regulamento, ResultadoUnico, Notificacao)
│   │   ├── routes/              # Endpoints da API REST (um arquivo por recurso)
│   │   ├── services/            # mataMataService, notificacaoService, seedService
│   │   ├── utils/                # ErroApi, assincrono (handler async), esquemas (Zod),
│   │   │                          popularTurmas
│   │   └── tests/               # unitary/, integration/, functional/ (Vitest + Supertest)
│   ├── app.js                   # Configuração e middlewares Express
│   ├── server.js                # Inicialização do servidor, validação de env e conexão MySQL
│   └── .env                     # Variáveis de ambiente (não versionar em produção)
│
└── frontend/
    ├── src/
    │   ├── components/          # Componentes reutilizáveis (MatchCard, GlassCard, SiteHeader,
    │   │                          NotificationBell, EventMap, SearchCommand, OnboardingTour etc.)
    │   ├── context/             # Contextos globais (categoria.jsx, jesContext.jsx)
    │   ├── hooks/               # Custom Hooks (useMobile.js)
    │   ├── lib/                 # admin, auth, bracket (chaveamento), busca, favoritos,
    │   │                          importArquivo, jesConfig, jesDados, locais, preferencias,
    │   │                          scheduler, shareImage, utils
    │   ├── routes/              # Páginas da aplicação — Admin (jogos, turmas, séries,
    │   │                          regulamento, resultados, avisos, unicos), Ao Vivo, Telão,
    │   │                          Mapa, Modalidades, Histórico, Líder Geral, Login, Painel etc.
    │   ├── services/            # Cliente HTTP central (api.js) baseado em fetch
    │   ├── styles/              # Estilos globais CSS
    │   ├── main.jsx             # Ponto de entrada React
    │   └── router.jsx           # Configuração de rotas TanStack
    └── vite.config.js           # Configuração do Vite (alias "@" -> ./src, porta 5173)
```

---

## 📋 Pré-requisitos

* Node.js (versão 18.x ou superior)
* MySQL (instância local ou remota)
* npm ou yarn

---

## 🔧 Instalação e Execução

### 1. Backend

1. Entre na pasta do servidor:
   ```
   cd backend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor em modo de desenvolvimento 
   ```
   npm run dev
   ```

4. (Opcional) Execute a suíte de testes automatizados (Vitest + Supertest):
   ```
   npm test        # modo watch
   npm run test:run  # execução única
   ```

---

### 2. Frontend

1. Abra um novo terminal e entre na pasta do frontend:
   ```
   cd frontend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Execute a aplicação React:
   ```
   npm run dev
   ```

4. Acesse no navegador em http://localhost:5173.

---

## 📜 Scripts do Projeto

| Local | Comando | Descrição |
| :--- | :--- | :--- |
| Backend | `npm run dev` | inicia o servidor com Nodemon |
| Backend | `npm test` | Executa os testes automatizados (Vitest) em modo watch |
| Backend | `npm run test:run` | Executa os testes automatizados uma única vez |
| Frontend | `npm run dev` | Inicia o servidor local Vite |

---

## 🧪 Testes (Backend)

A suíte de testes do backend está documentada em `backend/DOCUMENTACAO_TESTES_JESZONE.md` e organizada em três camadas dentro de `src/tests/`:

* **unitary/** — testes de controllers isolados, com mocks dos models (ex.: `autenticacaoController`, `notificacaoController`, `turmaController`)
* **integration/** — testes que acessam o MySQL real via Sequelize
* **functional/** — testes de API ponta a ponta com Supertest, incluindo validação de payloads via Zod
## 🔧 Instalação e Execução

## Autores
-[Aquiles Augusto]
-[Mardson Peixoto]
-[Marlon Henrique]
-[Mateus Paranhos]
-[Vincius Chaves]
-[Júlio Anick]

---

## 📄 Licença

Este projeto é de uso restrito ao evento/organização do JES 2026.
