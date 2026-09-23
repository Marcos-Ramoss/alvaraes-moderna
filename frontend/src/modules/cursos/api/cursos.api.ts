import type { OportunidadePublica } from "../types/curso.types";

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

export const cursosApi = {
  async listarOportunidades(filtros?: { busca?: string; limite?: number; pagina?: number; situacao?: "TODAS" | "ABERTA" | "ENCERRADA" }) {
    const query = new URLSearchParams();
    query.set("limite", (filtros?.limite ?? 6).toString());
    query.set("pagina", (filtros?.pagina ?? 1).toString());
    query.set("situacao", filtros?.situacao ?? "TODAS");
    if (filtros?.busca) query.set("busca", filtros.busca);

    const resposta = await request<{ dados: OportunidadePublica[]; total: number }>(
      `/oportunidades?${query.toString()}`,
    );
    return { dados: resposta.dados, total: resposta.total };
  },

  async buscarPorId(id: string) {
    const resposta = await request<{ dados: OportunidadePublica }>(`/oportunidades/${id}`);
    return resposta.dados;
  },
};
