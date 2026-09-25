const midiaSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    tipoMidia: { type: "string", enum: ["IMAGEM", "VIDEO"] },
    url: { type: "string", format: "uri" },
    titulo: { type: "string" },
    textoAlternativo: { type: "string" },
    credito: { type: "string" },
    origem: { type: "string" },
    tamanhoBytes: { type: "integer", maximum: 2097152 },
    duracaoSegundos: { type: "integer" },
    ordem: { type: "integer" },
  },
};

const imagemRequestSchema = {
  type: "object",
  required: ["url"],
  properties: {
    url: { type: "string", format: "uri", pattern: "^https?://", maxLength: 500 },
    textoAlternativo: { type: "string", maxLength: 250 },
    credito: { type: "string", maxLength: 250 },
    origem: { type: "string", maxLength: 250 },
    tamanhoBytes: {
      type: "integer",
      maximum: 2097152,
      description: "Tamanho maximo aceito: 2 MB.",
    },
    ordem: { type: "integer", minimum: 0, maximum: 99 },
  },
};

const videoLinkRequestSchema = {
  type: "object",
  required: ["url"],
  nullable: true,
  properties: {
    url: { type: "string", format: "uri", pattern: "^https?://", maxLength: 500 },
    titulo: { type: "string", maxLength: 180 },
    origem: { type: "string", maxLength: 250, example: "YOUTUBE" },
  },
};

const noticiaResumoSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    slug: { type: "string", example: "demonstracao-obras-na-orla" },
    titulo: { type: "string", example: "Demonstracao: mutirao de limpeza reune moradores na orla" },
    resumo: { type: "string" },
    categoria: {
      type: "object",
      properties: {
        id: { type: "string" },
        nome: { type: "string", example: "Comunidade" },
        slug: { type: "string", example: "comunidade" },
      },
    },
    autorNome: { type: "string", example: "Redacao Alvaraes Moderna" },
    tipoConteudo: { type: "string", enum: ["NOTICIA", "OPINIAO", "PATROCINADO"] },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
    destaque: { type: "boolean" },
    demonstracao: { type: "boolean" },
    imagemUrl: { type: "string" },
    imagemAlt: { type: "string" },
    imagemCredito: { type: "string" },
    imagens: {
      type: "array",
      maxItems: 5,
      items: midiaSchema,
    },
    video: midiaSchema,
    publicadoEm: { type: "string", format: "date-time" },
    criadoEm: { type: "string", format: "date-time" },
    alteradoEm: { type: "string", format: "date-time" },
  },
};

const noticiaDetalheSchema = {
  allOf: [
    noticiaResumoSchema,
    {
      type: "object",
      properties: {
        corpo: {
          type: "array",
          items: { type: "string" },
        },
        fontes: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  ],
};

const noticiaRequestSchema = {
  type: "object",
  required: ["titulo", "resumo", "corpo", "autorNome"],
  properties: {
    titulo: { type: "string", minLength: 5, maxLength: 180 },
    slug: { type: "string", minLength: 3, maxLength: 180 },
    resumo: { type: "string", minLength: 10, maxLength: 300 },
    corpo: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    fontes: {
      type: "array",
      items: { type: "string" },
    },
    autorNome: { type: "string", minLength: 2, maxLength: 120 },
    categoriaId: { type: "string" },
    categoriaSlug: { type: "string", example: "comunidade" },
    tipoConteudo: { type: "string", enum: ["NOTICIA", "OPINIAO", "PATROCINADO"] },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
    destaque: { type: "boolean" },
    demonstracao: { type: "boolean" },
    imagemUrl: { type: "string", format: "uri" },
    imagemAlt: { type: "string" },
    imagemCredito: { type: "string" },
    imagens: {
      type: "array",
      maxItems: 5,
      items: imagemRequestSchema,
    },
    video: videoLinkRequestSchema,
  },
};

const respostaListaNoticiasSchema = {
  type: "object",
  properties: {
    dados: {
      type: "array",
      items: noticiaResumoSchema,
    },
  },
};

const respostaDetalheNoticiaSchema = {
  type: "object",
  properties: {
    dados: noticiaDetalheSchema,
  },
};

const parametrosListagem = [
  {
    name: "busca",
    in: "query",
    schema: { type: "string" },
    description: "Busca por titulo ou resumo.",
  },
  {
    name: "categoria",
    in: "query",
    schema: { type: "string" },
    description: "Slug da categoria.",
  },
  {
    name: "destaque",
    in: "query",
    schema: { type: "boolean" },
  },
  {
    name: "pagina",
    in: "query",
    schema: { type: "integer", default: 1 },
  },
  {
    name: "limite",
    in: "query",
    schema: { type: "integer", default: 10, maximum: 50 },
  },
];

const comercioResumoSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    slug: { type: "string", example: "demonstracao-restaurante-beira-rio" },
    nome: { type: "string", example: "Demonstracao - Restaurante Beira Rio" },
    categoria: {
      type: "object",
      properties: {
        id: { type: "string" },
        nome: { type: "string", example: "Alimentacao" },
        slug: { type: "string", example: "alimentacao" },
      },
    },
    area: { type: "string", example: "Centro" },
    telefone: { type: "string" },
    whatsapp: { type: "string" },
    siteExterno: { type: "string" },
    possuiPagina: { type: "boolean" },
    patrocinado: { type: "boolean" },
    demonstracao: { type: "boolean" },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
    criadoEm: { type: "string", format: "date-time" },
    alteradoEm: { type: "string", format: "date-time" },
  },
};

