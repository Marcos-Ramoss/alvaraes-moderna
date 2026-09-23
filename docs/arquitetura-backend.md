# Arquitetura do Backend

Este documento define os padroes esperados para o backend do Alvaraes Moderna.
Ele deve ser usado como referencia por qualquer pessoa ou IA que trabalhe no
projeto, para manter o codigo organizado, previsivel e facil de manter.

## Objetivo

O backend sera responsavel por administrar e fornecer dados do portal:

- noticias e artigos;
- comercios e servicos;
- agenda de eventos;
- cursos e oportunidades;
- sugestoes, correcoes e pedidos de anuncio;
- midias e imagens autorizadas;
- configuracoes publicas do portal;
- autenticacao e painel administrativo.

O projeto deve priorizar manutencao simples, regras de negocio centralizadas e
contratos claros entre backend e frontend.

## Stack Recomendada

- Node.js com TypeScript;
- Express;
- MySQL ou MariaDB;
- Prisma ORM;
- Zod para validacao de entradas;
- JWT ou sessao por cookie para autenticacao administrativa.

## Organizacao Geral

O repositorio deve seguir a separacao entre frontend e backend:

```txt
alvaraes-conecta-comunidade/
  frontend/
    src/
    public/
    package.json
    vite.config.ts

  backend/
    src/
    prisma/
    package.json
    .env.example
```

## Padrao Arquitetural

O backend deve usar MVC modular, com cada modulo contendo suas proprias rotas,
controller, service, repository, regras, mappers e DTOs.

```txt
backend/
  src/
    app.ts
    server.ts

    config/
      env.ts
      cors.ts

    database/
      prisma.ts

    common/
      dtos/
      errors/
      middlewares/
      types/
      utils/

    modules/
      autenticacao/
        autenticacao.routes.ts
        autenticacao.controller.ts
        autenticacao.service.ts
        autenticacao.repository.ts
        autenticacao.mapper.ts
        dto/
          login.request.dto.ts
          login.response.dto.ts

      noticias/
        noticias.routes.ts
        noticias.controller.ts
        noticias.service.ts
        noticias.repository.ts
        noticias.rules.ts
        noticias.mapper.ts
        dto/
          criar-noticia.request.dto.ts
          atualizar-noticia.request.dto.ts
          listar-noticias.query.dto.ts
          noticia-resumo.response.dto.ts
          noticia-detalhe.response.dto.ts

      comercios/
        comercios.routes.ts
        comercios.controller.ts
        comercios.service.ts
        comercios.repository.ts
        comercios.rules.ts
        comercios.mapper.ts
        dto/
          criar-comercio.request.dto.ts
          atualizar-comercio.request.dto.ts
          listar-comercios.query.dto.ts
          comercio-resumo.response.dto.ts
          comercio-detalhe.response.dto.ts

      eventos/
        eventos.routes.ts
        eventos.controller.ts
        eventos.service.ts
        eventos.repository.ts
        eventos.rules.ts
        eventos.mapper.ts
        dto/

      oportunidades/
        oportunidades.routes.ts
        oportunidades.controller.ts
        oportunidades.service.ts
        oportunidades.repository.ts
        oportunidades.rules.ts
        oportunidades.mapper.ts
        dto/

      contatos/
        contatos.routes.ts
        contatos.controller.ts
        contatos.service.ts
        contatos.repository.ts
        contatos.rules.ts
        contatos.mapper.ts
        dto/

      anuncios/
        anuncios.routes.ts
        anuncios.controller.ts
        anuncios.service.ts
        anuncios.repository.ts
        anuncios.rules.ts
        anuncios.mapper.ts
        dto/

      midias/
        midias.routes.ts
        midias.controller.ts
        midias.service.ts
        midias.repository.ts
        midias.rules.ts
        midias.mapper.ts
        dto/

      categorias/
        categorias.routes.ts
        categorias.controller.ts
        categorias.service.ts
        categorias.repository.ts
        categorias.rules.ts
        categorias.mapper.ts
        dto/

      configuracoes-site/
        configuracoes-site.routes.ts
        configuracoes-site.controller.ts
        configuracoes-site.service.ts
        configuracoes-site.repository.ts
        configuracoes-site.rules.ts
        configuracoes-site.mapper.ts
        dto/
```

