# Desenvolvimento Local

Este guia mostra como rodar o Alvaraes Moderna depois da separacao entre
frontend e backend.

## Estrutura

```txt
alvaraes-conecta-comunidade/
  frontend/
    src/
    public/
    package.json

  backend/
    src/
    prisma/
    package.json
```

## Requisitos

- Node.js 20 ou 22;
- npm;
- MySQL ou MariaDB;
- banco criado para desenvolvimento.

## Variaveis de Ambiente do Backend

Crie `backend/.env` a partir de `backend/.env.example`.

Exemplo:

```txt
NODE_ENV=development
PORT=3333
DATABASE_URL="mysql://usuario:senha@localhost:3306/alvaraes_moderna"
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="um-segredo-grande-para-desenvolvimento-local"
```

Nunca commitar `backend/.env`.

## Instalar Dependencias

Na raiz do projeto:

```sh
npm install
```

Isso instala as dependencias dos workspaces `frontend` e `backend`.

## Banco de Dados

Para desenvolvimento local, a opcao recomendada e subir o MySQL com Docker
Compose:

```sh
npm run db:up
npm run db:init
```

Isso cria um MySQL local em:

```txt
host: localhost
porta: 3306
banco: alvaraes_moderna
usuario: alvaraes
senha: alvaraes123456
root: root
senha root: root123456
```

String de conexao para `backend/.env`:

```txt
DATABASE_URL="mysql://alvaraes:alvaraes123456@localhost:3306/alvaraes_moderna"
SHADOW_DATABASE_URL="mysql://root:root123456@localhost:3306/alvaraes_moderna_shadow"
```

`SHADOW_DATABASE_URL` e usado apenas pelo `prisma migrate dev` em ambiente
local. O Prisma precisa de um banco temporario para comparar migrations, por
isso usamos root nessa URL secundaria.

Para parar o banco:

```sh
npm run db:down
```

Se aparecer erro parecido com `pipe/docker_engine` ou `docker client must be run
with elevated privileges`, abra o Docker Desktop e espere ele ficar com status de
rodando antes de executar `npm run db:up` novamente.

Neste ambiente Windows, o comando disponivel e `docker-compose`, por isso os
scripts da raiz usam esse formato.

Para conectar no MySQL Workbench depois que o container estiver rodando:

```txt
Host: 127.0.0.1
Porta: 3306
Usuario: alvaraes
Senha: alvaraes123456
Banco: alvaraes_moderna
```

Tambem e possivel conectar como root:

```txt
Usuario: root
Senha: root123456
```

## Conexao no DBeaver

No DBeaver, criar uma conexao MySQL com:

```txt
Host: 127.0.0.1
Porta: 3306
Database: alvaraes_moderna
Usuario: alvaraes
Senha: alvaraes123456
```

Ou, se quiser entrar como root:

```txt
Host: 127.0.0.1
Porta: 3306
Database: alvaraes_moderna
Usuario: root
Senha: root123456
```

Nao usar usuario `alvaraesroot`. Esse usuario nao existe no
`docker-compose.yml`.

Se aparecer o erro `Public Key Retrieval is not allowed`, abrir as propriedades
da conexao no DBeaver e adicionar em `Driver properties`:

```txt
allowPublicKeyRetrieval = true
useSSL = false
```

Tambem e possivel colocar esses parametros na JDBC URL:

```txt
jdbc:mysql://127.0.0.1:3306/alvaraes_moderna?allowPublicKeyRetrieval=true&useSSL=false
```

Na raiz do projeto:

```sh
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

O seed cria:

- usuario administrador inicial;
- configuracao principal do site;
- categorias iniciais de noticias, comercios e eventos.

Senha inicial do seed:

```txt
email: admin@alvaraesmoderna.com.br
senha: admin123456
```

Trocar essa senha antes de publicar.

## Rodar o Backend

Na raiz:

```sh
npm run dev:backend
```

Endpoint inicial:

```txt
GET http://localhost:3333/api/health
```

Documentacao Swagger:

```txt
http://localhost:3333/api/docs
```

Contrato OpenAPI em JSON:

```txt
http://localhost:3333/api/docs.json
```

## Rodar o Frontend

Na raiz:

```sh
npm run dev:frontend
```

Por padrao, o Vite abre em:

```txt
http://localhost:5173
```

## Observacoes

- Nao rodar `ng build`, este projeto nao usa Angular.
- O frontend ainda pode ter dados locais enquanto a integracao com a API nao for
  concluida.
- As regras de negocio devem ficar no backend, em `*.rules.ts`.
- Controllers devem continuar simples.
- Repositories devem continuar focados em banco.