const comercioDetalheSchema = {
  allOf: [
    comercioResumoSchema,
    {
      type: "object",
      properties: {
        descricao: { type: "string" },
        servicos: { type: "array", items: { type: "string" } },
        horarios: { type: "array", items: { type: "string" } },
        endereco: { type: "string" },
        redesSociais: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              url: { type: "string" },
            },
          },
        },
      },
    },
  ],
};

const comercioRequestSchema = {
  type: "object",
  required: ["nome", "categoriaSlug", "area"],
  properties: {
    nome: { type: "string", minLength: 2, maxLength: 160 },
    slug: { type: "string", minLength: 3, maxLength: 180 },
    categoriaId: { type: "string" },
    categoriaSlug: { type: "string", example: "servicos" },
    area: { type: "string", minLength: 2, maxLength: 120 },
    descricao: { type: "string" },
    servicos: { type: "array", items: { type: "string" } },
    horarios: { type: "array", items: { type: "string" } },
    endereco: { type: "string" },
    telefone: { type: "string" },
    whatsapp: { type: "string" },
    redesSociais: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          url: { type: "string", format: "uri" },
        },
      },
    },
    siteExterno: { type: "string", format: "uri" },
    possuiPagina: { type: "boolean" },
    patrocinado: { type: "boolean" },
    demonstracao: { type: "boolean" },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
  },
};

const respostaListaComerciosSchema = {
  type: "object",
  properties: {
    dados: {
      type: "array",
      items: comercioResumoSchema,
    },
  },
};

const respostaDetalheComercioSchema = {
  type: "object",
  properties: {
    dados: comercioDetalheSchema,
  },
};

const parametrosListagemComercios = [
  {
    name: "busca",
    in: "query",
    schema: { type: "string" },
    description: "Busca por nome ou area.",
  },
  {
    name: "categoria",
    in: "query",
    schema: { type: "string" },
    description: "Slug da categoria.",
  },
  {
    name: "patrocinado",
    in: "query",
    schema: { type: "boolean" },
  },
  {
    name: "possuiPagina",
    in: "query",
    schema: { type: "boolean" },
  },
  {
    name: "pagina",
    in: "query",
    schema: { type: "integer", default: 1 },
  },
  {
    name: "limite",
    in: "query",
    schema: { type: "integer", default: 10, maximum: 50 },
  },
];

const eventoResumoSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    titulo: { type: "string", example: "Demonstracao - Festejo comunitario no centro" },
    categoria: {
      type: "object",
      properties: {
        id: { type: "string" },
        nome: { type: "string", example: "Festejo" },
        slug: { type: "string", example: "festejo" },
      },
    },
    data: { type: "string", format: "date-time" },
    horario: { type: "string" },
    local: { type: "string" },
    organizador: { type: "string" },
    entrada: { type: "string" },
    imagens: {
      type: "array",
      maxItems: 5,
      items: midiaSchema,
    },
    video: midiaSchema,
    demonstracao: { type: "boolean" },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
    encerrado: { type: "boolean" },
    criadoEm: { type: "string", format: "date-time" },
    alteradoEm: { type: "string", format: "date-time" },
  },
};