## Idioma do Codigo

Como o projeto sera mantido por pessoas que falam portugues, os nomes ligados ao
dominio do negocio devem ficar em portugues.

Usar portugues para:

- nomes de modulos de negocio;
- nomes de classes;
- nomes de metodos;
- nomes de DTOs;
- nomes de regras;
- nomes de variaveis de dominio;
- mensagens de erro de negocio.

Exemplos:

```ts
class NoticiasService {
  async listarPublicadas() {}
  async buscarPorSlug(slug: string) {}
  async criarNoticia(dto: CriarNoticiaRequestDto) {}
  async atualizarNoticia(id: string, dto: AtualizarNoticiaRequestDto) {}
  async publicarNoticia(id: string) {}
  async arquivarNoticia(id: string) {}
}
```

```ts
class ComerciosRules {
  validarPodePublicar(comercio: Comercio) {}
  deveExibirPagina(comercio: Comercio) {}
  deveExibirWhatsapp(comercio: Comercio) {}
  validarDestaquePatrocinado(comercio: Comercio) {}
}
```

Evitar misturar idiomas no mesmo conceito.

```txt
Evitar:
- getNoticias
- createNoticia
- listarNews
- negocioDetalheResponseDto

Preferir:
- listarNoticias
- criarNoticia
- buscarNoticiaPorSlug
- ComercioDetalheResponseDto
```

Termos tecnicos comuns do ecossistema podem permanecer em ingles quando forem
convencao do framework ou da arquitetura:

- controller;
- service;
- repository;
- routes;
- middleware;
- request;
- response;
- mapper;
- schema.

Os arquivos podem combinar o nome do dominio em portugues com o sufixo tecnico
em ingles:

```txt
modules/
  noticias/
    noticias.routes.ts
    noticias.controller.ts
    noticias.service.ts
    noticias.repository.ts
    noticias.rules.ts
    noticias.mapper.ts
    dto/
      criar-noticia.request.dto.ts
      atualizar-noticia.request.dto.ts
      listar-noticias.query.dto.ts
      noticia-resumo.response.dto.ts
      noticia-detalhe.response.dto.ts

  comercios/
    comercios.routes.ts
    comercios.controller.ts
    comercios.service.ts
    comercios.repository.ts
    comercios.rules.ts
    comercios.mapper.ts
    dto/
      criar-comercio.request.dto.ts
      atualizar-comercio.request.dto.ts
      comercio-resumo.response.dto.ts
      comercio-detalhe.response.dto.ts
```

O objetivo e que a regra de negocio seja facil de ler por quem conhece o portal,
mesmo sem fluencia em ingles.

## Fluxo Padrao de uma Requisicao

```txt
Route
  -> Controller
  -> Request DTO / validacao
  -> Service
  -> Rules
  -> Repository
  -> Prisma / MySQL
  -> Mapper
  -> Response DTO
```

## Responsabilidade de Cada Camada

### Routes

As rotas definem os endpoints HTTP e aplicam middlewares especificos.

Nao devem conter regra de negocio.

Exemplos:

- registrar `GET /api/noticias`;
- registrar `POST /api/admin/noticias`;
- aplicar middleware de autenticacao em rotas administrativas.

### Controllers

Controllers recebem `req`, `res` e `next`, validam a entrada usando DTOs de
request, chamam services e retornam a resposta.

Controllers devem ser magros.

Nao colocar no controller:

- regra de negocio;
- consulta direta ao Prisma;
- montagem manual complexa de resposta;
- validacoes duplicadas que pertencem ao DTO ou ao modulo de regras.

### Request DTOs

Request DTOs definem e validam o contrato de entrada da API.

Devem ser usados para:

- body;
- params;
- query string.

