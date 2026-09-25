import type { NoticiaPublica } from "../types/noticia.types";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.mensagem ?? "Não foi possível carregar noticias.");
  }

  return data as T;
}

export const noticiasApi = {
  async listar(filtros?: {
    busca?: string;
    limite?: number;
    pagina?: number;
    categoria?: string;
    destaque?: boolean;
    ordenacao?: "MAIS_RECENTES" | "MAIS_ANTIGAS" | "MAIS_LIDAS";
  }) {
    const query = new URLSearchParams();
    query.set("limite", (filtros?.limite ?? 6).toString());
    query.set("pagina", (filtros?.pagina ?? 1).toString());
    if (filtros?.busca) query.set("busca", filtros.busca);
    if (filtros?.categoria && filtros.categoria !== "Todas") {
      query.set("categoria", filtros.categoria);
    }
    if (filtros?.destaque !== undefined) {
      query.set("destaque", filtros.destaque.toString());
    }
    if (filtros?.ordenacao) {
      query.set("ordenacao", filtros.ordenacao);
    }
    
    const resposta = await request<{ dados: NoticiaPublica[]; total: number }>(`/noticias?${query.toString()}`);
    return { dados: resposta.dados, total: resposta.total };
  },

  async listarCategorias() {
    const resposta = await request<{ dados: { slug: string; nome: string }[] }>("/noticias/categorias");
    return resposta.dados;
  },

  async buscarPorSlug(slug: string) {
    const resposta = await request<{ dados: NoticiaPublica }>(`/noticias/${slug}`);
    return resposta.dados;
  },

  async registrarLeitura(slug: string, clienteId: string) {
    const resposta = await fetch(`${API_URL}/noticias/${slug}/leituras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId }),
    });
    const contentType = resposta.headers.get("content-type");
    const data = contentType?.includes("application/json") ? await resposta.json() : null;

    if (!resposta.ok) {
      throw new Error(data?.mensagem ?? "Não foi possível registrar a leitura.");
    }

    return data as { dados: { registrada: boolean } };
  },
};

export function formatarDataPublica(dataIso?: string) {
  if (!dataIso) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dataIso));
}


