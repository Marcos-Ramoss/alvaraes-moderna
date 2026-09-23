export type PedidoAnuncioResponseDto = {
  id: string;
  tipo: string;
  nomeResponsavel: string;
  contatoResponsavel: string;
  nomeComercio: string;
  categoriaPretendida?: string | undefined;
  localizacaoResumida?: string | undefined;
  mensagem?: string | undefined;
  status: string;
  criadoEm: string;
  alteradoEm: string;
};
