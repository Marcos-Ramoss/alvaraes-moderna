import { Edit, Eye, ImageIcon, Link2, Plus, RefreshCcw, Search, Send, Trash2, X } from "lucide-react";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPaginacao } from "@/components/admin/admin-list-controls";
import { AdminMassActions } from "@/components/admin/admin-mass-actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Archive, FileEdit } from "lucide-react";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, formatarDataPtBr, formatarErroApi } from "@/lib/admin-api";
import type {
  NoticiaAdmin,
  SalvarNoticiaPayload,
  FormState,
  FormImagem,
} from "../types/noticia.types";
import { toast } from "sonner";
import { MediaLightbox } from "@/components/media-lightbox";

const LIMITE_IMAGENS = 5;
const TAMANHO_MAXIMO_IMAGEM_BYTES = 2 * 1024 * 1024;

const formInicial: FormState = {
  titulo: "",
  resumo: "",
  categoriaSlug: "comunidade",
  autorNome: "Redação Alvarães Moderna",
  corpo: "",
  fontes: "",
  status: "RASCUNHO",
  tipoConteúdo: "NOTICIA",
  destaque: false,
  demonstracao: false,
  imagens: [],
  videoUrl: "",
  videoTitulo: "",
  videoOrigem: "YOUTUBE",
};

