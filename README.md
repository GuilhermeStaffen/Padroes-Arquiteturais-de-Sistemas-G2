# Sistema de Gerenciamento de Tickets de Suporte

Este é um sistema backend (API REST) para abertura e acompanhamento de chamados técnicos, construído com Node.js, TypeScript, MySQL e RabbitMQ. O projeto utiliza a **Arquitetura Hexagonal (Ports and Adapters)** para garantir um alto nível de desacoplamento, facilitando manutenção e escalabilidade.

## 🛠️ O que instalar (Pré-requisitos)

Para rodar este projeto, você precisará ter instalado em sua máquina:

1. **Node.js** (versão 18+ recomendada)
2. **NPM** (gerenciador de pacotes, já incluso no Node.js)
3. **MySQL** (versão 8+ recomendada)
4. **RabbitMQ** (pode ser instalado via Docker para maior facilidade)

### Iniciando MySQL e RabbitMQ via Docker (Opcional, mas recomendado)
Se você possui o Docker instalado, pode subir ambos facilmente:
```bash
# Iniciar MySQL
docker run --name ticket-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=ticket_system -p 3306:3306 -d mysql:8

# Iniciar RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

## ⚙️ Como instalar

1. Clone ou baixe este repositório.
2. Acesse a pasta do projeto no seu terminal.
3. Instale as dependências executando:
   ```bash
   npm install
   ```
4. **Variáveis de Ambiente (.env):** O sistema utiliza variáveis de ambiente. Se você estiver rodando o banco ou RabbitMQ localmente com as portas padrões e o usuário `root` e senha `root`, as configurações padrão do código devem funcionar. Caso não, crie um arquivo `.env` na raiz do projeto com o seguinte:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=ticket_system
   RABBITMQ_URL=amqp://localhost
   PORT=3000
   ```

5. **Iniciando o Banco de Dados:**
   - Execute o script SQL localizado em `scripts/init-db.sql` no seu servidor MySQL para criar o banco de dados `ticket_system` e as tabelas necessárias (`tickets` e `comments`).

## 🚀 Como executar

O sistema é dividido na API e nos Consumers (ouvintes de notificação). Você precisa rodar ambos simultaneamente (em terminais separados).

**1. Rodando a API (Modo de desenvolvimento):**
Em um terminal, execute:
```bash
npm run dev
```
A API será iniciada em `http://localhost:3000` (ou na porta definida no seu `.env`).

**2. Rodando os Consumers (Email & Discord):**
Abra um novo terminal na pasta do projeto e execute:
```bash
npm run consumers
```
Isso iniciará os ouvintes conectados ao RabbitMQ aguardando eventos do sistema.

---

## 🔒 Autenticação e Autorização

A API utiliza **JSON Web Token (JWT)** para autenticação. 
Com exceção da rota de login, **todas as rotas da API requerem autenticação** através de um header `Authorization` com o token recebido no momento do login.

Exemplo de Header:
```http
Authorization: Bearer <seu_token_jwt>
```

A rota de **Atualizar o Status de um Ticket** requer privilégios de **Administrador**.

---

## 🛣️ Rotas Existentes (API REST)

A base de URL para todas as rotas é `http://localhost:3000/api`.

### 0. Login
Autentica um usuário existente pelo `username` e retorna um token JWT para ser utilizado nas demais requisições.

- **Método:** `POST`
- **Endpoint:** `/auth/login`
- **Payload (JSON):**
  ```json
  {
    "username": "admin"
  }
  ```
- **Retorno (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "admin-1",
      "username": "admin",
      "isAdmin": true
    }
  }
  ```

### 1. Criar um novo Ticket
Cria um chamado de suporte e publica um evento `TicketCreated` no RabbitMQ.

- **Método:** `POST`
- **Endpoint:** `/tickets`
- **Payload (JSON):**
  ```json
  {
    "title": "Problema no roteador",
    "description": "A internet cai de 10 em 10 minutos.",
    "userId": "user-123-abc"
  }
  ```
- **Retorno (201 Created):**
  ```json
  {
    "id": "e458b0ab-2b7e-4078-a28d-12b2e8cf3a81",
    "title": "Problema no roteador",
    "description": "A internet cai de 10 em 10 minutos.",
    "userId": "user-123-abc",
    "status": "OPEN",
    "createdAt": "2026-05-26T12:00:00.000Z",
    "comments": []
  }
  ```

### 2. Listar todos os Tickets
Retorna uma lista de todos os tickets ordenados pela data de criação (mais recentes primeiro).

- **Método:** `GET`
- **Endpoint:** `/tickets`
- **Retorno (200 OK):**
  ```json
  [
    {
      "id": "e458b0ab-2b7e-4078-a28d-12b2e8cf3a81",
      "title": "Problema no roteador",
      "description": "A internet cai de 10 em 10 minutos.",
      "userId": "user-123-abc",
      "status": "OPEN",
      "createdAt": "2026-05-26T12:00:00.000Z"
    }
  ]
  ```

### 3. Obter um Ticket específico
Busca os detalhes de um ticket incluindo a sua lista de comentários.

- **Método:** `GET`
- **Endpoint:** `/tickets/:id`
- **Retorno (200 OK):**
  ```json
  {
    "id": "e458b0ab-2b7e-4078-a28d-12b2e8cf3a81",
    "title": "Problema no roteador",
    "description": "A internet cai de 10 em 10 minutos.",
    "userId": "user-123-abc",
    "status": "IN_PROGRESS",
    "createdAt": "2026-05-26T12:00:00.000Z",
    "comments": [
      {
        "id": "b182dca9-324c-4e89-a29d-4781cae9bb4a",
        "ticketId": "e458b0ab-2b7e-4078-a28d-12b2e8cf3a81",
        "userId": "admin-1",
        "content": "Estamos enviando um técnico amanhã.",
        "createdAt": "2026-05-26T14:30:00.000Z"
      }
    ]
  }
  ```

### 4. Atualizar o Status de um Ticket
Permite alterar o status de um ticket. Os status válidos são: `OPEN`, `IN_PROGRESS` ou `CLOSED`. Dispara o evento `TicketStatusUpdated` no RabbitMQ.

- **Método:** `PATCH`
- **Endpoint:** `/tickets/:id/status`
- **Payload (JSON):**
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Retorno (200 OK):**
  ```json
  {
    "message": "Status updated successfully"
  }
  ```

### 5. Adicionar um Comentário
Adiciona um comentário a um ticket existente.

- **Método:** `POST`
- **Endpoint:** `/tickets/:id/comments`
- **Payload (JSON):**
  ```json
  {
    "userId": "admin-1",
    "content": "Estamos enviando um técnico amanhã."
  }
  ```
- **Retorno (201 Created):**
  ```json
  {
    "id": "b182dca9-324c-4e89-a29d-4781cae9bb4a",
    "ticketId": "e458b0ab-2b7e-4078-a28d-12b2e8cf3a81",
    "userId": "admin-1",
    "content": "Estamos enviando um técnico amanhã.",
    "createdAt": "2026-05-26T14:30:00.000Z"
  }
  ```