Exemplos:

- `criar-noticia.request.dto.ts`;
- `atualizar-comercio.request.dto.ts`;
- `listar-noticias.query.dto.ts`;
- `login.request.dto.ts`.

Zod deve ser usado como ferramenta principal de validacao.

### Response DTOs

Response DTOs definem exatamente o que o backend entrega para o frontend.

Eles evitam vazamento de campos internos e tornam o contrato da API previsivel.

Exemplos:

- `noticia-resumo.response.dto.ts`;
- `noticia-detalhe.response.dto.ts`;
- `comercio-resumo.response.dto.ts`;
- `comercio-detalhe.response.dto.ts`.

Listagens e detalhes nao precisam devolver os mesmos campos.

### Services

Services representam os casos de uso da aplicacao.

Exemplos:

- criar noticia;
- publicar noticia;
- listar noticias publicadas;
- atualizar comercio;
- listar eventos futuros;
- encerrar oportunidade vencida.

Services podem orquestrar repositories, rules e mappers.

### Rules

Arquivos `*.rules.ts` centralizam regras de negocio de cada modulo.

Esse ponto e essencial para evitar manutencao dificil. Regra de negocio nao deve
ficar espalhada em componentes do frontend, controllers ou repositories.

Exemplos de regras:

```txt
noticias.rules.ts
- noticia publicada precisa ter titulo, resumo, categoria e corpo;
- slug deve ser unico;
- conteudo patrocinado precisa ser identificado;
- conteudo de demonstracao deve permanecer marcado como demonstracao.

comercios.rules.ts
- pagina comercial so pode abrir quando hasPage = true;
- contatos ausentes devem ser omitidos;
- WhatsApp so deve aparecer quando houver numero cadastrado;
- comercio patrocinado precisa exibir rotulo claro.

eventos.rules.ts
- evento com data passada e encerrado;
- evento com data futura aparece em proximos eventos;
- evento precisa ter fonte ou contato quando publicado.

oportunidades.rules.ts
- prazo vencido significa inscricoes encerradas;
- link de inscricao so aparece se existir e se a oportunidade estiver aberta.

contatos.rules.ts
- formulario so pode enviar se houver destino real configurado;
- sugestoes e correcoes devem ficar registradas para triagem;
- nao simular sucesso quando envio externo estiver desativado.

anuncios.rules.ts
- pedido de anuncio nao define preco automaticamente;
- destaque patrocinado precisa ser identificado no frontend publico;
- nenhum fluxo deve prometer alcance, venda ou resultado.

midias.rules.ts
- imagem precisa ter origem/credito quando usada como conteudo editorial;
- nao usar foto de outra cidade como se fosse de Alvaraes;
- placeholders so devem aparecer quando nao houver imagem real autorizada.
```

### Repositories

Repositories sao responsaveis pelo acesso ao banco.

Podem chamar Prisma, montar filtros de consulta e persistir dados.

Nao devem conter regra de negocio.

### Mappers

Mappers transformam dados do banco em DTOs de resposta.

Devem ser usados para:

- esconder campos internos;
- formatar resposta publica;
- montar respostas diferentes para listagem e detalhe;
- evitar duplicacao de transformacoes no frontend.

## Regra Principal

```txt
Controller nao tem regra de negocio.
Repository nao tem regra de negocio.
Frontend nao duplica regra de negocio.
Regra fica centralizada em service/rules.
Entrada passa por Request DTO.
Saida passa por Mapper e Response DTO.
```

## Modulos Iniciais

### Auth

Responsavel por login administrativo e protecao das rotas de painel.

Na primeira versao, nao deve existir login para visitantes.

### News

Responsavel por noticias, artigos, categorias editoriais, status de publicacao,
fontes, credito de imagem e identificacao de conteudo patrocinado ou opinativo.

Deve suportar:

