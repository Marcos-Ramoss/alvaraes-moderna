import type { EventoPublico } from "../types/evento.types";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.mensagem ?? "Não foi possível carregar os dados.");
  }

  return data as T;
}

export const eventosApi = {
  async listar(filtros?: { busca?: string; limite?: number }) {
    const query = new URLSearchParams();
    query.set("limite", (filtros?.limite ?? 1000).toString());
    query.set("situacao", "TODOS");
    if (filtros?.busca) query.set("busca", filtros.busca);

    const resposta = await request<{ dados: EventoPublico[] }>(
      `/eventos?${query.toString()}`,
    );
    return resposta.dados;
  },

  async buscarPorId(id: string) {
    const resposta = await request<{ dados: EventoPublico }>(`/eventos/${id}`);
    return resposta.dados;
  },
};
