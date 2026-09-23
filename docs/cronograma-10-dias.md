# Cronograma de Desenvolvimento - 10 Dias

Este cronograma organiza a evolucao do Alvaraes Moderna de um frontend com dados
de demonstracao para uma aplicacao web com backend, banco de dados, painel
administrativo e publicacao preparada para a Hostinger.

O prazo considera uma primeira versao funcional, simples e sustentavel, sem
recursos desnecessarios para o tamanho inicial do portal.

## Premissas

- Frontend atual ja existe e sera reaproveitado.
- Backend sera feito em Node.js, Express e TypeScript.
- Banco sera MySQL ou MariaDB.
- ORM sera Prisma.
- Arquitetura seguira MVC modular.
- Regras de negocio ficarao centralizadas em `*.rules.ts`.
- DTOs de request e response serao usados.
- Hospedagem planejada: plano Negocios da Hostinger.
- Nao havera login para visitantes nesta primeira versao.
- Nao havera pagamentos, comentarios publicos ou app mobile nesta primeira
  versao.

## Objetivo ao Final dos 10 Dias

Ao final do cronograma, o projeto deve ter:

- frontend organizado para consumir API;
- backend Express com modulos principais;
- banco modelado com Prisma;
- painel administrativo simples;
- CRUD de noticias, comercios, eventos e oportunidades;
- formulario de contato ou fluxo preparado com aviso correto;
- dados reais substituindo conteudos de demonstracao quando forem fornecidos;
- ambiente preparado para deploy na Hostinger;
- documentacao basica para manutencao.

## Dia 1 - Organizacao do Projeto e Base Tecnica

Objetivo: preparar a estrutura do repositorio para frontend e backend.

Atividades:

- mover o app atual para `frontend/`, preservando funcionamento;
- criar pasta `backend/`;
- iniciar projeto Node.js com TypeScript;
- instalar Express, Prisma, Zod e dependencias base;
- configurar ESLint/Prettier se necessario;
- criar estrutura MVC modular;
- criar `.env.example`;
- configurar `app.ts` e `server.ts`;
- criar rota inicial de saude da API.

Entregaveis:

- estrutura `frontend/` e `backend/`;
- backend iniciando localmente;
- endpoint `GET /api/health`;
- documentacao de como rodar frontend e backend localmente.

## Dia 2 - Banco de Dados e Prisma

Objetivo: modelar a base inicial do banco.

Atividades:

- configurar Prisma com MySQL/MariaDB;
- criar modelos iniciais:
  - `Usuario`;
  - `Noticia`;
  - `Comercio`;
  - `Evento`;
  - `Oportunidade`;
  - `Categoria`;
  - `Midia`;
  - `Contato`;
  - `PedidoAnuncio`;
  - `ConfiguracaoSite`;
- criar enums de status e tipos principais;
- criar primeira migration;
- criar seed com dados de demonstracao;
- configurar Prisma Client.

Entregaveis:

- `prisma/schema.prisma`;
- primeira migration;
- seed inicial;
- conexao local validada com banco.

## Dia 3 - Modulo de Noticias

Objetivo: substituir a estrutura atual de noticias por API.

Atividades:

- criar modulo `noticias`;
- criar DTOs:
  - `criar-noticia.request.dto.ts`;
  - `atualizar-noticia.request.dto.ts`;
  - `listar-noticias.query.dto.ts`;
  - `noticia-resumo.response.dto.ts`;
  - `noticia-detalhe.response.dto.ts`;
- criar `noticias.rules.ts`;
- criar `noticias.mapper.ts`;
- criar repository, service, controller e routes;
- implementar endpoints publicos:
  - `GET /api/noticias`;
  - `GET /api/noticias/:slug`;
- implementar endpoints administrativos basicos:
  - `POST /api/admin/noticias`;
  - `PUT /api/admin/noticias/:id`;
  - `DELETE /api/admin/noticias/:id`;
  - `PATCH /api/admin/noticias/:id/publicar`;
