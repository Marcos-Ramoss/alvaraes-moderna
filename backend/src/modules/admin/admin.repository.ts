import { prisma } from "../../database/prisma.js";

export class AdminRepository {
  async buscarResumo() {
    const [
      noticias,
      comercios,
      eventos,
      oportunidades,
      usuarios,
      noticiasDemo,
      comerciosDemo,
      eventosDemo,
      oportunidadesDemo,
      inscritosBoletim,
      contatos,
      pedidosAnuncio,
      noticiasRecentes,
    ] = await Promise.all([
      prisma.noticia.count(),
      prisma.comercio.count(),
      prisma.evento.count(),
      prisma.oportunidade.count(),
      prisma.usuario.count(),
      prisma.noticia.count({ where: { demonstracao: true } }),
      prisma.comercio.count({ where: { demonstracao: true } }),
      prisma.evento.count({ where: { demonstracao: true } }),
      prisma.oportunidade.count({ where: { demonstracao: true } }),
      prisma.inscritoBoletim.count({ where: { ativo: true } }),
      prisma.contato.count(),
      prisma.pedidoAnuncio.count(),
      prisma.noticia.findMany({
        where: { status: "PUBLICADO" },
        orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
        take: 5,
        select: {
          id: true,
          slug: true,
          titulo: true,
          publicadoEm: true,
          criadoEm: true,
          status: true,
        },
      }),
    ]);

    return {
      contagens: {
        noticias,
        comercios,
        eventos,
        cursos: oportunidades,
        inscritosBoletim,
        usuarios,
        contatos,
        anuncios: pedidosAnuncio,
      },
      demo: {
        noticias: noticiasDemo,
        comercios: comerciosDemo,
        eventos: eventosDemo,
        cursos: oportunidadesDemo,
        total: noticiasDemo + comerciosDemo + eventosDemo + oportunidadesDemo,
      },
      noticiasRecentes,
    };
  }
}
