import { type Permissao, Prisma, type RoleUsuario } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import type { ListarUsuariosQueryDto } from "./dto/listar-usuarios.query.dto.js";

export class UsuariosRepository {
  async listar(filtros: ListarUsuariosQueryDto) {
    const where: Prisma.UsuarioWhereInput = {};

    if (filtros.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }

    if (filtros.role) {
      where.role = filtros.role;
    }

    if (filtros.busca) {
      const termo = filtros.busca;
      where.OR = [
        { nome: { contains: termo, mode: "insensitive" } },
        { email: { contains: termo, mode: "insensitive" } },
      ];
    }

    const skip = (filtros.pagina - 1) * filtros.limite;

    const [itens, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          ativo: true,
          criadoEm: true,
          alteradoEm: true,
          permissoes: {
            select: { permissao: true },
          },
        },
        orderBy: { criadoEm: "desc" },
        skip,
        take: filtros.limite,
      }),
      prisma.usuario.count({ where }),
    ]);

    const formatados = itens.map((u) => ({
      ...u,
      permissoes: u.permissoes.map((p) => p.permissao),
    }));

    return { itens: formatados, total };
  }

  async buscarPorId(id: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        permissoes: true,
      },
    });

    if (!usuario) return null;

    return {
      ...usuario,
      permissoes: usuario.permissoes.map((p) => p.permissao),
    };
  }

  async buscarPorEmail(email: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        permissoes: true,
      },
    });

    if (!usuario) return null;

    return {
      ...usuario,
      permissoes: usuario.permissoes.map((p) => p.permissao),
    };
  }

  async criar(dados: {
    nome: string;
    email: string;
    senhaHash: string;
    role: RoleUsuario;
    ativo: boolean;
    permissoes: Permissao[];
  }) {
    const usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senhaHash: dados.senhaHash,
        role: dados.role,
        ativo: dados.ativo,
        permissoes: {
          create: dados.permissoes.map((permissao) => ({ permissao })),
        },
      },
      include: {
        permissoes: true,
      },
    });

    return {
      ...usuario,
      permissoes: usuario.permissoes.map((p) => p.permissao),
    };
  }

  async atualizar(
    id: string,
    dados: {
      nome?: string;
      email?: string;
      senhaHash?: string;
      role?: RoleUsuario;
      ativo?: boolean;
      permissoes?: Permissao[];
    },
  ) {
    return prisma.$transaction(async (tx) => {
      if (dados.permissoes !== undefined) {
        await tx.usuarioPermissao.deleteMany({
          where: { usuarioId: id },
        });

        if (dados.permissoes.length > 0) {
          await tx.usuarioPermissao.createMany({
            data: dados.permissoes.map((permissao) => ({
              usuarioId: id,
              permissao,
            })),
          });
        }
      }

      const updateData: Prisma.UsuarioUpdateInput = {};
      if (dados.nome !== undefined) updateData.nome = dados.nome;
      if (dados.email !== undefined) updateData.email = dados.email;
      if (dados.senhaHash !== undefined) updateData.senhaHash = dados.senhaHash;
      if (dados.role !== undefined) updateData.role = dados.role;
      if (dados.ativo !== undefined) updateData.ativo = dados.ativo;

      await tx.usuario.update({
        where: { id },
        data: updateData,
      });

      const usuarioAtualizado = await tx.usuario.findUniqueOrThrow({
        where: { id },
        include: { permissoes: true },
      });

      return {
        ...usuarioAtualizado,
        permissoes: usuarioAtualizado.permissoes.map((p) => p.permissao),
      };
    });
  }

  async alterarStatus(id: string, ativo: boolean) {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { ativo },
      include: {
        permissoes: true,
      },
    });

    return {
      ...usuario,
      permissoes: usuario.permissoes.map((p) => p.permissao),
    };
  }

  async excluir(id: string) {
    return prisma.usuario.delete({
      where: { id },
    });
  }

  async contarMastersAtivos() {
    return prisma.usuario.count({
      where: {
        role: "MASTER",
        ativo: true,
      },
    });
  }
}