- validar busca, filtro por categoria, destaque e relacionadas.

Entregaveis:

- modulo de noticias completo;
- frontend preparado para consumir noticias pela API ou adaptacao planejada;
- regras de publicacao centralizadas.

## Dia 4 - Modulo de Comercios

Objetivo: implementar o guia comercial no backend.

Atividades:

- criar modulo `comercios`;
- criar DTOs de request, query e response;
- criar `comercios.rules.ts`;
- criar `comercios.mapper.ts`;
- implementar regra de `hasPage`;
- implementar omissao de campos ausentes;
- implementar identificacao de destaque patrocinado;
- implementar busca por nome e filtro por categoria;
- implementar endpoints publicos:
  - `GET /api/comercios`;
  - `GET /api/comercios/:slug`;
- implementar endpoints administrativos de CRUD.

Entregaveis:

- modulo de comercios completo;
- regras de exibicao centralizadas;
- listagem e detalhe prontos para substituir dados locais.

## Dia 5 - Eventos, Cursos e Oportunidades

Objetivo: implementar agenda e oportunidades.

Atividades:

- criar modulo `eventos`;
- criar modulo `oportunidades`;
- criar DTOs, rules, mappers, repositories, services e controllers;
- implementar classificacao de eventos futuros e encerrados;
- implementar classificacao de oportunidades abertas e encerradas;
- garantir que link de inscricao so apareca quando existir e estiver aberto;
- implementar endpoints publicos:
  - `GET /api/eventos`;
  - `GET /api/oportunidades`;
- implementar endpoints administrativos de CRUD.

Entregaveis:

- agenda funcionando via API;
- cursos/oportunidades funcionando via API;
- regras de datas centralizadas no backend.

## Dia 6 - Autenticacao e Painel Administrativo

Objetivo: criar acesso administrativo para manter o portal.

Atividades:

- criar modulo `auth`;
- criar tabela e seed de usuario administrador;
- implementar login;
- definir estrategia JWT ou cookie de sessao;
- criar middleware de autenticacao;
- proteger rotas `/api/admin`;
- iniciar painel administrativo no frontend;
- criar layout simples do painel;
- criar telas iniciais:
  - login;
  - dashboard;
  - listagem de noticias;
  - formulario de noticia.

Entregaveis:

- login administrativo funcional;
- rotas administrativas protegidas;
- base visual do painel.

## Dia 7 - CRUD Administrativo Completo e Boletim Semanal

Objetivo: permitir administracao dos principais conteudos e preparar o boletim
semanal do portal.

Atividades:

- criar telas administrativas para comercios;
- criar telas administrativas para eventos;
- criar telas administrativas para oportunidades;
- criar modulo inicial de boletim;
- montar previa automatica do boletim semanal com:
  - noticias publicadas na semana;
  - eventos recentes e agenda dos proximos dias;
  - cursos, vagas e inscricoes abertas;
  - informacoes gerais relevantes da aplicacao durante a semana;
- criar formulario publico para inscricao no boletim;
- criar tela administrativa para visualizar inscritos;
- preparar exportacao ou listagem dos inscritos para envio manual nesta primeira
  versao;
- implementar criar, editar, publicar/arquivar e excluir quando permitido;
- validar DTOs no backend;
- exibir mensagens de erro de negocio vindas do backend;
- evitar duplicacao de regra no frontend.

Entregaveis:

- painel com manutencao de noticias, comercios, eventos e oportunidades;
- pagina publica do boletim com chamada para inscricao;
- previa semanal do boletim gerada a partir dos conteudos publicados;
- listagem administrativa de inscritos no boletim;
- validacoes centralizadas no backend;
- fluxo de publicacao basico.

## Dia 8 - Contato, Anuncios, Midias e Configuracoes

Objetivo: fechar funcionalidades auxiliares visiveis no frontend.

Atividades:

