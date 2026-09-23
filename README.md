# 🌿 Alvarães Moderna (Conecta Comunidade)

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

**Alvarães Moderna** é um portal digital focado em conectar os moradores da cidade de Alvarães (Amazonas). A plataforma funciona como um hub centralizado para notícias locais, divulgação de comércios, agenda de eventos, cursos, oportunidades e muito mais.

---

## ✨ Funcionalidades

- 📰 **Notícias:** Acompanhe o que acontece na cidade (com sistema de curtidas e comentários).
- 🏪 **Comércio Local:** Diretório de negócios e serviços disponíveis na região.
- 📅 **Agenda Cultural:** Fique por dentro das festas, reuniões e eventos da cidade.
- 🎓 **Cursos e Oportunidades:** Vagas de emprego e inscrições para cursos locais.
- ✉️ **Boletim Informativo:** Sistema de newsletter para moradores receberem resumos semanais por e-mail.
- ⚙️ **Painel Administrativo:** Gestão completa de publicações, moderação de comentários, cadastros de novos negócios e moderação de conteúdo (com autenticação segura).

---

## 🛠 Tecnologias Utilizadas

O projeto adota uma arquitetura moderna dividida entre **Frontend** e **Backend**, utilizando o ecossistema TypeScript de ponta a ponta.

### Frontend
- **Framework:** React + Vite
- **Roteamento & SSR:** TanStack Start / TanStack Router
- **Estilização:** Tailwind CSS
- **Componentes Base:** shadcn/ui + Lucide Icons (Ícones)
- **Comunicação com a API:** Fetch nativo otimizado

### Backend
- **Core:** Node.js com Express
- **Banco de Dados:** MySQL (via Docker)
- **ORM:** Prisma
- **Autenticação:** JSON Web Tokens (JWT)
- **Validação de Dados:** Zod

---

## 🚀 Como executar o projeto localmente

Siga os passos abaixo para rodar a aplicação no seu ambiente de desenvolvimento.

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (versão 18+ recomendada)
- [Docker](https://www.docker.com/) e Docker Compose (para o banco de dados local)
- Git

### 1. Clonando o Repositório
```bash
git clone https://github.com/seu-usuario/alvaraes-conecta-comunidade.git
cd alvaraes-conecta-comunidade
```

### 2. Configurando e Rodando o Backend
Abra um terminal e acesse a pasta do backend:
```bash
cd backend

# Instale as dependências
npm install

# Inicie o contêiner do MySQL
docker-compose up -d

# Crie e configure o arquivo .env baseado no .env.example (se aplicável)
# Certifique-se de que a DATABASE_URL aponte para o banco local no Docker.

# Sincronize o banco de dados (Criação das tabelas)
npx prisma db push
# ou npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```
> O backend estará rodando na porta **3333** (`http://localhost:3333`).

### 3. Configurando e Rodando o Frontend
Abra um **novo terminal** (mantenha o backend rodando) e acesse a pasta do frontend:
```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
> O frontend estará rodando na porta **5173** (ou `8080`/`8081`). Acesse pelo navegador: `http://localhost:5173`.

---

## 📂 Estrutura do Projeto

```text
📁 alvaraes-conecta-comunidade/
├── 📁 backend/                # API e lógica de negócio
│   ├── 📁 prisma/             # Schema do banco de dados
│   └── 📁 src/
│       ├── 📁 common/         # Middlewares e utilitários globais
│       ├── 📁 database/       # Configuração do Prisma Client
│       └── 📁 modules/        # Domínios (notícias, comercios, curtidas, etc.)
│
└── 📁 frontend/               # Interface do usuário e Painel Admin
    ├── 📁 public/             # Assets estáticos (logos, favicons)
    └── 📁 src/
        ├── 📁 components/     # Componentes de UI reutilizáveis (shadcn)
        ├── 📁 lib/            # Utilitários (APIs admin, configs)
        ├── 📁 modules/        # Componentes e lógicas separadas por domínio
        └── 📁 routes/         # Rotas da aplicação (TanStack Router)
```

---

## 🤝 Contribuindo

Regras gerais de desenvolvimento adotadas no projeto:
- **Clean Code e Arquitetura:** Respeite sempre a separação em camadas (`Controller` -> `UseCase` -> `Repository`).
- **Sem "Hard Code":** Variáveis de ambiente e strings fixas devem ser devidamente centralizadas ou usar `.env`.
- **Commits Claros:** Siga os padrões do Conventional Commits nas mensagens do Git.

---

<div align="center">
  <p>Feito com ♥ para a cidade de Alvarães.</p>
</div>
