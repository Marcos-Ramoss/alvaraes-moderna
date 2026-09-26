const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";
const TOKEN_KEY = "am_admin_token";

export type RoleUsuario = "MASTER" | "ADMIN";

export type Permissao =
  | "NOTICIAS"
  | "COMERCIOS"
  | "EVENTOS"
  | "CURSOS"
  | "COMENTARIOS"
  | "BOLETIM"
  | "CONTATOS"
  | "ANUNCIOS"
  | "USUARIOS"
  | "AUDITORIA";

export type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  role: RoleUsuario;
  ativo: boolean;
  criadoEm: string;
  alteradoEm?: string;
  permissoes: Permissao[];
};

export type AcaoAuditoria = "CRIAR" | "ATUALIZAR" | "EXCLUIR" | "PUBLICAR" | "STATUS" | "LOGIN";

export type RecursoAuditoria =
  | "NOTICIA"
  | "COMERCIO"
  | "EVENTO"
  | "CURSO"
  | "COMENTARIO"
  | "CONTATO"
  | "PEDIDO_ANUNCIO"
  | "USUARIO"
  | "SISTEMA";

export type LogAuditoriaAdmin = {
  id: string;
  usuarioId?: string | null;
  usuarioNome: string;
  usuarioEmail: string;
  acao: AcaoAuditoria;
  recurso: RecursoAuditoria;
  recursoId?: string | null;
  tituloRecurso?: string | null;
  descricao: string;
  dadosAnteriores?: any;
  dadosNovos?: any;
  ip?: string | null;
  userAgent?: string | null;
  criadoEm: string;
};

export type FiltrosAuditoria = {
  busca?: string | undefined;
  usuarioId?: string | undefined;
  acao?: AcaoAuditoria | undefined;
  recurso?: RecursoAuditoria | undefined;
  dataInicio?: string | undefined;
  dataFim?: string | undefined;
  pagina?: number | undefined;
  limite?: number | undefined;
};

export type RespostaPaginada<T> = {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
};

export function temPermissao(usuario: UsuarioAdmin | null | undefined, permissao: Permissao): boolean {
  if (!usuario) return false;
  if (usuario.role === "MASTER") return true;
  return Array.isArray(usuario.permissoes) && usuario.permissoes.includes(permissao);
}

export type ResumoAdmin = {
  contagens: {
    noticias: number;
    comercios: number;
    eventos: number;
    cursos: number;
    inscritosBoletim: number;
    usuarios: number;
    contatos: number;
    anuncios: number;
  };
  demo: {
    noticias: number;
    comercios: number;
    eventos: number;
    cursos: number;
    total: number;
  };
  noticiasRecentes: Array<{
    id: string;
    slug: string;
    titulo: string;
    publicado: boolean;
    publicadoEm: string;
  }>;
  usuario?: UsuarioAdmin;
};

export type MidiaAdmin = {
  id: string;
  tipoMidia: "IMAGEM" | "VIDEO";
  url: string;
  titulo?: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  duracaoSegundos?: number;
  ordem: number;
};

export type ImagemNoticiaPayload = {
  url: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  ordem?: number;
};

export type VídeoNoticiaPayload = {
  url: string;
  titulo?: string;
  origem?: string;
};

import {
  type ComercioAdmin,
  type SalvarComercioPayload,
  type ImagemComercioPayload,
  type VídeoComercioPayload,
} from "@/modules/comercios";
import { type NoticiaAdmin, type SalvarNoticiaPayload } from "@/modules/noticias";

type StatusPublicação = "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
type CategoriaResumo = { id: string; nome: string; slug: string; };

import { type EventoAdmin, type SalvarEventoPayload } from "@/modules/eventos";
import { type CursoAdmin, type SalvarCursoPayload } from "@/modules/cursos";

export type InscritoBoletimAdmin = {
  id: string;
  nome: string;
  email: string;
  origem: string;
  ativo: boolean;
  criadoEm: string;
  alteradoEm: string;
};

export type StatusContatoAdmin = "NOVO" | "EM_ANALISE" | "RESPONDIDO" | "ARQUIVADO";

export type ContatoAdmin = {
  id: string;
  tipo: "SUGESTAO_PAUTA" | "CORRECAO" | "MENSAGEM_GERAL";
  nome: string;
  contatoResposta: string;
  assunto?: string;
  mensagem: string;
  status: StatusContatoAdmin;
  criadoEm: string;
  alteradoEm: string;
};

export type StatusPedidoAnuncioAdmin = "NOVO" | "EM_CONTATO" | "CONVERTIDO" | "ARQUIVADO";

