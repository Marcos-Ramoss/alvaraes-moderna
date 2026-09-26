import type { Permissao, RoleUsuario, Usuario, UsuarioPermissao } from "@prisma/client";

export type UsuarioLogadoResponseDto = {
  id: string;
  nome: string;
  email: string;
  role: RoleUsuario;
  ativo: boolean;
  permissoes: Permissao[];
  criadoEm: string;
};

type UsuarioComPermissoes = Usuario & {
  permissoes?: UsuarioPermissao[];
};

export class AuthMapper {
  paraUsuarioLogado(usuario: UsuarioComPermissoes): UsuarioLogadoResponseDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo,
      permissoes: (usuario.permissoes ?? []).map((p) => p.permissao),
      criadoEm: usuario.criadoEm.toISOString(),
    };
  }
}
