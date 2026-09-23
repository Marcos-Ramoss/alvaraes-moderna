import { prisma } from "../../database/prisma.js";

export class AuthRepository {
  buscarUsuarioPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  buscarUsuarioPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }
}