const eventoDetalheSchema = {
  allOf: [
    eventoResumoSchema,
    {
      type: "object",
      properties: {
        descricao: { type: "string" },
        contato: { type: "string" },
        fonte: { type: "string" },
      },
    },
  ],
};

const eventoRequestSchema = {
  type: "object",
  required: ["titulo", "categoriaSlug", "data", "local", "organizador", "descricao", "entrada"],
  properties: {
    titulo: { type: "string", minLength: 3, maxLength: 180 },
    categoriaId: { type: "string" },
    categoriaSlug: { type: "string", example: "festejo" },
    data: { type: "string", format: "date-time" },
    horario: { type: "string" },
    local: { type: "string" },
    organizador: { type: "string" },
    descricao: { type: "string" },
    entrada: { type: "string" },
    contato: { type: "string" },
    fonte: { type: "string" },
    imagens: {
      type: "array",
      maxItems: 5,
      items: imagemRequestSchema,
    },
    video: videoLinkRequestSchema,
    demonstracao: { type: "boolean" },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
  },
};

const respostaListaEventosSchema = {
  type: "object",
  properties: {
    dados: {
      type: "array",
      items: eventoDetalheSchema,
    },
  },
};

const respostaDetalheEventoSchema = {
  type: "object",
  properties: {
    dados: eventoDetalheSchema,
  },
};

const parametrosListagemEventos = [
  {
    name: "busca",
    in: "query",
    schema: { type: "string" },
    description: "Busca por titulo, local ou organizador.",
  },
  {
    name: "categoria",
    in: "query",
    schema: { type: "string" },
    description: "Slug da categoria.",
  },
  {
    name: "situacao",
    in: "query",
    schema: { type: "string", enum: ["FUTURO", "ENCERRADO", "TODOS"], default: "TODOS" },
  },
  {
    name: "pagina",
    in: "query",
    schema: { type: "integer", default: 1 },
  },
  {
    name: "limite",
    in: "query",
    schema: { type: "integer", default: 20, maximum: 50 },
  },
];

const oportunidadeResumoSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    titulo: { type: "string", example: "Demonstracao - Curso basico de informatica" },
    organizador: { type: "string" },
    modalidade: { type: "string", enum: ["PRESENCIAL", "ONLINE", "HIBRIDO"] },
    local: { type: "string" },
    prazo: { type: "string", format: "date-time" },
    custo: { type: "string" },
    linkInscricao: { type: "string", format: "uri" },
    imagens: {
      type: "array",
      maxItems: 5,
      items: midiaSchema,
    },
    video: midiaSchema,
    demonstracao: { type: "boolean" },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
    encerrada: { type: "boolean" },
    criadoEm: { type: "string", format: "date-time" },
    alteradoEm: { type: "string", format: "date-time" },
  },
};

const oportunidadeDetalheSchema = {
  allOf: [
    oportunidadeResumoSchema,
    {
      type: "object",
      properties: {
        requisitos: { type: "string" },
      },
    },
  ],
};

const oportunidadeRequestSchema = {
  type: "object",
  required: ["titulo", "organizador", "modalidade", "prazo"],
  properties: {
    titulo: { type: "string", minLength: 3, maxLength: 180 },
    organizador: { type: "string" },
    modalidade: { type: "string", enum: ["PRESENCIAL", "ONLINE", "HIBRIDO"] },
    local: { type: "string" },
    prazo: { type: "string", format: "date-time" },
    requisitos: { type: "string" },
    custo: { type: "string" },
    linkInscricao: { type: "string", format: "uri" },
    imagens: {
      type: "array",
      maxItems: 5,
      items: imagemRequestSchema,
    },
    video: videoLinkRequestSchema,
    categoriaId: { type: "string" },
    categoriaSlug: { type: "string", example: "cursos" },
    demonstracao: { type: "boolean" },
    status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
  },
};

