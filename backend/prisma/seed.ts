import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123456", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@alvaraesmoderna.com.br" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@alvaraesmoderna.com.br",
      senhaHash,
    },
  });

  await prisma.configuracaoSite.upsert({
    where: { id: "configuracao-principal" },
    update: {},
    create: {
      id: "configuracao-principal",
      textoIndependenciaEditorial:
        "Portal independente, sem vinculo institucional com a Prefeitura de Alvaraes. Publicidade e conteudo patrocinado sao identificados.",
    },
  });

  await prisma.categoria.createMany({
    data: [
      { nome: "Novidades", slug: "novidades", tipo: "NOTICIA", ordem: 1 },
      { nome: "Politica e vida publica", slug: "politica-e-vida-publica", tipo: "NOTICIA", ordem: 2 },
      { nome: "Cultura", slug: "cultura", tipo: "NOTICIA", ordem: 3 },
      { nome: "Comunidade", slug: "comunidade", tipo: "NOTICIA", ordem: 4 },
    ],
    skipDuplicates: true,
  });

  await prisma.categoria.createMany({
    data: [
      { nome: "Alimentacao", slug: "alimentacao", tipo: "COMERCIO", ordem: 1 },
      { nome: "Comercio", slug: "comercio", tipo: "COMERCIO", ordem: 2 },
      { nome: "Servicos", slug: "servicos", tipo: "COMERCIO", ordem: 3 },
      { nome: "Saude", slug: "saude", tipo: "COMERCIO", ordem: 4 },
      { nome: "Transporte", slug: "transporte", tipo: "COMERCIO", ordem: 5 },
    ],
    skipDuplicates: true,
  });

  await prisma.categoria.createMany({
    data: [
      { nome: "Festejo", slug: "festejo", tipo: "EVENTO", ordem: 1 },
      { nome: "Feira", slug: "feira", tipo: "EVENTO", ordem: 2 },
      { nome: "Cultura", slug: "cultura", tipo: "EVENTO", ordem: 3 },
    ],
    skipDuplicates: true,
  });

  await prisma.categoria.createMany({
    data: [
      { nome: "Cursos", slug: "cursos", tipo: "OPORTUNIDADE", ordem: 1 },
      { nome: "Vagas", slug: "vagas", tipo: "OPORTUNIDADE", ordem: 2 },
      { nome: "Inscricoes", slug: "inscricoes", tipo: "OPORTUNIDADE", ordem: 3 },
    ],
    skipDuplicates: true,
  });

  const comunidade = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "comunidade", tipo: "NOTICIA" } },
  });
  const cultura = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "cultura", tipo: "NOTICIA" } },
  });
  const politica = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "politica-e-vida-publica", tipo: "NOTICIA" } },
  });
  const novidades = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "novidades", tipo: "NOTICIA" } },
  });

  await prisma.noticia.upsert({
    where: { slug: "demonstracao-obras-na-orla" },
    update: {},
    create: {
      slug: "demonstracao-obras-na-orla",
      titulo: "Demonstracao: mutirao de limpeza reune moradores na orla",
      resumo:
        "Exemplo de materia para avaliar o layout de noticia em destaque, com resumo curto e imagem editorial.",
      categoriaId: comunidade.id,
      autorNome: "Redacao Alvaraes Moderna",
      publicadoEm: new Date("2026-09-02T12:00:00.000Z"),
      imagemAlt: "Espaco reservado para fotografia local de Alvaraes",
      imagemCredito: "Espaco reservado - foto local ainda nao fornecida",
      destaque: true,
      demonstracao: true,
      status: "PUBLICADO",
      corpo: [
        "Este texto e um exemplo ficticio, criado apenas para avaliar a apresentacao das paginas do portal. Nenhuma informacao aqui descreve fatos reais.",
        "No lugar deste conteudo entrarao materias produzidas pela equipe do Alvaraes Moderna, com apuracao, fontes identificadas e fotografias autorizadas.",
        "O corpo do texto foi pensado para leitura confortavel no celular: linhas curtas, bom contraste e espacamento generoso entre paragrafos.",
      ],
      fontes: ["Conteudo ficticio - sem fonte real"],
    },
  });

  await prisma.noticia.upsert({
    where: { slug: "demonstracao-festival-cultural" },
    update: {},
    create: {
      slug: "demonstracao-festival-cultural",
      titulo: "Demonstracao: festival cultural movimenta o centro da cidade",
      resumo:
        "Exemplo de materia da editoria de Cultura, usado para testar a listagem e as paginas relacionadas.",
      categoriaId: cultura.id,
      autorNome: "Redacao Alvaraes Moderna",
      publicadoEm: new Date("2026-08-28T12:00:00.000Z"),
      imagemAlt: "Espaco reservado para fotografia local de Alvaraes",
      imagemCredito: "Espaco reservado - foto local ainda nao fornecida",
      demonstracao: true,
      status: "PUBLICADO",
      corpo: [
        "Conteudo ficticio de demonstracao. Serve apenas para mostrar como uma materia de cultura aparece no portal.",
        "Aqui entrariam a descricao do evento, depoimentos reais e o registro fotografico feito na cidade.",
      ],
      fontes: ["Conteudo ficticio - sem fonte real"],
    },
  });

  await prisma.noticia.upsert({
    where: { slug: "demonstracao-sessao-camara" },
    update: {},
    create: {
      slug: "demonstracao-sessao-camara",
      titulo: "Demonstracao: sessao discute o orcamento do municipio",
      resumo:
        "Exemplo da editoria de Politica e vida publica, com espaco para fontes identificadas e explicacao de efeitos.",
      categoriaId: politica.id,
      autorNome: "Redacao Alvaraes Moderna",
      publicadoEm: new Date("2026-08-20T12:00:00.000Z"),
      imagemAlt: "Espaco reservado para fotografia local de Alvaraes",
      demonstracao: true,
      status: "PUBLICADO",
      corpo: [
        "Texto ficticio de demonstracao. Nao descreve decisoes, votos ou declaracoes reais de qualquer autoridade.",
        "Em uma materia real, esta secao traria os documentos consultados e a explicacao sobre o efeito pratico da decisao na vida da populacao.",
      ],
      fontes: ["Conteudo ficticio - sem fonte real"],
    },
  });

  await prisma.noticia.upsert({
    where: { slug: "demonstracao-novo-horario-do-transporte" },
    update: {},
    create: {
      slug: "demonstracao-novo-horario-do-transporte",
      titulo: "Demonstracao: novo horario de transporte fluvial e divulgado",
      resumo: "Exemplo da editoria Novidades, usado para verificar a listagem com varios cartoes.",
      categoriaId: novidades.id,
      autorNome: "Redacao Alvaraes Moderna",
      publicadoEm: new Date("2026-08-15T12:00:00.000Z"),
      imagemAlt: "Espaco reservado para fotografia local de Alvaraes",
      demonstracao: true,
      status: "PUBLICADO",
      corpo: ["Conteudo ficticio de demonstracao, criado somente para avaliacao visual do portal."],
      fontes: ["Conteudo ficticio - sem fonte real"],
    },
  });

  const alimentacao = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "alimentacao", tipo: "COMERCIO" } },
  });
  const comercio = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "comercio", tipo: "COMERCIO" } },
  });
  const servicos = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "servicos", tipo: "COMERCIO" } },
  });
  const saude = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "saude", tipo: "COMERCIO" } },
  });
  const transporte = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "transporte", tipo: "COMERCIO" } },
  });

  await prisma.comercio.upsert({
    where: { slug: "demonstracao-restaurante-beira-rio" },
    update: {},
    create: {
      slug: "demonstracao-restaurante-beira-rio",
      nome: "Demonstracao - Restaurante Beira Rio",
      categoriaId: alimentacao.id,
      area: "Centro",
      descricao:
        "Estabelecimento ficticio usado apenas para demonstrar a pagina comercial completa dentro do portal.",
      servicos: ["Almoco", "Peixe assado", "Encomendas"],
      possuiPagina: true,
      patrocinado: true,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.comercio.upsert({
    where: { slug: "demonstracao-mercadinho-do-bairro" },
    update: {},
    create: {
      slug: "demonstracao-mercadinho-do-bairro",
      nome: "Demonstracao - Mercadinho do Bairro",
      categoriaId: comercio.id,
      area: "Bairro Sao Jose",
      possuiPagina: false,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.comercio.upsert({
    where: { slug: "demonstracao-oficina-motor-lago" },
    update: {},
    create: {
      slug: "demonstracao-oficina-motor-lago",
      nome: "Demonstracao - Oficina Motor do Lago",
      categoriaId: servicos.id,
      area: "Orla",
      descricao: "Exemplo de cadastro com pagina interna, sem contatos reais preenchidos.",
      servicos: ["Manutencao de motores", "Pecas"],
      possuiPagina: true,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.comercio.upsert({
    where: { slug: "demonstracao-farmacia-central" },
    update: {},
    create: {
      slug: "demonstracao-farmacia-central",
      nome: "Demonstracao - Farmacia Central",
      categoriaId: saude.id,
      area: "Centro",
      possuiPagina: false,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.comercio.upsert({
    where: { slug: "demonstracao-transporte-fluvial" },
    update: {},
    create: {
      slug: "demonstracao-transporte-fluvial",
      nome: "Demonstracao - Transporte Fluvial Alvaraes",
      categoriaId: transporte.id,
      area: "Porto",
      possuiPagina: false,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  const festejo = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "festejo", tipo: "EVENTO" } },
  });
  const feira = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "feira", tipo: "EVENTO" } },
  });
  const culturaEvento = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "cultura", tipo: "EVENTO" } },
  });
  const cursos = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "cursos", tipo: "OPORTUNIDADE" } },
  });
  const vagas = await prisma.categoria.findUniqueOrThrow({
    where: { slug_tipo: { slug: "vagas", tipo: "OPORTUNIDADE" } },
  });

  await prisma.evento.upsert({
    where: { id: "demo-evento-festejo-comunitario" },
    update: {},
    create: {
      id: "demo-evento-festejo-comunitario",
      titulo: "Demonstracao - Festejo comunitario no centro",
      categoriaId: festejo.id,
      data: new Date("2026-10-12T23:00:00.000Z"),
      horario: "19h",
      local: "Praca central - local de exemplo",
      organizador: "Organizacao ficticia",
      descricao:
        "Evento ficticio criado para testar a agenda publica e a classificacao de eventos futuros.",
      entrada: "Entrada gratuita",
      contato: "Contato de exemplo - substituir por dado real",
      fonte: "Conteudo ficticio - agenda de demonstracao",
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.evento.upsert({
    where: { id: "demo-evento-feira-produtores" },
    update: {},
    create: {
      id: "demo-evento-feira-produtores",
      titulo: "Demonstracao - Feira de produtores locais",
      categoriaId: feira.id,
      data: new Date("2026-11-08T13:00:00.000Z"),
      horario: "9h",
      local: "Area de exemplo proxima ao porto",
      organizador: "Equipe de demonstracao",
      descricao:
        "Cadastro ficticio para validar filtro por categoria, busca e exibicao de informacoes da agenda.",
      entrada: "Livre",
      fonte: "Conteudo ficticio - sem fonte real",
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.evento.upsert({
    where: { id: "demo-evento-encontro-cultural-encerrado" },
    update: {},
    create: {
      id: "demo-evento-encontro-cultural-encerrado",
      titulo: "Demonstracao - Encontro cultural encerrado",
      categoriaId: culturaEvento.id,
      data: new Date("2026-07-20T22:00:00.000Z"),
      horario: "18h",
      local: "Centro cultural de exemplo",
      organizador: "Grupo ficticio",
      descricao:
        "Evento passado usado para testar a classificacao de eventos encerrados no backend.",
      entrada: "Entrada gratuita",
      fonte: "Conteudo ficticio - evento ja encerrado",
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.oportunidade.upsert({
    where: { id: "demo-oportunidade-curso-informatica" },
    update: {},
    create: {
      id: "demo-oportunidade-curso-informatica",
      titulo: "Demonstracao - Curso basico de informatica",
      organizador: "Instituicao ficticia",
      modalidade: "PRESENCIAL",
      local: "Escola de exemplo",
      prazo: new Date("2026-10-30T03:59:00.000Z"),
      requisitos: "Cadastro ficticio. Em uma oportunidade real, informar idade minima e documentos.",
      custo: "Gratuito",
      linkInscricao: "https://example.com/inscricao-curso-informatica",
      categoriaId: cursos.id,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.oportunidade.upsert({
    where: { id: "demo-oportunidade-vaga-atendimento" },
    update: {},
    create: {
      id: "demo-oportunidade-vaga-atendimento",
      titulo: "Demonstracao - Vaga de atendimento",
      organizador: "Comercio ficticio",
      modalidade: "PRESENCIAL",
      local: "Centro",
      prazo: new Date("2026-09-25T03:59:00.000Z"),
      requisitos: "Ensino medio e disponibilidade de horario. Dados apenas para teste.",
      custo: "Sem custo",
      linkInscricao: "https://example.com/vaga-atendimento",
      categoriaId: vagas.id,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.oportunidade.upsert({
    where: { id: "demo-oportunidade-online-encerrada" },
    update: {},
    create: {
      id: "demo-oportunidade-online-encerrada",
      titulo: "Demonstracao - Oficina online encerrada",
      organizador: "Projeto ficticio",
      modalidade: "ONLINE",
      prazo: new Date("2026-08-15T03:59:00.000Z"),
      requisitos: "Acesso a internet. Registro ficticio para testar oportunidade encerrada.",
      custo: "Gratuito",
      linkInscricao: "https://example.com/oficina-online-encerrada",
      categoriaId: cursos.id,
      demonstracao: true,
      status: "PUBLICADO",
    },
  });

  await prisma.inscritoBoletim.upsert({
    where: { email: "morador.demo@alvaraesmoderna.com.br" },
    update: { ativo: true },
    create: {
      nome: "Morador Demonstracao",
      email: "morador.demo@alvaraesmoderna.com.br",
      origem: "seed",
    },
  });

  await prisma.inscritoBoletim.upsert({
    where: { email: "leitora.demo@alvaraesmoderna.com.br" },
    update: { ativo: true },
    create: {
      nome: "Leitora Demonstracao",
      email: "leitora.demo@alvaraesmoderna.com.br",
      origem: "seed",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
