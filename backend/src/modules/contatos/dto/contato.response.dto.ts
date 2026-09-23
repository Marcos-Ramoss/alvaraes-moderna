export type ContatoResponseDto = {
  id: string;
  tipo: string;
  nome: string;
  contatoResposta: string;
  assunto?: string | undefined;
  mensagem: string;
  status: string;
  criadoEm: string;
  alteradoEm: string;
};