const respostaListaOportunidadesSchema = {
  type: "object",
  properties: {
    dados: {
      type: "array",
      items: oportunidadeDetalheSchema,
    },
  },
};

const respostaDetalheOportunidadeSchema = {
  type: "object",
  properties: {
    dados: oportunidadeDetalheSchema,
  },
};

const parametrosListagemOportunidades = [
  {
    name: "busca",
    in: "query",
    schema: { type: "string" },
    description: "Busca por titulo, organizador ou local.",
  },
  {
    name: "modalidade",
    in: "query",
    schema: { type: "string", enum: ["PRESENCIAL", "ONLINE", "HIBRIDO"] },
  },
  {
    name: "situacao",
    in: "query",
    schema: { type: "string", enum: ["ABERTA", "ENCERRADA", "TODAS"], default: "TODAS" },
  },
  {
    name: "pagina",
    in: "query",
    schema: { type: "integer", default: 1 },
  },
  {
    name: "limite",
    in: "query",
    schema: { type: "integer", default: 20, maximum: 50 },
  },
];

const inscritoBoletimSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    nome: { type: "string", example: "Maria Silva" },
    email: { type: "string", format: "email", example: "maria@example.com" },
    origem: { type: "string", example: "site" },
    ativo: { type: "boolean" },
    criadoEm: { type: "string", format: "date-time" },
    alteradoEm: { type: "string", format: "date-time" },
  },
};

