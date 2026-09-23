import type { Usuario } from "@prisma/client";

export type UsuarioLogadoResponseDto = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
};

export class AuthMapper {
  paraUsuarioLogado(usuario: Usuario): UsuarioLogadoResponseDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ativo: usuario.ativo,
      criadoEm: usuario.criadoEm.toISOString(),
    };
  }
}