- busca por titulo e resumo;
- filtro por categoria;
- materia em destaque na pagina inicial;
- artigos relacionados, preferencialmente pela mesma categoria;
- data de publicacao e data de atualizacao;
- autor;
- resumo;
- corpo em blocos ou formato estruturado;
- imagem, texto alternativo e credito;
- fontes;
- tipo de conteudo, como opiniao ou patrocinado;
- status editorial, como rascunho e publicado;
- marcador de conteudo de demonstracao quando existir.

### Businesses

Responsavel pelo guia comercial.

Deve suportar:

- cadastro basico;
- pagina comercial completa;
- link externo;
- destaque patrocinado;
- contatos opcionais;
- busca por nome;
- filtro por categoria;
- area, bairro ou localizacao resumida;
- descricao;
- produtos e servicos;
- horarios informados;
- endereco ou ponto de referencia;
- telefone;
- WhatsApp;
- redes sociais;
- imagens do estabelecimento;
- status de publicacao;
- marcador de conteudo de demonstracao quando existir.

Campos ausentes devem ser omitidos nas respostas publicas.

### Events

Responsavel pela agenda da cidade.

Deve distinguir eventos futuros de eventos encerrados com base na data.

Deve suportar:

- titulo;
- categoria;
- data;
- horario opcional;
- local;
- organizador;
- descricao;
- informacao de entrada;
- contato ou fonte;
- status de publicacao;
- marcador de conteudo de demonstracao quando existir.

### Opportunities

Responsavel por cursos, vagas e oportunidades.

Deve distinguir inscricoes abertas e encerradas com base no prazo.

Deve suportar:

- titulo;
- instituicao, empregador ou organizador;
- modalidade presencial, online ou hibrida;
- local opcional;
- prazo de inscricao;
- requisitos opcionais;
- custo quando informado;
- link de inscricao opcional;
- status de publicacao;
- marcador de conteudo de demonstracao quando existir.

### Contatos

Responsavel por sugestoes de pauta, correcoes e mensagens enviadas pelo portal.

Na tela atual, o formulario esta desativado porque ainda nao existe destino real
para as mensagens. Quando o backend for criado, este modulo deve permitir:

- cadastrar sugestao de pauta;
- cadastrar pedido de correcao;
- cadastrar mensagem geral;
- armazenar nome, contato para resposta, assunto e mensagem;
- marcar status de triagem, como novo, em analise, respondido ou arquivado;
- opcionalmente enviar notificacao para e-mail ou WhatsApp oficial quando esses
  dados forem fornecidos.

### Anuncios

Responsavel pelos pedidos de inclusao de comercio e interesse em anuncio.

Deve suportar:

- pedido de cadastro basico;
- pedido de pagina comercial completa;
- pedido de destaque patrocinado;
- dados do responsavel;
- dados iniciais do estabelecimento;
- status comercial, como novo, em contato, convertido ou arquivado.

Este modulo nao deve definir precos automaticamente nem prometer resultados.

### Midias

Responsavel por imagens e arquivos usados no portal.

Deve suportar:

- imagem de noticia;
- galeria de comercio;
- texto alternativo;
- credito;
- origem/autorizacao;
- vinculo com modulo de origem;
- status ativo/inativo.

No inicio, se o upload direto nao for implementado, pode armazenar apenas URLs de
imagens autorizadas.

### Categorias

Responsavel por categorias reutilizaveis.

Deve suportar categorias para:

- noticias;
- comercios;
- eventos;
- oportunidades, se necessario.

Categorias podem comecar como dados controlados pelo backend para evitar strings
fixas espalhadas no frontend.

### Configuracoes do Site

Responsavel por configuracoes publicas do portal.

Deve suportar:

- nome do portal;
- dominio;
- slogan;
- texto de independencia editorial;
- e-mail oficial, quando existir;
- WhatsApp oficial, quando existir;
- links sociais, quando existirem;
- configuracao para habilitar ou desabilitar formulario de contato;
- configuracao para exibir ou bloquear conteudos de demonstracao em producao.

### Paginas Estaticas

As paginas Sobre, Anuncie e Politica de Privacidade podem continuar hardcoded no
frontend na primeira versao.

