# Documentação dos Testes Automatizados — JESZONE

## 1. Objetivo

Esta documentação descreve a estratégia de testes utilizada no backend do JESZONE, explicando a organização da suíte, os tipos de teste aplicados, as técnicas utilizadas e a forma de execução.

O objetivo é verificar a confiabilidade das principais funcionalidades da API, validar regras de entrada, garantir o tratamento adequado de erros e confirmar a integração com o banco de dados.

## 2. Ferramentas utilizadas

### Vitest

O Vitest é utilizado como framework de testes. Ele fornece a estrutura para criação, execução e organização dos testes, além de recursos como `describe`, `test`, `expect` e mocks com `vi`.

### Supertest

O Supertest é utilizado nos testes de API para enviar requisições HTTP diretamente para a aplicação Express, permitindo verificar o comportamento real das rotas sem a necessidade de iniciar o servidor em uma porta externa.

### Sequelize e MySQL

Nos testes de integração e em parte dos testes funcionais, o Sequelize acessa o banco MySQL real. Isso permite verificar operações de persistência e confirmar se os dados realmente foram criados, atualizados ou removidos.

### Zod

O Zod é utilizado na aplicação para validar os dados recebidos pelas rotas. Os testes funcionais utilizam entradas inválidas para verificar se essas regras são corretamente aplicadas pela API.

## 3. Organização dos arquivos

Os testes estão separados em três grupos:

```text
src/tests/
├── unitary/
├── integration/
└── functional/
```

### 3.1 Unitários

```text
unitary/
├── autenticacaoController.test.js
├── notificacaoController.test.js
└── turmaController.test.js
```

Os controllers são testados diretamente. Os models são mockados quando necessário para isolar a unidade sob teste.

Exemplo de estratégia utilizada:

```js
vi.mock("../../models/index.js", () => ({
  Turma: {
    upsert: vi.fn(),
    destroy: vi.fn(),
  },
}));
```

Dessa forma, o teste consegue verificar se o controller chamou corretamente a camada de persistência sem depender do banco.

### 3.2 Integração

```text
integration/
├── Configbanco.test.js
└── app.test.js
```

Os testes verificam componentes reais da aplicação, incluindo a conexão com o MySQL e a integração da aplicação Express.

### 3.3 Funcionais

```text
functional/
├── autenticacaoRotas.test.js
├── estadoRotas.test.js
├── jogoRotas.test.js
├── notificacaoRotas.test.js
├── regulamentoRotas.test.js
├── resultadoUnicoRotas.test.js
├── serieRotas.test.js
└── turmaRotas.test.js
```

Os testes funcionais utilizam Supertest e acessam os endpoints reais da API.

## 4. Técnicas utilizadas

### 4.1 Testes positivos

Verificam se uma operação válida produz o resultado esperado.

Exemplos:

- login válido;
- criação de jogo;
- atualização de placar;
- criação de turma;
- publicação de notificação;
- atualização de regulamento.

### 4.2 Testes negativos

Verificam o comportamento da API diante de entradas inválidas ou situações não permitidas.

Exemplos:

- credenciais inválidas;
- dados rejeitados pelo Zod;
- requisições sem token;
- parâmetros inválidos;
- tentativa de acessar um jogo inexistente.

### 4.3 Testes de autenticação

Rotas protegidas são testadas sem token e com token válido. Também é verificado o fluxo de login e posterior utilização do JWT.

### 4.4 Análise de valores-limite

Foi utilizada a regra do placar de jogos, que aceita valores entre 0 e 999. O teste envia `1000` para verificar o comportamento imediatamente acima do limite permitido.

```text
0 ≤ placarA ≤ 999
```

### 4.5 Validação de regras de negócio

Além de validar o formato dos dados, os testes verificam regras como o retorno de `404` quando um jogo que deveria existir não é encontrado.

## 5. Exemplos de funcionalidades testadas

### Autenticação

```http
POST /api/auth/entrar
GET  /api/auth/verificar
```

São verificadas credenciais válidas, credenciais inválidas e o uso de JWT em rota protegida.

### Estado

```http
GET /api/estado
```

A resposta deve conter as coleções e estruturas esperadas do estado público da aplicação.

### Jogos

```http
POST   /api/jogos/lote
PATCH  /api/jogos/:id
DELETE /api/jogos/:id
```

São verificadas autenticação, validação, criação, atualização, exclusão e tratamento de jogo inexistente.

### Notificações

```http
GET  /api/notificacoes
POST /api/notificacoes
```

São verificadas consulta, autenticação, validação e publicação de notificações.

### Turmas

```http
PUT    /api/turmas/:id
DELETE /api/turmas/:id
```

São verificadas operações de criação/atualização e exclusão pela API.

### Séries

```http
PUT /api/series/:serie
```

O teste verifica a definição da seleção e a atualização do `paisKey` das turmas relacionadas à série.

### Regulamento

```http
PUT /api/regulamento/:chave
```

São verificadas rejeição de dados inválidos e gravação de dados válidos.

### Resultados únicos

```http
PUT    /api/resultados-unicos
DELETE /api/resultados-unicos
```

São verificadas validação, gravação e exclusão.

## 6. Boas práticas aplicadas

Nos testes que alteram o banco, são utilizados dados temporários. Quando necessário, os registros criados durante o teste são removidos ao final, evitando deixar dados de teste permanentes no banco.

O bloco `finally` é utilizado em operações desse tipo para garantir a execução da limpeza mesmo quando uma asserção falha.

Também foi adotada a prática de não modificar um teste apenas para fazê-lo passar quando o problema está na aplicação. Durante a construção da suíte, erros reais encontrados na estrutura do banco foram corrigidos antes de continuar os testes.

## 7. Execução da suíte

Modo observação:

```bash
npm test
```

Execução única de toda a suíte:

```bash
npm run test:run
```

Execução de um arquivo específico:

```bash
npx vitest run src/tests/functional/jogoRotas.test.js
```

## 8. Resultado final registrado

Na última execução completa registrada durante o desenvolvimento da suíte:

```text
Test Files  13 passed (13)
Tests       39 passed (39)
```

Portanto, naquele momento, todos os 39 testes executados foram aprovados.

## 9. Relação com os critérios de avaliação

### Critério 1 — Organização/configuração

Projeto configurado para execução de testes automatizados com Vitest e estrutura de arquivos organizada.

### Critério 2 — Testes unitários

Controllers testados isoladamente, com uso de mocks para separar a lógica da persistência.

### Critério 3 — Testes de integração

Integração da aplicação e conexão com o MySQL verificadas com componentes reais.

### Critério 4 — Funcionalidades da API

Diversos endpoints reais testados com Supertest, incluindo autenticação, estado, jogos, notificações, turmas, séries, regulamento e resultados únicos.

### Critério 5 — Diferentes tipos/técnicas

Foram utilizados testes unitários, integração e funcionais, além de casos positivos, negativos, autenticação, validação e análise de valores-limite.

### Critério 6 — Regras e tratamento de erros

Foram verificadas respostas de erro como `400`, `401` e `404`, além de regras de validação e recursos inexistentes.

### Critério 7 — Automação

A suíte inteira pode ser executada por meio de um único comando:

```bash
npm run test:run
```

### Critério 8 — Documentação

Esta documentação registra a estrutura, ferramentas, técnicas, comandos de execução e resultados da suíte.