export function AdminNoticiasView() {
  const { usuario, carregando } = useAdminAuth();
  const [noticias, setNoticias] = useState<NoticiaAdmin[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState>(formInicial);
  const [editando, setEditando] = useState<NoticiaAdmin | null>(null);
  const [noticiaParaVisualizar, setNoticiaParaVisualizar] = useState<NoticiaAdmin | null>(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("Conteúdo");
  const [noticiaParaExcluir, setNoticiaParaExcluir] = useState<NoticiaAdmin | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const etapas = ["Conteúdo", "Classificacao", "Midias", "Pré-visualização", "Publicação"];

  const handleSelecionarUm = (id: string, checked: boolean) => {
    const novoSet = new Set(selecionados);
    if (checked) novoSet.add(id);
    else novoSet.delete(id);
    setSelecionados(novoSet);
  };

  async function carregar() {
    setCarregandoLista(true);
    try {
      const dados = await adminApi.listarNoticias();
      setNoticias(dados);
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const noticiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return noticias;
    return noticias.filter((noticia) => {
      return (
        noticia.titulo.toLowerCase().includes(termo) ||
        noticia.resumo.toLowerCase().includes(termo) ||
        noticia.categoria.nome.toLowerCase().includes(termo)
      );
    });
  }, [busca, noticias]);

  useEffect(() => {
    setPagina(1);
  }, [busca, porPagina]);

  const paginaAtual = Math.min(
    pagina,
    Math.max(1, Math.ceil(noticiasFiltradas.length / porPagina)),
  );
  const noticiasPaginadas = noticiasFiltradas.slice(
    (paginaAtual - 1) * porPagina,
    paginaAtual * porPagina,
  );

  useEffect(() => {
    setSelecionados(new Set());
  }, [pagina, porPagina, busca]);

  const todosDaPaginaSelecionados =
    noticiasPaginadas.length > 0 &&
    noticiasPaginadas.every((n) => selecionados.has(n.id));

  const handleSelecionarTodos = (checked: boolean) => {
    if (checked) {
      setSelecionados(new Set(noticiasPaginadas.map((n) => n.id)));
    } else {
      setSelecionados(new Set());
    }
  };

  if (carregando) return <div className="admin-loading">Carregando painel...</div>;

  const indiceEtapaAtual = Math.max(
    etapas.findIndex((etapa) => etapa === etapaAtual),
    0,
  );
  const primeiraEtapa = indiceEtapaAtual <= 0;
  const ultimaEtapa = indiceEtapaAtual >= etapas.length - 1;

  function montarPayload(): SalvarNoticiaPayload {
    const corpo = form.corpo
      .split(/\n\s*\n/)
      .map((paragrafo) => paragrafo.trim())
      .filter(Boolean);
    const fontes = form.fontes
      .split("\n")
      .map((fonte) => fonte.trim())
      .filter(Boolean);

    return {
      titulo: form.titulo,
      resumo: form.resumo,
      corpo,
      autorNome: form.autorNome,
      categoriaSlug: form.categoriaSlug,
      status: form.status,
      tipoConteúdo: form.tipoConteúdo,
      destaque: form.destaque,
      demonstracao: form.demonstracao,
      ...(fontes.length > 0 ? { fontes } : {}),
      ...(montarImagensPayload().length > 0 ? { imagens: montarImagensPayload() } : {}),
      video: form.videoUrl.trim()
        ? {
            url: form.videoUrl.trim(),
            ...(form.videoTitulo.trim() ? { titulo: form.videoTitulo.trim() } : {}),
            origem: form.videoOrigem.trim() || "LINK_EXTERNO",
          }
        : null,
    };
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const camposObrigatorios = [
      { chave: "titulo", label: "Titulo", etapa: "Conteúdo" },
      { chave: "resumo", label: "Resumo", etapa: "Conteúdo" },
      { chave: "corpo", label: "Texto completo", etapa: "Conteúdo" },
      { chave: "autorNome", label: "Autor", etapa: "Classificacao" },
    ] as const;
    const campoInvalido = camposObrigatorios.find((campo) => form[campo.chave].trim().length === 0);

    if (campoInvalido) {
      const textoErro = `Preencha o campo obrigatorio: ${campoInvalido.label}.`;
      setErro(textoErro);
      setEtapaAtual(campoInvalido.etapa);
      toast.error(textoErro);
      return;
    }

    const imagemComTamanhoInvalido = form.imagens.find((imagem) => {
      const tamanho = Number(imagem.tamanhoBytes);
      return (
        imagem.tamanhoBytes.trim() &&
        (!Number.isFinite(tamanho) || tamanho > TAMANHO_MAXIMO_IMAGEM_BYTES)
      );
    });

    if (imagemComTamanhoInvalido) {
      const textoErro = "Cada imagem deve ter no maximo 2 MB.";
      setErro(textoErro);
      setEtapaAtual("Midias");
      toast.error(textoErro);
      return;
    }

    setSalvando(true);

    try {
      const payload = montarPayload();
      if (editando) {
        await adminApi.atualizarNoticia(editando.id, payload);
        setMensagem("Noticia atualizada com sucesso.");
        toast.success("Noticia atualizada com sucesso.");
      } else {
        await adminApi.criarNoticia(payload);
        setMensagem("Noticia criada com sucesso.");
        toast.success("Noticia criada com sucesso.");
      }
      fecharFormulario();
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  function editar(noticia: NoticiaAdmin) {
    setEditando(noticia);
    setForm({
      titulo: noticia.titulo,
      resumo: noticia.resumo,
      categoriaSlug: noticia.categoria.slug,
      autorNome: noticia.autorNome,
      corpo: (noticia.corpo ?? []).join("\n\n"),
      fontes: (noticia.fontes ?? []).join("\n"),
      status: noticia.status,
      tipoConteúdo: noticia.tipoConteúdo,
      destaque: noticia.destaque,
      demonstracao: noticia.demonstracao,
      imagens: montarImagensEdicao(noticia),
      videoUrl: noticia.video?.url ?? "",
      videoTitulo: noticia.video?.titulo ?? "",
      videoOrigem: noticia.video?.origem ?? "YOUTUBE",
    });
    setEtapaAtual("Conteúdo");
    setFormularioAberto(true);
  }

  function montarImagensPayload() {
    return form.imagens
      .map((imagem, index) => ({
        url: imagem.url.trim(),
        textoAlternativo: imagem.textoAlternativo.trim(),
        credito: imagem.credito.trim(),
        origem: imagem.origem.trim(),
        tamanhoBytes: imagem.tamanhoBytes.trim() ? Number(imagem.tamanhoBytes) : undefined,
        ordem: index,
      }))
      .filter((imagem) => imagem.url)
      .map((imagem) => ({
        url: imagem.url,
        ...(imagem.textoAlternativo ? { textoAlternativo: imagem.textoAlternativo } : {}),
        ...(imagem.credito ? { credito: imagem.credito } : {}),
        ...(imagem.origem ? { origem: imagem.origem } : {}),
        ...(imagem.tamanhoBytes ? { tamanhoBytes: imagem.tamanhoBytes } : {}),
        ordem: imagem.ordem,
      }));
  }

  function adicionarImagem() {
    if (form.imagens.length >= LIMITE_IMAGENS) return;
    setForm({
      ...form,
      imagens: [
        ...form.imagens,
        {
          url: "",
          textoAlternativo: "",
          credito: "",
          origem: "UPLOAD_ADMIN",
          tamanhoBytes: "",
        },
      ],
    });
  }

  function atualizarImagem(indice: number, campo: keyof FormImagem, valor: string) {
    setForm({
      ...form,
      imagens: form.imagens.map((imagem, index) =>
        index === indice ? { ...imagem, [campo]: valor } : imagem,
      ),
    });
  }

  function removerImagem(indice: number) {
    setForm({
      ...form,
      imagens: form.imagens.filter((_, index) => index !== indice),
    });
  }

  function novaNoticia() {
    setEditando(null);
    setForm(formInicial);
    setErro("");
    setMensagem("");
    setEtapaAtual("Conteúdo");
    setFormularioAberto(true);
  }

  function fecharFormulario() {
    setFormularioAberto(false);
    setEditando(null);
    setForm(formInicial);
    setEtapaAtual("Conteúdo");
  }

  async function publicar(noticia: NoticiaAdmin) {
    setErro("");
    setMensagem("");
    try {
      await adminApi.publicarNoticia(noticia.id);
      setMensagem("Noticia publicada.");
      toast.success("Noticia publicada.");
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    }
  }

  async function confirmarExclusao() {
    if (!noticiaParaExcluir) return;
    setErro("");
    setMensagem("");
    setExcluindo(true);
    try {
      await adminApi.excluirNoticia(noticiaParaExcluir.id);
      setMensagem("Noticia excluida.");
      toast.success("Noticia excluida.");
      setNoticiaParaExcluir(null);
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <AdminShell usuario={usuario}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="admin-eyebrow">Notícias</span>
          <h1 className="mt-3 font-display text-4xl font-semibold">Notícias</h1>
          <p className="admin-subtitle mt-2">Cadastre, edite e publique materias do portal.</p>
        </div>
        <button type="button" onClick={novaNoticia} className="admin-primary-action">
          <Plus className="h-4 w-4" />
          Nova noticia
        </button>
      </div>

      {erro && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      {mensagem && (
        <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {mensagem}
        </p>
      )}

      <section className="admin-surface mt-6">
        <div className="grid gap-3 border-b border-admin-border p-4 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Buscar noticia</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar noticia"
              className="admin-input pl-9"
            />
          </label>
          <Button type="button" variant="outline" onClick={carregar}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {carregandoLista ? (
          <p className="admin-subtitle p-5 text-sm">Carregando noticias...</p>
        ) : noticiasFiltradas.length === 0 ? (
          <div className="p-6">
            <p className="font-display text-xl font-semibold">Nenhuma noticia encontrada</p>
            <p className="admin-subtitle mt-1 text-sm">
              Ajuste a busca ou cadastre uma nova noticia.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-4 pb-0 md:hidden">
              <Checkbox
                id="select-all-mobile"
                checked={todosDaPaginaSelecionados}
                onCheckedChange={(c) => handleSelecionarTodos(c as boolean)}
                aria-label="Selecionar tudo"
              />
              <label
                htmlFor="select-all-mobile"
                className="text-sm font-medium text-admin-foreground"
              >
                Selecionar todos
              </label>
            </div>
            <div className="grid gap-3 p-4 md:hidden">
              {noticiasPaginadas.map((noticia) => {
                const isSelected = selecionados.has(noticia.id);
                return (
                  <article
                    key={noticia.id}
                    className={`admin-mobile-card transition-colors cursor-pointer ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}
                    onClick={() => handleSelecionarUm(noticia.id, !isSelected)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(c) => handleSelecionarUm(noticia.id, c as boolean)}
                          aria-label="Selecionar noticia"
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold leading-snug">{noticia.titulo}</h2>
                        <dl className="mt-3 grid gap-2 text-sm">
                          <div>
                            <dt className="admin-label-muted">Categoria</dt>
                            <dd className="mt-1 text-admin-foreground">{noticia.categoria.nome}</dd>
                          </div>
                          <div>
                            <dt className="admin-label-muted">Status</dt>
                            <dd className="mt-1 text-admin-foreground">{noticia.status}</dd>
                          </div>
                          <div>
                            <dt className="admin-label-muted">Data</dt>
                            <dd className="mt-1 text-admin-foreground">
                              {formatarDataPtBr(noticia.publicadoEm)}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNoticiaParaVisualizar(noticia);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              editar(noticia);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              publicar(noticia);
                            }}
                          >
                            <Send className="h-4 w-4" />
                            Publicar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNoticiaParaExcluir(noticia);
                            }}
                            className="text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="admin-table-head">
                  <tr>
                    <th className="px-4 py-3 w-[40px]">
                      <Checkbox
                        checked={todosDaPaginaSelecionados}
                        onCheckedChange={(c) => handleSelecionarTodos(c as boolean)}
                        aria-label="Selecionar tudo"
                      />
                    </th>
                    <th className="px-4 py-3">Titulo</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {noticiasPaginadas.map((noticia) => (
                    <tr key={noticia.id}>
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selecionados.has(noticia.id)}
                          onCheckedChange={(c) => handleSelecionarUm(noticia.id, c as boolean)}
                          aria-label="Selecionar noticia"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">{noticia.titulo}</td>
                      <td className="px-4 py-3">{noticia.categoria.nome}</td>
                      <td className="px-4 py-3">{noticia.status}</td>
                      <td className="px-4 py-3">{formatarDataPtBr(noticia.publicadoEm)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNoticiaParaVisualizar(noticia)}
                            className="admin-icon-action"
                            title="Visualizar notícia"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => editar(noticia)}
                            className="admin-icon-action"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => publicar(noticia)}
                            className="admin-icon-action"
                            title="Publicar"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setNoticiaParaExcluir(noticia)}
                            className="admin-icon-action text-red-700 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-admin-border px-4 pb-4">
              <AdminPaginacao
                paginaAtual={paginaAtual}
                totalPaginas={Math.max(1, Math.ceil(noticiasFiltradas.length / porPagina))}
                totalItens={noticiasFiltradas.length}
                porPagina={porPagina}
                setPagina={setPagina}
                setPorPagina={setPorPagina}
                selectId="noticias-admin-por-pagina"
              />
            </div>
          </>
        )}
      </section>

      <Dialog
        open={formularioAberto}
        onOpenChange={(aberto) => (aberto ? setFormularioAberto(true) : fecharFormulario())}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editando ? "Editar noticia" : "Nova noticia"}
            </DialogTitle>
            <DialogDescription>
              Organize o texto, defina categoria e revise a publicação antes de salvar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={salvar}>
            <Tabs value={etapaAtual} onValueChange={setEtapaAtual}>
              <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
                {etapas.map((etapa) => (
                  <TabsTrigger key={etapa} value={etapa}>
                    {etapa}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="min-h-[55vh] sm:min-h-[400px] md:min-h-[500px]">

              <TabsContent value="Conteúdo" className="mt-0">
                <div className="grid gap-4">
                  <Campo label="Titulo" obrigatorio>
                    <input
                      value={form.titulo}
                      onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                      className="admin-input"
                      required
                    />
                  </Campo>
                  <Campo
                    label="Resumo"
                    obrigatorio
                    ajuda="Texto curto usado nas listagens e chamadas do portal."
                  >
                    <textarea
                      value={form.resumo}
                      onChange={(event) => setForm({ ...form, resumo: event.target.value })}
                      className="admin-textarea"
                      required
                    />
                  </Campo>
                  <Campo
                    label="Texto completo"
                    obrigatorio
                    ajuda="Separe paragrafos com uma linha em branco."
                  >
                    <textarea
                      value={form.corpo}
                      onChange={(event) => setForm({ ...form, corpo: event.target.value })}
                      className="admin-textarea min-h-48"
                      required
                    />
                  </Campo>
                </div>
              </TabsContent>

              <TabsContent value="Classificacao" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Campo label="Categoria">
                    <select
                      value={form.categoriaSlug}
                      onChange={(event) => setForm({ ...form, categoriaSlug: event.target.value })}
                      className="admin-input"
                    >
                      <option value="comunidade">Comunidade</option>
                      <option value="cultura">Cultura</option>
                      <option value="novidades">Novidades</option>
                      <option value="politica-e-vida-publica">Politica e vida publica</option>
                    </select>
                  </Campo>
                  <Campo label="Tipo de conteúdo">
                    <select
                      value={form.tipoConteúdo}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          tipoConteúdo: event.target.value as FormState["tipoConteúdo"],
                        })
                      }
                      className="admin-input"
                    >
                      <option value="NOTICIA">Noticia</option>
                      <option value="OPINIAO">Opiniao</option>
                      <option value="PATROCINADO">Patrocinado</option>
                    </select>
                  </Campo>
                  <Campo label="Autor">
                    <input
                      value={form.autorNome}
                      onChange={(event) => setForm({ ...form, autorNome: event.target.value })}
                      className="admin-input"
                      required
                    />
                  </Campo>
                  <Campo label="Fontes" ajuda="Informe uma fonte por linha, quando houver.">
                    <textarea
                      value={form.fontes}
                      onChange={(event) => setForm({ ...form, fontes: event.target.value })}
                      className="admin-textarea"
                    />
                  </Campo>
                </div>
              </TabsContent>

              <TabsContent value="Midias" className="mt-0">
                <div className="grid gap-5">
                  <section className="rounded-md border border-admin-border">
                    <div className="flex flex-col gap-3 border-b border-admin-border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-display text-xl font-semibold">Imagens</h3>
                        <p className="admin-subtitle mt-1 text-sm">
                          {form.imagens.length} de {LIMITE_IMAGENS} imagens cadastradas.
                        </p>
                        <p className="admin-subtitle mt-1 text-xs">
                          Use URL http/https de imagem já otimizada, preferencialmente WebP,
                          quadrada e até 2 MB.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={adicionarImagem}
                        disabled={form.imagens.length >= LIMITE_IMAGENS}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Adicionar imagem
                      </Button>
                    </div>

                    {form.imagens.length === 0 ? (
                      <div className="p-4">
                        <p className="text-sm text-admin-muted">
                          Nenhuma imagem cadastrada para esta noticia.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 p-4">
                        {form.imagens.map((imagem, index) => (
                          <div
                            key={index}
                            className="grid gap-4 rounded-md border border-admin-border bg-admin-soft p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">Imagem {index + 1}</p>
                                <p className="admin-label-muted mt-1">
                                  Maximo de 2 MB quando o tamanho for informado.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removerImagem(index)}
                                title="Remover imagem"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-4">
                              <ImageUploader
                                url={imagem.url}
                                onChange={(novaUrl) => atualizarImagem(index, "url", novaUrl)}
                                pasta="noticias"
                                label="Arquivo da imagem"
                                ajuda="Selecione uma imagem para enviar ao Supabase (até 5 MB)"
                              />
                              <Campo label="Texto alternativo">
                                <input
                                  value={imagem.textoAlternativo}
                                  onChange={(event) =>
                                    atualizarImagem(index, "textoAlternativo", event.target.value)
                                  }
                                  className="admin-input"
                                />
                              </Campo>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                              <Campo label="Credito">
                                <input
                                  value={imagem.credito}
                                  onChange={(event) =>
                                    atualizarImagem(index, "credito", event.target.value)
                                  }
                                  className="admin-input"
                                />
                              </Campo>
                              <Campo label="Origem">
                                <input
                                  value={imagem.origem}
                                  onChange={(event) =>
                                    atualizarImagem(index, "origem", event.target.value)
                                  }
                                  className="admin-input"
                                />
                              </Campo>
                              <Campo label="Tamanho em bytes">
                                <input
                                  type="number"
                                  min="1"
                                  max={TAMANHO_MAXIMO_IMAGEM_BYTES}
                                  value={imagem.tamanhoBytes}
                                  onChange={(event) =>
                                    atualizarImagem(index, "tamanhoBytes", event.target.value)
                                  }
                                  className="admin-input"
                                />
                              </Campo>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="rounded-md border border-admin-border p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-admin-muted" />
                      <h3 className="font-display text-xl font-semibold">Vídeo</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Campo label="Link do video">
                        <input
                          type="url"
                          inputMode="url"
                          value={form.videoUrl}
                          onChange={(event) => setForm({ ...form, videoUrl: event.target.value })}
                          className="admin-input"
                          placeholder="https://www.youtube.com/..."
                          pattern="https?://.*"
                        />
                      </Campo>
                      <Campo label="Titulo do video">
                        <input
                          value={form.videoTitulo}
                          onChange={(event) =>
                            setForm({ ...form, videoTitulo: event.target.value })
                          }
                          className="admin-input"
                        />
                      </Campo>
                      <Campo label="Origem">
                        <input
                          value={form.videoOrigem}
                          onChange={(event) =>
                            setForm({ ...form, videoOrigem: event.target.value })
                          }
                          className="admin-input"
                        />
                      </Campo>
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="Pré-visualização" className="mt-0">
                <div className="rounded-lg border border-admin-border bg-gray-50/50 p-5 shadow-sm max-h-[55vh] sm:max-h-[500px] overflow-y-auto">
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {form.categoriaSlug.replace("-", " ")}
                    </span>
                    <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-primary">
                      {form.titulo || "Título da notícia aparecerá aqui..."}
                    </h1>
                    <p className="mt-3 text-sm text-foreground/80 font-medium">
                      {form.resumo || "O resumo da notícia aparecerá aqui..."}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground font-semibold">
                      Por {form.autorNome}
                    </p>
                  </div>
                  {form.imagens && form.imagens.length > 0 && form.imagens[0]?.url && (
                    <div className="mb-6">
                      <MediaLightbox
                        images={form.imagens.map((imagem, index) => ({
                          id: String(index),
                          url: imagem.url,
                          alt: imagem.textoAlternativo || form.titulo || `Imagem ${index + 1}`
                        }))}
                        title={form.titulo || "Imagens da Notícia"}
                      />
                    </div>
                  )}
                  <div className="space-y-4 font-display text-base leading-relaxed text-foreground/90">
                    {(form.corpo.trim() ? form.corpo.split("\n\n") : ["Seu texto completo aparecerá aqui..."]).map((paragrafo, i) => (
                      <p key={i}>{paragrafo.trim()}</p>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="Publicação" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Campo label="Status">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({ ...form, status: event.target.value as FormState["status"] })
                      }
                      className="admin-input"
                    >
                      <option value="RASCUNHO">Rascunho</option>
                      <option value="PUBLICADO">Publicado</option>
                      <option value="ARQUIVADO">Arquivado</option>
                    </select>
                  </Campo>
                  <div className="grid gap-3 self-end rounded-md border border-admin-border bg-admin-soft p-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.destaque}
                        onChange={(event) => setForm({ ...form, destaque: event.target.checked })}
                      />
                      Destaque na capa
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.demonstracao}
                        onChange={(event) =>
                          setForm({ ...form, demonstracao: event.target.checked })
                        }
                      />
                      Conteúdo de demonstracao
                    </label>
                  </div>
                </div>
              </TabsContent>
              </div>
            </Tabs>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-admin-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={primeiraEtapa}
                  onClick={() =>
                    setEtapaAtual(etapas[indiceEtapaAtual - 1] ?? etapas[0] ?? "Conteúdo")
                  }
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ultimaEtapa}
                  onClick={() =>
                    setEtapaAtual(
                      etapas[indiceEtapaAtual + 1] ?? etapas[etapas.length - 1] ?? "Conteúdo",
                    )
                  }
                >
                  Proximo
                </Button>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={fecharFormulario}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar noticia"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Pré-visualização Fiel */}
      <Dialog
        open={Boolean(noticiaParaVisualizar)}
        onOpenChange={(aberto) => !aberto && setNoticiaParaVisualizar(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {noticiaParaVisualizar && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                    {noticiaParaVisualizar.categoria.nome}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      noticiaParaVisualizar.status === "PUBLICADO"
                        ? "bg-emerald-100 text-emerald-800"
                        : noticiaParaVisualizar.status === "RASCUNHO"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {noticiaParaVisualizar.status}
                  </span>
                  {noticiaParaVisualizar.destaque && (
                    <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      ★ Destaque
                    </span>
                  )}
                </div>
                <DialogTitle className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight text-primary">
                  {noticiaParaVisualizar.titulo}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base font-medium text-foreground/80">
                  {noticiaParaVisualizar.resumo}
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground font-semibold">
                  <span>Por {noticiaParaVisualizar.autorNome}</span>
                  <span>•</span>
                  <span>{formatarDataPtBr(noticiaParaVisualizar.publicadoEm ?? noticiaParaVisualizar.criadoEm)}</span>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {noticiaParaVisualizar.imagens && noticiaParaVisualizar.imagens.length > 0 ? (
                  <div className="overflow-hidden rounded-lg">
                    <MediaLightbox
                      images={noticiaParaVisualizar.imagens.map((imagem, index) => ({
                        id: imagem.id || String(index),
                        url: imagem.url,
                        alt: imagem.textoAlternativo || noticiaParaVisualizar.titulo || `Imagem ${index + 1}`,
                      }))}
                      title={noticiaParaVisualizar.titulo}
                    />
                  </div>
                ) : noticiaParaVisualizar.imagemUrl ? (
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={noticiaParaVisualizar.imagemUrl}
                      alt={noticiaParaVisualizar.imagemAlt ?? noticiaParaVisualizar.titulo}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="space-y-4 font-display text-base leading-relaxed text-foreground/90">
                  {noticiaParaVisualizar.corpo && noticiaParaVisualizar.corpo.length > 0 ? (
                    noticiaParaVisualizar.corpo.map((paragrafo, i) => (
                      <p key={i}>{paragrafo}</p>
                    ))
                  ) : (
                    <p className="italic text-muted-foreground">Sem conteúdo no corpo da notícia.</p>
                  )}
                </div>

                {noticiaParaVisualizar.fontes && noticiaParaVisualizar.fontes.length > 0 && (
                  <div className="border-t border-admin-border pt-4 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">Fontes consultadas: </span>
                    <span>{noticiaParaVisualizar.fontes.join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-admin-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNoticiaParaVisualizar(null)}
                >
                  Fechar
                </Button>
                {noticiaParaVisualizar.status === "RASCUNHO" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      const item = noticiaParaVisualizar;
                      setNoticiaParaVisualizar(null);
                      publicar(item);
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Publicar agora
                  </Button>
                )}
                <Button
                  type="button"
                  className="gap-1.5"
                  onClick={() => {
                    const item = noticiaParaVisualizar;
                    setNoticiaParaVisualizar(null);
                    editar(item);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Editar notícia
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(noticiaParaExcluir)}
        onOpenChange={(aberto) => {
          if (!aberto) setNoticiaParaExcluir(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir noticia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai remover "{noticiaParaExcluir?.titulo ?? "noticia"}" da administracao.
              Confirme apenas se tiver certeza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              disabled={excluindo}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminMassActions
        entidade="NOTICIA"
        selecionados={Array.from(selecionados)}
        onClearSelection={() => setSelecionados(new Set())}
        onSuccess={carregar}
        opcoesStatus={[
          {
            value: "PUBLICADO",
            label: "Publicar",
            icon: <CheckCircle className="size-4 text-green-600" />,
          },
          {
            value: "RASCUNHO",
            label: "Mover para Rascunho",
            icon: <FileEdit className="size-4" />,
          },
          { value: "ARQUIVADO", label: "Arquivar", icon: <Archive className="size-4" /> },
        ]}
      />
    </AdminShell>
  );
}

function Campo({
  label,
  children,
  obrigatorio,
  ajuda,
}: {
  label: string;
  children: ReactNode;
  obrigatorio?: boolean;
  ajuda?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span>
        {label}
        {obrigatorio && <span className="text-red-700"> *</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {ajuda && <span className="mt-1 block text-xs font-normal text-admin-muted">{ajuda}</span>}
    </label>
  );
}

function montarImagensEdicao(noticia: NoticiaAdmin): FormImagem[] {
  if (noticia.imagens?.length) {
    return noticia.imagens.map((imagem) => ({
      url: imagem.url,
      textoAlternativo: imagem.textoAlternativo ?? "",
      credito: imagem.credito ?? "",
      origem: imagem.origem ?? "UPLOAD_ADMIN",
      tamanhoBytes: imagem.tamanhoBytes ? String(imagem.tamanhoBytes) : "",
    }));
  }

  if (noticia.imagemUrl) {
    return [
      {
        url: noticia.imagemUrl,
        textoAlternativo: noticia.imagemAlt ?? "",
        credito: noticia.imagemCredito ?? "",
        origem: "CAMPO_LEGADO",
        tamanhoBytes: "",
      },
    ];
  }

  return [];
}