const previaBoletimSchema = {
  type: "object",
  properties: {
    titulo: { type: "string", example: "Boa semana, Alvaraes!" },
    saudacao: { type: "string" },
    periodo: {
      type: "object",
      properties: {
        inicio: { type: "string", format: "date-time" },
        fim: { type: "string", format: "date-time" },
      },
    },
    contagemInscritos: { type: "integer", example: 2 },
    noticiasDaSemana: {
      type: "array",
      items: noticiaResumoSchema,
    },
    agendaProximosDias: {
      type: "array",
      items: eventoResumoSchema,
    },
    inscricoesAbertas: {
      type: "array",
      items: oportunidadeResumoSchema,
    },
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Alvaraes Moderna API",
    version: "0.1.0",
    description: "API do portal Alvaraes Moderna.",
  },
  servers: [
    {
      url: "http://localhost:3333",
      description: "Ambiente local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: [
    {
      name: "Saude",
      description: "Endpoints para verificar disponibilidade da API.",
    },
    {
      name: "Auth",
      description: "Endpoints de autenticacao administrativa.",
    },
    {
      name: "Admin",
      description: "Endpoints gerais do painel administrativo.",
    },
    {
      name: "Noticias",
      description: "Endpoints publicos de noticias.",
    },
    {
      name: "Admin Noticias",
      description: "Endpoints administrativos de noticias. Serao protegidos no Dia 6.",
    },
    {
      name: "Comercios",
      description: "Endpoints publicos do guia comercial.",
    },
    {
      name: "Admin Comercios",
      description: "Endpoints administrativos de comercios. Serao protegidos no Dia 6.",
    },
    {
      name: "Eventos",
      description: "Endpoints publicos da agenda.",
    },
    {
      name: "Admin Eventos",
      description: "Endpoints administrativos de eventos. Serao protegidos no Dia 6.",
    },
    {
      name: "Oportunidades",
      description: "Endpoints publicos de cursos e oportunidades.",
    },
    {
      name: "Admin Oportunidades",
      description: "Endpoints administrativos de oportunidades. Serao protegidos no Dia 6.",
    },
    {
      name: "Boletim",
      description: "Endpoints publicos do boletim semanal.",
    },
    {
      name: "Admin Boletim",
      description: "Endpoints administrativos de inscritos no boletim.",
    },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Realiza login administrativo",
        operationId: "loginAdmin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: { type: "string", format: "email" },
                  senha: { type: "string", minLength: 8 },
                },
              },
              example: {
                email: "admin@alvaraesmoderna.com.br",
                senha: "admin123456",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login realizado",
          },
          "401": {
            description: "Credenciais invalidas",
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Retorna usuario autenticado",
        operationId: "buscarUsuarioAutenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Usuario autenticado",
          },
          "401": {
            description: "Token ausente, invalido ou expirado",
          },
        },
      },
    },
    "/api/admin/resumo": {
      get: {
        tags: ["Admin"],
        summary: "Retorna resumo do painel administrativo",
        operationId: "buscarResumoAdmin",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Resumo do painel",
          },
          "401": {
            description: "Token ausente, invalido ou expirado",
          },
        },
      },
    },
    "/api/boletim/previa": {
      get: {
        tags: ["Boletim"],
        summary: "Monta a previa automatica do boletim semanal",
        operationId: "montarPreviaBoletim",
        responses: {
          "200": {
            description: "Previa do boletim",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { dados: previaBoletimSchema },
                },
              },
            },
          },
        },
      },
    },
    "/api/boletim/inscrever": {
      post: {
        tags: ["Boletim"],
        summary: "Inscreve um leitor no boletim semanal",
        operationId: "inscreverBoletim",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email"],
                properties: {
                  nome: { type: "string", minLength: 2, maxLength: 120 },
                  email: { type: "string", format: "email", maxLength: 180 },
                },
              },
              example: {
                nome: "Maria Silva",
                email: "maria.silva@example.com",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Inscricao criada",
          },
          "409": {
            description: "E-mail ja inscrito",
          },
        },
      },
    },
    "/api/admin/boletim/inscritos": {
      get: {
        tags: ["Admin Boletim"],
        summary: "Lista inscritos ativos no boletim",
        operationId: "listarInscritosBoletim",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Inscritos encontrados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    dados: {
                      type: "array",
                      items: inscritoBoletimSchema,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/boletim/inscritos/{id}": {
      delete: {
        tags: ["Admin Boletim"],
        summary: "Remove inscrito do boletim",
        operationId: "removerInscritoBoletim",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Inscrito removido",
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["Saude"],
        summary: "Verifica se a API esta online",
        operationId: "verificarSaude",
        responses: {
          "200": {
            description: "API online",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "servico", "horario"],
                  properties: {
                    status: { type: "string", example: "ok" },
                    servico: { type: "string", example: "alvaraes-moderna-backend" },
                    horario: {
                      type: "string",
                      format: "date-time",
                      example: "2026-09-09T02:26:44.944Z",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/noticias": {
      get: {
        tags: ["Noticias"],
        summary: "Lista noticias publicadas",
        operationId: "listarNoticiasPublicadas",
        parameters: [...parametrosListagem, {
          name: "ordenacao", in: "query",
          schema: { type: "string", enum: ["MAIS_RECENTES", "MAIS_ANTIGAS", "MAIS_LIDAS"], default: "MAIS_RECENTES" },
          description: "Mais lidas considera somente notícias publicadas com leituras registradas, em ordem decrescente do total acumulado.",
        }],
        responses: {
          "200": {
            description: "Noticias publicadas",
            content: {
              "application/json": {
                schema: respostaListaNoticiasSchema,
              },
            },
          },
        },
      },
    },
    "/api/noticias/{slug}/leituras": {
      post: {
        tags: ["Noticias"],
        summary: "Registra uma leitura da notícia publicada",
        description: "No máximo uma leitura por notícia, navegador e dia em America/Manaus. O portal envia após cinco segundos visíveis. Não representa pessoas únicas.",
        operationId: "registrarLeituraNoticia",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["clienteId"],
          properties: { clienteId: { type: "string", minLength: 16, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$", example: "550e8400-e29b-41d4-a716-446655440000" } },
        } } } },
        responses: {
          "200": { description: "Leitura registrada ou já contabilizada neste dia", content: { "application/json": { schema: {
            type: "object", properties: { dados: { type: "object", properties: { registrada: { type: "boolean" } } } },
          } } } },
          "400": { description: "Identificador inválido" },
          "404": { description: "Notícia inexistente ou não publicada" },
        },
      },
    },
    "/api/noticias/{slug}": {
      get: {
        tags: ["Noticias"],
        summary: "Busca noticia publicada por slug",
        operationId: "buscarNoticiaPublicadaPorSlug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Noticia encontrada",
            content: {
              "application/json": {
                schema: respostaDetalheNoticiaSchema,
              },
            },
          },
          "404": {
            description: "Noticia nao encontrada",
          },
        },
      },
    },
    "/api/admin/noticias": {
      get: {
        tags: ["Admin Noticias"],
        summary: "Lista noticias para administracao",
        operationId: "listarNoticiasAdministracao",
        parameters: [
          ...parametrosListagem,
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
          },
        ],
        responses: {
          "200": {
            description: "Noticias encontradas",
            content: {
              "application/json": {
                schema: respostaListaNoticiasSchema,
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin Noticias"],
        summary: "Cria noticia",
        operationId: "criarNoticia",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: noticiaRequestSchema,
              example: {
                titulo: "Demonstracao: nova feira comunitaria sera realizada no centro",
                resumo:
                  "Exemplo de noticia para testar o cadastro administrativo, a listagem publica e a pagina de detalhe.",
                corpo: [
                  "Este e um conteudo ficticio criado apenas para testar o endpoint de noticias no Swagger.",
                  "Em uma publicacao real, este espaco traria informacoes apuradas, fonte identificada e dados conferidos antes da publicacao.",
                  "Use este exemplo para validar criacao, edicao, publicacao e exclusao de noticias no painel administrativo.",
                ],
                fontes: ["Conteudo ficticio - exemplo para teste local"],
                autorNome: "Redacao Alvaraes Moderna",
                categoriaSlug: "comunidade",
                status: "RASCUNHO",
                tipoConteudo: "NOTICIA",
                destaque: false,
                demonstracao: true,
                imagemAlt: "Espaco reservado para fotografia local de Alvaraes",
                imagemCredito: "Imagem ainda nao fornecida - teste local",
                imagens: [
                  {
                    url: "https://example.com/imagens/noticia-feira-1.jpg",
                    textoAlternativo: "Moradores organizando feira comunitaria no centro",
                    credito: "Arquivo de teste",
                    origem: "UPLOAD_ADMIN",
                    tamanhoBytes: 980000,
                    ordem: 0,
                  },
                  {
                    url: "https://example.com/imagens/noticia-feira-2.jpg",
                    textoAlternativo: "Barracas de produtos regionais em area publica",
                    credito: "Arquivo de teste",
                    origem: "UPLOAD_ADMIN",
                    tamanhoBytes: 1250000,
                    ordem: 1,
                  },
                ],
                video: {
                  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  titulo: "Video de demonstracao da noticia",
                  origem: "YOUTUBE",
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Noticia criada",
            content: {
              "application/json": {
                schema: respostaDetalheNoticiaSchema,
              },
            },
          },
        },
      },
    },
    "/api/admin/noticias/{id}": {
      put: {
        tags: ["Admin Noticias"],
        summary: "Atualiza noticia",
        operationId: "atualizarNoticia",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: noticiaRequestSchema,
            },
          },
        },
        responses: {
          "200": {
            description: "Noticia atualizada",
            content: {
              "application/json": {
                schema: respostaDetalheNoticiaSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin Noticias"],
        summary: "Exclui noticia",
        operationId: "excluirNoticia",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Noticia excluida",
          },
        },
      },
    },
    "/api/admin/noticias/{id}/publicar": {
      patch: {
        tags: ["Admin Noticias"],
        summary: "Publica noticia",
        operationId: "publicarNoticia",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Noticia publicada",
            content: {
              "application/json": {
                schema: respostaDetalheNoticiaSchema,
              },
            },
          },
        },
      },
    },
    "/api/comercios": {
      get: {
        tags: ["Comercios"],
        summary: "Lista comercios publicados",
        operationId: "listarComerciosPublicados",
        parameters: parametrosListagemComercios,
        responses: {
          "200": {
            description: "Comercios publicados",
            content: {
              "application/json": {
                schema: respostaListaComerciosSchema,
              },
            },
          },
        },
      },
    },
    "/api/comercios/{slug}": {
      get: {
        tags: ["Comercios"],
        summary: "Busca comercio publicado por slug",
        operationId: "buscarComercioPublicadoPorSlug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Comercio encontrado",
            content: {
              "application/json": {
                schema: respostaDetalheComercioSchema,
              },
            },
          },
          "404": {
            description: "Comercio nao encontrado ou sem pagina completa.",
          },
        },
      },
    },
    "/api/admin/comercios": {
      get: {
        tags: ["Admin Comercios"],
        summary: "Lista comercios para administracao",
        operationId: "listarComerciosAdministracao",
        parameters: [
          ...parametrosListagemComercios,
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
          },
        ],
        responses: {
          "200": {
            description: "Comercios encontrados",
            content: {
              "application/json": {
                schema: respostaListaComerciosSchema,
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin Comercios"],
        summary: "Cria comercio",
        operationId: "criarComercio",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: comercioRequestSchema,
              example: {
                nome: "Demonstracao - Loja de Materiais do Centro",
                categoriaSlug: "comercio",
                area: "Centro",
                descricao:
                  "Cadastro ficticio criado apenas para testar o modulo de comercios no Swagger.",
                servicos: ["Materiais de construcao", "Ferramentas", "Entrega sob consulta"],
                horarios: ["Segunda a sexta, horario a informar"],
                endereco: "Endereco de exemplo - substituir por dado real",
                telefone: "97999990000",
                whatsapp: "5597999990000",
                redesSociais: [
                  {
                    label: "Instagram",
                    url: "https://example.com/alvaraes-moderna",
                  },
                ],
                siteExterno: "https://example.com",
                possuiPagina: true,
                patrocinado: false,
                demonstracao: true,
                status: "RASCUNHO",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Comercio criado",
            content: {
              "application/json": {
                schema: respostaDetalheComercioSchema,
              },
            },
          },
        },
      },
    },
    "/api/admin/comercios/{id}": {
      put: {
        tags: ["Admin Comercios"],
        summary: "Atualiza comercio",
        operationId: "atualizarComercio",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: comercioRequestSchema,
            },
          },
        },
        responses: {
          "200": {
            description: "Comercio atualizado",
            content: {
              "application/json": {
                schema: respostaDetalheComercioSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin Comercios"],
        summary: "Exclui comercio",
        operationId: "excluirComercio",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Comercio excluido",
          },
        },
      },
    },
    "/api/admin/comercios/{id}/publicar": {
      patch: {
        tags: ["Admin Comercios"],
        summary: "Publica comercio",
        operationId: "publicarComercio",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Comercio publicado",
            content: {
              "application/json": {
                schema: respostaDetalheComercioSchema,
              },
            },
          },
        },
      },
    },
    "/api/eventos": {
      get: {
        tags: ["Eventos"],
        summary: "Lista eventos publicados",
        operationId: "listarEventosPublicados",
        parameters: parametrosListagemEventos,
        responses: {
          "200": {
            description: "Eventos publicados",
            content: {
              "application/json": {
                schema: respostaListaEventosSchema,
              },
            },
          },
        },
      },
    },
    "/api/admin/eventos": {
      get: {
        tags: ["Admin Eventos"],
        summary: "Lista eventos para administracao",
        operationId: "listarEventosAdministracao",
        parameters: [
          ...parametrosListagemEventos,
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
          },
        ],
        responses: {
          "200": {
            description: "Eventos encontrados",
            content: {
              "application/json": {
                schema: respostaListaEventosSchema,
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin Eventos"],
        summary: "Cria evento",
        operationId: "criarEvento",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: eventoRequestSchema,
              example: {
                titulo: "Demonstracao - Reuniao comunitaria no centro",
                categoriaSlug: "festejo",
                data: "2026-10-20T23:00:00.000Z",
                horario: "19h",
                local: "Local de exemplo - substituir por dado real",
                organizador: "Organizacao ficticia",
                descricao:
                  "Cadastro ficticio criado apenas para testar o modulo de eventos no Swagger.",
                entrada: "Entrada gratuita",
                contato: "Contato de exemplo - substituir por dado real",
                fonte: "Conteudo ficticio - teste local",
                imagens: [
                  {
                    url: "https://example.com/imagens/evento-comunitario-1.jpg",
                    textoAlternativo: "Moradores reunidos em evento comunitario",
                    credito: "Arquivo de teste",
                    origem: "UPLOAD_ADMIN",
                    tamanhoBytes: 850000,
                    ordem: 0,
                  },
                ],
                video: {
                  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  titulo: "Video de demonstracao do evento",
                  origem: "YOUTUBE",
                },
                demonstracao: true,
                status: "RASCUNHO",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Evento criado",
            content: {
              "application/json": {
                schema: respostaDetalheEventoSchema,
              },
            },
          },
        },
      },
    },
    "/api/admin/eventos/{id}": {
      put: {
        tags: ["Admin Eventos"],
        summary: "Atualiza evento",
        operationId: "atualizarEvento",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: eventoRequestSchema,
            },
          },
        },
        responses: {
          "200": {
            description: "Evento atualizado",
            content: {
              "application/json": {
                schema: respostaDetalheEventoSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin Eventos"],
        summary: "Exclui evento",
        operationId: "excluirEvento",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Evento excluido",
          },
        },
      },
    },
    "/api/admin/eventos/{id}/publicar": {
      patch: {
        tags: ["Admin Eventos"],
        summary: "Publica evento",
        operationId: "publicarEvento",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Evento publicado",
            content: {
              "application/json": {
                schema: respostaDetalheEventoSchema,
              },
            },
          },
        },
      },
    },
    "/api/oportunidades": {
      get: {
        tags: ["Oportunidades"],
        summary: "Lista oportunidades publicadas",
        operationId: "listarOportunidadesPublicadas",
        parameters: parametrosListagemOportunidades,
        responses: {
          "200": {
            description: "Oportunidades publicadas",
            content: {
              "application/json": {
                schema: respostaListaOportunidadesSchema,
              },
            },
          },
        },
      },
    },
    "/api/admin/oportunidades": {
      get: {
        tags: ["Admin Oportunidades"],
        summary: "Lista oportunidades para administracao",
        operationId: "listarOportunidadesAdministracao",
        parameters: [
          ...parametrosListagemOportunidades,
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] },
          },
        ],
        responses: {
          "200": {
            description: "Oportunidades encontradas",
            content: {
              "application/json": {
                schema: respostaListaOportunidadesSchema,
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin Oportunidades"],
        summary: "Cria oportunidade",
        operationId: "criarOportunidade",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: oportunidadeRequestSchema,
              example: {
                titulo: "Demonstracao - Oficina de atendimento ao publico",
                organizador: "Instituicao ficticia",
                modalidade: "PRESENCIAL",
                local: "Local de exemplo - substituir por dado real",
                prazo: "2026-10-30T03:59:00.000Z",
                requisitos:
                  "Cadastro ficticio criado apenas para testar o modulo de oportunidades no Swagger.",
                custo: "Gratuito",
                linkInscricao: "https://example.com/oficina-atendimento",
                categoriaSlug: "cursos",
                imagens: [
                  {
                    url: "https://example.com/imagens/oficina-atendimento-1.jpg",
                    textoAlternativo: "Participantes em oficina de capacitacao",
                    credito: "Arquivo de teste",
                    origem: "UPLOAD_ADMIN",
                    tamanhoBytes: 920000,
                    ordem: 0,
                  },
                ],
                video: {
                  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  titulo: "Video de demonstracao da oportunidade",
                  origem: "YOUTUBE",
                },
                demonstracao: true,
                status: "RASCUNHO",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Oportunidade criada",
            content: {
              "application/json": {
                schema: respostaDetalheOportunidadeSchema,
              },
            },
          },
        },
      },
    },
    "/api/admin/oportunidades/{id}": {
      put: {
        tags: ["Admin Oportunidades"],
        summary: "Atualiza oportunidade",
        operationId: "atualizarOportunidade",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: oportunidadeRequestSchema,
            },
          },
        },
        responses: {
          "200": {
            description: "Oportunidade atualizada",
            content: {
              "application/json": {
                schema: respostaDetalheOportunidadeSchema,
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin Oportunidades"],
        summary: "Exclui oportunidade",
        operationId: "excluirOportunidade",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Oportunidade excluida",
          },
        },
      },
    },
    "/api/admin/oportunidades/{id}/publicar": {
      patch: {
        tags: ["Admin Oportunidades"],
        summary: "Publica oportunidade",
        operationId: "publicarOportunidade",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Oportunidade publicada",
            content: {
              "application/json": {
                schema: respostaDetalheOportunidadeSchema,
              },
            },
          },
        },
      },
    },
  },
};