Se houver necessidade de editar esses textos pelo painel, criar um modulo
`paginas-estaticas` com slug, titulo, conteudo, meta title e meta description.

## Endpoints Publicos Esperados

O frontend atual precisa, no minimo, destes endpoints publicos:

```txt
GET /api/home
GET /api/noticias
GET /api/noticias/:slug
GET /api/comercios
GET /api/comercios/:slug
GET /api/eventos
GET /api/oportunidades
GET /api/categorias
GET /api/configuracoes-site
```

`GET /api/home` deve entregar a composicao da pagina inicial sem obrigar o
frontend a duplicar regra de destaque, recentes, eventos futuros ou historias de
cultura.

Exemplo de responsabilidades do endpoint de home:

- noticia principal;
- noticias recentes;
- comercios em destaque ou primeiros comercios publicados;
- oportunidades abertas;
- proximos eventos;
- historias de cultura;
- chamadas institucionais configuradas.

## Endpoints Administrativos Esperados

Rotas administrativas devem ficar protegidas por autenticacao.

```txt
POST /api/admin/autenticacao/login
POST /api/admin/autenticacao/logout
GET /api/admin/me

GET /api/admin/noticias
POST /api/admin/noticias
PUT /api/admin/noticias/:id
DELETE /api/admin/noticias/:id
PATCH /api/admin/noticias/:id/publicar

GET /api/admin/comercios
POST /api/admin/comercios
PUT /api/admin/comercios/:id
DELETE /api/admin/comercios/:id

GET /api/admin/eventos
POST /api/admin/eventos
PUT /api/admin/eventos/:id
DELETE /api/admin/eventos/:id

GET /api/admin/oportunidades
POST /api/admin/oportunidades
PUT /api/admin/oportunidades/:id
DELETE /api/admin/oportunidades/:id

GET /api/admin/contatos
PATCH /api/admin/contatos/:id/status

GET /api/admin/anuncios
PATCH /api/admin/anuncios/:id/status

GET /api/admin/configuracoes-site
PUT /api/admin/configuracoes-site
```

## Cuidados de Negocio

O Alvaraes Moderna e um portal independente. O backend e o frontend devem
respeitar estes cuidados:

- nao apresentar vinculo institucional com a Prefeitura de Alvaraes;
- nao inventar contatos, parceiros, estatisticas, depoimentos ou avaliacoes;
- identificar publicidade e conteudo patrocinado;
- identificar conteudo ficticio de demonstracao quando existir;
- omitir campos sem informacao real;
- nao simular envio de formulario sem destino real;
- nao prometer alcance, vendas ou resultado para anunciantes.

## Publico e Escala

O portal atende um municipio de aproximadamente 15 mil habitantes.

Por isso, a arquitetura deve ser organizada, mas sem complexidade desnecessaria.
Nao usar microsservicos, filas, cache distribuido ou infraestrutura pesada na
primeira versao, a menos que exista uma necessidade real.

## Hospedagem

A primeira opcao de hospedagem planejada e o plano Negocios da Hostinger, usando:

- Node.js Web App para o backend;
- MySQL/MariaDB;
- frontend publicado como site web;
- SSL incluso no plano;
- backups da hospedagem quando disponiveis.

VPS deve ser considerada apenas se o plano compartilhado/gerenciado nao atender
mais ao volume, aos recursos ou as necessidades tecnicas do projeto.

## Padrao Para Novas Funcionalidades

Antes de criar uma nova funcionalidade:

1. Procurar se ja existe modulo, DTO, regra, mapper ou endpoint parecido.
2. Reaproveitar o padrao existente.
3. Criar ou atualizar DTOs de request e response.
4. Centralizar regras no arquivo `*.rules.ts` do modulo.
5. Manter controller simples.
6. Manter repository focado em banco.
7. Garantir que o frontend consuma resposta pronta, sem duplicar regra.

Esse padrao deve ser seguido tambem por outras IAs usadas no projeto.
