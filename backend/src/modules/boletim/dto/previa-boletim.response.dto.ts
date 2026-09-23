export type PreviaBoletimResponseDto = {
  titulo: string;
  saudacao: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  contagemInscritos: number;
  noticiasDaSemana: Array<{
    id: string;
    slug: string;
    titulo: string;
    resumo: string;
    publicadoEm: string;
  }>;
  agendaProximosDias: Array<{
    id: string;
    titulo: string;
    data: string;
    horario?: string;
    local: string;
  }>;
  inscricoesAbertas: Array<{
    id: string;
    titulo: string;
    organizador: string;
    prazo: string;
  }>;
};
