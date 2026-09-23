const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

export type PreviaBoletim = {
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.mensagem ?? "Não foi possível concluir a operação.");
  }

  return data as T;
}

export const boletimApi = {
  async buscarPrevia() {
    const resposta = await request<{ dados: PreviaBoletim }>("/boletim/previa");
    return resposta.dados;
  },

  inscrever(payload: { nome: string; email: string }) {
    return request<{ mensagem: string }>("/boletim/inscrever", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
