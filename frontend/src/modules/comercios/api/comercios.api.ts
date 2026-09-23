import type { ComercioPublico } from "../types/comercio.types";

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

export const comerciosApi = {
  async listarCategorias() {
    const resposta = await request<{ dados: { slug: string; nome: string }[] }>("/comercios/categorias");
    return resposta.dados;
  },

  async listar(filtros?: { busca?: string; limite?: number; pagina?: number; categoria?: string; patrocinado?: boolean; possuiPagina?: boolean; }) {
    const query = new URLSearchParams();
    query.set("limite", (filtros?.limite ?? 6).toString());
    query.set("pagina", (filtros?.pagina ?? 1).toString());
    if (filtros?.busca) query.set("busca", filtros.busca);
    if (filtros?.categoria && filtros.categoria !== "Todas") query.set("categoria", filtros.categoria);
    if (filtros?.patrocinado !== undefined) query.set("patrocinado", filtros.patrocinado.toString());
    if (filtros?.possuiPagina !== undefined) query.set("possuiPagina", filtros.possuiPagina.toString());

    const resposta = await request<{ dados: ComercioPublico[]; total: number }>(`/comercios?${query.toString()}`);
    return { dados: resposta.dados, total: resposta.total };
  },

  async buscarPorSlug(slug: string) {
    const resposta = await request<{ dados: ComercioPublico }>(`/comercios/${slug}`);
    return resposta.dados;
  },
};