- criar modulo `contatos`;
- criar modulo `anuncios`;
- criar modulo `midias` ou campos iniciais de imagem por URL;
- criar modulo `configuracoes-site`;
- permitir configurar e-mail e WhatsApp oficial;
- definir se formulario de contato ficara ativo ou desativado;
- criar endpoints:
  - `POST /api/contatos`;
  - `POST /api/anuncios`;
  - `GET /api/site-settings`;
  - `PUT /api/admin/site-settings`;
- criar triagem administrativa para contatos e pedidos de anuncio;
- revisar textos de aviso quando envio estiver desativado.

Entregaveis:

- contato e pedidos de anuncio mapeados no backend;
- configuracoes publicas centralizadas;
- suporte inicial a imagens e creditos.

## Dia 9 - Integracao Final, SEO e Qualidade

Objetivo: trocar dados locais por API e revisar experiencia publica.

Atividades:

- integrar frontend com endpoints publicos;
- substituir arrays de demonstracao por chamadas HTTP;
- manter estados de carregamento e vazio;
- revisar SEO das paginas;
- revisar pagina 404;
- revisar responsividade mobile;
- revisar acessibilidade basica;
- testar busca e filtros;
- testar links internos;
- testar compartilhamento por WhatsApp e copiar link;
- revisar se conteudos ficticios estao identificados ou removidos.

Entregaveis:

- frontend consumindo backend;
- navegacao publica funcionando;
- checklist de qualidade concluido.

## Dia 10 - Deploy, Documentacao e Entrega

Objetivo: preparar publicacao e manutencao.

Atividades:

- preparar variaveis de ambiente de producao;
- configurar banco MySQL/MariaDB da Hostinger;
- configurar Node.js Web App na Hostinger;
- publicar backend;
- publicar frontend;
- configurar dominio/subdominio conforme estrategia escolhida;
- configurar SSL;
- testar rotas publicas em producao;
- testar login administrativo;
- testar CRUD principal;
- revisar backups disponiveis no plano;
- documentar processo de deploy;
- documentar dados necessarios para operacao real.

Entregaveis:

- aplicacao publicada ou pronta para publicacao;
- documentacao de deploy;
- lista do que ainda e demonstracao;
- lista de dados reais pendentes;
- orientacao de manutencao.

## Checklist de Dados Reais Necessarios

Antes da publicacao oficial, fornecer ou revisar:

- e-mail oficial do portal;
- WhatsApp oficial do portal;
- dados reais de comercios;
- autorizacao de uso de imagens;
- creditos das imagens;
- primeiras noticias reais;
- primeiros eventos reais;
- primeiras oportunidades reais;
- textos finais de privacidade;
- regras comerciais para anuncios;
- valores e condicoes, se forem divulgados.

## Fora do Escopo da Primeira Versao

Nao incluir nos 10 dias, salvo decisao explicita:

- app mobile;
- comentarios publicos;
- login de visitantes;
- pagamentos online;
- marketplace;
- notificacoes push;
- multiplos perfis administrativos complexos;
- integracoes pagas;
- automacoes pesadas;
- infraestrutura com VPS, Docker ou filas.

## Riscos e Cuidados

- O prazo de 10 dias depende de os dados reais serem fornecidos rapidamente.
- Upload de imagens pode exigir decisao especifica sobre armazenamento.
- O plano da Hostinger deve ser validado para Node.js App e MySQL antes do
  deploy.
- Conteudos ficticios nao devem ir para producao sem identificacao clara.
- Regras de negocio devem permanecer no backend para evitar manutencao dificil.

## Ordem de Prioridade

Se o prazo apertar, priorizar nesta ordem:

1. Backend e banco funcionando.
2. Noticias.
3. Comercios.
4. Eventos e oportunidades.
5. Painel administrativo basico.
6. Contato e pedidos de anuncio.
7. Upload/gestao de midias.
8. Ajustes visuais finos.
