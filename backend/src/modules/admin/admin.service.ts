import { AdminRepository } from "./admin.repository.js";

export class AdminService {
  constructor(private readonly adminRepository = new AdminRepository()) {}

  async buscarResumo() {
    const resumo = await this.adminRepository.buscarResumo();

    return {
      ...resumo,
      noticiasRecentes: resumo.noticiasRecentes.map((noticia) => ({
        id: noticia.id,
        slug: noticia.slug,
        titulo: noticia.titulo,
        publicado: noticia.status === "PUBLICADO",
        publicadoEm: (noticia.publicadoEm ?? noticia.criadoEm).toISOString(),
      })),
    };
  }
}
