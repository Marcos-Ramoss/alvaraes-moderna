import { prisma } from "../../database/prisma.js";

export class AuthRepository {
  buscarUsuarioPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      include: {
        permissoes: true,
      },
    });
  }

  buscarUsuarioPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        permissoes: true,
      },
    });
  }
}