export type PedidoAnuncioAdmin = {
  id: string;
  tipo: "CADASTRO_BASICO" | "PAGINA_COMPLETA" | "DESTAQUE_PATROCINADO";
  nomeResponsavel: string;
  contatoResponsavel: string;
  nomeComercio: string;
  categoriaPretendida?: string;
  localizacaoResumida?: string;
  mensagem?: string;
  status: StatusPedidoAnuncioAdmin;
  criadoEm: string;
  alteradoEm: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export function obterTokenAdmin() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function salvarTokenAdmin(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removerTokenAdmin() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function formatarErroApi(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a operação.";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? obterTokenAdmin();
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const mensagem =
      data?.mensagem ??
      data?.message ??
      data?.erro ??
      data?.error ??
      "Não foi possível concluir a operação.";
    throw new Error(mensagem);
  }

  return data as T;
}

export const adminApi = {
  async login(email: string, senha: string) {
    const resposta = await request<{ token: string; usuario: UsuarioAdmin }>("/auth/login", {
      method: "POST",
      body: { email, senha },
      token: null,
    });
    salvarTokenAdmin(resposta.token);
    return resposta;
  },

  me() {
    return request<{ usuario: UsuarioAdmin }>("/auth/me");
  },

  resumo() {
    return request<ResumoAdmin>("/admin/resumo");
  },

  massaDelete(entidade: string, ids: string[]) {
    return request<{ success: boolean; count: number }>("/admin/massa", {
      method: "DELETE",
      body: { entidade, ids },
    });
  },

  massaUpdateStatus(entidade: string, ids: string[], status: string) {
    return request<{ success: boolean; count: number }>("/admin/massa", {
      method: "PATCH",
      body: { entidade, ids, status },
    });
  },

  async listarNoticias() {
    const resposta = await request<{ dados: NoticiaAdmin[] }>("/admin/noticias?limite=1000");
    return resposta.dados;
  },

  criarNoticia(payload: SalvarNoticiaPayload) {
    return request<{ dados: NoticiaAdmin }>("/admin/noticias", {
      method: "POST",
      body: payload,
    });
  },

  atualizarNoticia(id: string, payload: SalvarNoticiaPayload) {
    return request<{ dados: NoticiaAdmin }>(`/admin/noticias/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  publicarNoticia(id: string) {
    return request<{ dados: NoticiaAdmin }>(`/admin/noticias/${id}/publicar`, {
      method: "PATCH",
    });
  },

  excluirNoticia(id: string) {
    return request<{ mensagem: string }>(`/admin/noticias/${id}`, {
      method: "DELETE",
    });
  },

  async listarComercios() {
    const resposta = await request<{ dados: ComercioAdmin[] }>("/admin/comercios?limite=1000");
    return resposta.dados;
  },

  criarComercio(payload: SalvarComercioPayload) {
    return request<{ dados: ComercioAdmin }>("/admin/comercios", {
      method: "POST",
      body: payload,
    });
  },

  atualizarComercio(id: string, payload: SalvarComercioPayload) {
    return request<{ dados: ComercioAdmin }>(`/admin/comercios/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  publicarComercio(id: string) {
    return request<{ dados: ComercioAdmin }>(`/admin/comercios/${id}/publicar`, {
      method: "PATCH",
    });
  },

  excluirComercio(id: string) {
    return request<{ mensagem: string }>(`/admin/comercios/${id}`, {
      method: "DELETE",
    });
  },

  async listarEventos() {
    const resposta = await request<{ dados: EventoAdmin[] }>("/admin/eventos?limite=1000");
    return resposta.dados;
  },

  criarEvento(payload: SalvarEventoPayload) {
    return request<{ dados: EventoAdmin }>("/admin/eventos", {
      method: "POST",
      body: payload,
    });
  },

  atualizarEvento(id: string, payload: SalvarEventoPayload) {
    return request<{ dados: EventoAdmin }>(`/admin/eventos/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  publicarEvento(id: string) {
    return request<{ dados: EventoAdmin }>(`/admin/eventos/${id}/publicar`, {
      method: "PATCH",
    });
  },

  excluirEvento(id: string) {
    return request<{ mensagem: string }>(`/admin/eventos/${id}`, {
      method: "DELETE",
    });
  },

  async listarCursos() {
    const resposta = await request<{ dados: CursoAdmin[] }>("/admin/cursos?limite=1000");
    return resposta.dados;
  },

  criarCurso(payload: SalvarCursoPayload) {
    return request<{ dados: CursoAdmin }>("/admin/cursos", {
      method: "POST",
      body: payload,
    });
  },

  atualizarCurso(id: string, payload: SalvarCursoPayload) {
    return request<{ dados: CursoAdmin }>(`/admin/cursos/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  publicarCurso(id: string) {
    return request<{ dados: CursoAdmin }>(`/admin/cursos/${id}/publicar`, {
      method: "PATCH",
    });
  },

  excluirCurso(id: string) {
    return request<{ mensagem: string }>(`/admin/cursos/${id}`, {
      method: "DELETE",
    });
  },

  async listarInscritosBoletim() {
    const resposta = await request<{ dados: InscritoBoletimAdmin[] }>("/admin/boletim/inscritos");
    return resposta.dados;
  },

  removerInscritoBoletim(id: string) {
    return request<{ mensagem: string }>(`/admin/boletim/inscritos/${id}`, {
      method: "DELETE",
    });
  },

  async listarContatos() {
    const resposta = await request<{ dados: ContatoAdmin[] }>("/admin/contatos");
    return resposta.dados;
  },

  atualizarStatusContato(id: string, status: StatusContatoAdmin) {
    return request<{ dados: ContatoAdmin }>(`/admin/contatos/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  async listarPedidosAnuncio() {
    const resposta = await request<{ dados: PedidoAnuncioAdmin[] }>("/admin/pedidos-anuncio");
    return resposta.dados;
  },

  atualizarStatusPedidoAnuncio(id: string, status: StatusPedidoAnuncioAdmin) {
    return request<{ dados: PedidoAnuncioAdmin }>(`/admin/pedidos-anuncio/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  async uploadImagem(arquivo: File, pasta = "geral"): Promise<{
    url: string;
    caminho: string;
    nomeOriginal: string;
    tamanhoBytes: number;
    tipoMime: string;
  }> {
    const token = obterTokenAdmin();
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("pasta", pasta);

    const response = await fetch(`${API_URL}/admin/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.erro ?? data?.message ?? "Falha ao enviar imagem.");
    }
    return data.dados;
  },

  async listarUsuarios(
    filtros: {
      busca?: string | undefined;
      ativo?: boolean | undefined;
      role?: RoleUsuario | undefined;
      pagina?: number | undefined;
      limite?: number | undefined;
    } = {}
  ) {
    const params = new URLSearchParams();
    if (filtros.busca) params.set("busca", filtros.busca);
    if (filtros.ativo !== undefined) params.set("ativo", String(filtros.ativo));
    if (filtros.role) params.set("role", filtros.role);
    if (filtros.pagina) params.set("pagina", String(filtros.pagina));
    if (filtros.limite) params.set("limite", String(filtros.limite));

    const qs = params.toString();
    return request<RespostaPaginada<UsuarioAdmin>>(`/admin/usuarios${qs ? `?${qs}` : ""}`);
  },

  async buscarUsuarioPorId(id: string) {
    return request<{ dados: UsuarioAdmin }>(`/admin/usuarios/${id}`);
  },

  async criarUsuario(payload: {
    nome: string;
    email: string;
    senha: string;
    role?: RoleUsuario;
    ativo?: boolean;
    permissoes: Permissao[];
  }) {
    return request<{ dados: UsuarioAdmin }>("/admin/usuarios", {
      method: "POST",
      body: payload,
    });
  },

  async atualizarUsuario(
    id: string,
    payload: {
      nome?: string;
      email?: string;
      senha?: string;
      role?: RoleUsuario;
      ativo?: boolean;
      permissoes?: Permissao[];
    }
  ) {
    return request<{ dados: UsuarioAdmin }>(`/admin/usuarios/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  async alterarStatusUsuario(id: string, ativo: boolean) {
    return request<{ dados: UsuarioAdmin }>(`/admin/usuarios/${id}/status`, {
      method: "PATCH",
      body: { ativo },
    });
  },

  async excluirUsuario(id: string) {
    return request<{ dados: { sucesso: boolean } }>(`/admin/usuarios/${id}`, {
      method: "DELETE",
    });
  },

  async listarLogsAuditoria(filtros: FiltrosAuditoria = {}) {
    const params = new URLSearchParams();
    if (filtros.busca) params.set("busca", filtros.busca);
    if (filtros.usuarioId) params.set("usuarioId", filtros.usuarioId);
    if (filtros.acao) params.set("acao", filtros.acao);
    if (filtros.recurso) params.set("recurso", filtros.recurso);
    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    if (filtros.pagina) params.set("pagina", String(filtros.pagina));
    if (filtros.limite) params.set("limite", String(filtros.limite));

    const qs = params.toString();
    return request<RespostaPaginada<LogAuditoriaAdmin>>(`/admin/auditoria${qs ? `?${qs}` : ""}`);
  },

  async excluirLogAuditoria(id: string) {
    return request<{ dados: { sucesso: boolean } }>(`/admin/auditoria/${id}`, {
      method: "DELETE",
    });
  },

  async contarLogsAuditoriaAntigos(dataLimite: string) {
    return request<{ dados: { total: number; dataLimite: string } }>(
      `/admin/auditoria/antigos/contar?dataLimite=${encodeURIComponent(dataLimite)}`
    );
  },

  async expurgarLogsAuditoriaAntigos(dataLimite: string) {
    return request<{ dados: { totalExcluidos: number; dataLimite: string } }>(
      "/admin/auditoria/antigos",
      {
        method: "DELETE",
        body: { dataLimite },
      }
    );
  },
};

export function formatarDataPtBr(dataIso?: string) {
  if (!dataIso) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dataIso));
}
