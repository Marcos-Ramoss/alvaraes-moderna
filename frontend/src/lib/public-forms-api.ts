const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

export type CriarContatoPayload = {
  tipo: "SUGESTAO_PAUTA" | "CORRECAO" | "MENSAGEM_GERAL";
  nome: string;
  contatoResposta: string;
  assunto?: string;
  mensagem: string;
};

export type CriarPedidoAnuncioPayload = {
  tipo: "CADASTRO_BASICO" | "PAGINA_COMPLETA" | "DESTAQUE_PATROCINADO";
  nomeResponsavel: string;
  contatoResponsavel: string;
  nomeComercio: string;
  categoriaPretendida?: string;
  localizacaoResumida?: string;
  mensagem?: string;
};

async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.mensagem ?? "Não foi possível enviar as informações.");
  }

  return data as T;
}

export const publicFormsApi = {
  enviarContato(payload: CriarContatoPayload) {
    return request<{ mensagem: string }>("/contatos", payload);
  },

  enviarPedidoAnuncio(payload: CriarPedidoAnuncioPayload) {
    return request<{ mensagem: string }>("/pedidos-anuncio", payload);
  },
};
