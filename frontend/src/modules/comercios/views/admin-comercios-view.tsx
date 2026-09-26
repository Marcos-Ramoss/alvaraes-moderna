import {
  Edit,
  Eye,
  ImageIcon,
  Link2,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Trash2,
  X,
  CheckCircle,
  FileEdit,
  Archive,
} from "lucide-react";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { AdminShell, AdminLoadingPage } from "@/components/admin/admin-shell";
import { AdminPaginacao, AdminFiltroPeriodo } from "@/components/admin/admin-list-controls";
import { AdminMassActions } from "@/components/admin/admin-mass-actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import { Checkbox } from "@/components/ui/checkbox";
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
  ComercioAdmin,
  SalvarComercioPayload,
  FormState,
  FormImagem,
} from "../types/comercio.types";
import { toast } from "sonner";
import { MediaLightbox } from "@/components/media-lightbox";

const LIMITE_IMAGENS = 5;
const TAMANHO_MAXIMO_IMAGEM_BYTES = 2 * 1024 * 1024;

const formInicial: FormState = {
  nome: "",
  categoriaSlug: "alimentacao",
  area: "Centro",
  descrição: "",
  serviços: "",
  horários: "",
  endereço: "",
  telefone: "",
  whatsapp: "",
  siteExterno: "",
  status: "RASCUNHO",
  possuiPagina: true,
  patrocinado: false,
  demonstracao: false,
  imagens: [],
  videoUrl: "",
  videoTitulo: "",
  videoOrigem: "YOUTUBE",
};

export function AdminComerciosView() {
  const { usuario, carregando } = useAdminAuth();
  const [comercios, setComercios] = useState<ComercioAdmin[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState>(formInicial);
  const [editando, setEditando] = useState<ComercioAdmin | null>(null);
  const [comercioParaVisualizar, setComercioParaVisualizar] = useState<ComercioAdmin | null>(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("Dados principais");
  const [comercioParaExcluir, setComercioParaExcluir] = useState<ComercioAdmin | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const etapas = ["Dados principais", "Detalhes", "Contato", "Midias", "Pré-visualização", "Publicação"];

  function handleSelecionarUm(id: string, checked: boolean) {
    const next = new Set(selecionados);
    if (checked) next.add(id);
    else next.delete(id);
    setSelecionados(next);
  }

  async function carregar(inicio = dataInicio, fim = dataFim) {
    setCarregandoLista(true);
    try {
      setComercios(
        await adminApi.listarComercios({
          dataInicio: inicio || undefined,
          dataFim: fim || undefined,
        })
      );
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setCarregandoLista(false);
    }
  }

  const handleMudarDataInicio = (valor: string) => {
    setDataInicio(valor);
    setPagina(1);
    carregar(valor, dataFim);
  };

  const handleMudarDataFim = (valor: string) => {
    setDataFim(valor);
    setPagina(1);
    carregar(dataInicio, valor);
  };

  const handleLimparPeriodo = () => {
    setDataInicio("");
    setDataFim("");
    setPagina(1);
    carregar("", "");
  };

  useEffect(() => {
    carregar();
  }, []);
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return termo
      ? comercios.filter((item) =>
          `${item.nome} ${item.area} ${item.categoria.nome}`.toLowerCase().includes(termo),
        )
      : comercios;
  }, [busca, comercios]);
  useEffect(() => {
    setPagina(1);
  }, [busca, porPagina]);
  const paginaAtual = Math.min(pagina, Math.max(1, Math.ceil(filtrados.length / porPagina)));
  const paginados = filtrados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  useEffect(() => {
    setSelecionados(new Set());
  }, [pagina, porPagina, busca]);

  const todosDaPaginaSelecionados =
    paginados.length > 0 && paginados.every((c) => selecionados.has(c.id));

  function handleSelecionarTodos(checked: boolean) {
    if (checked) {
      setSelecionados(new Set(paginados.map((c) => c.id)));
    } else {
      setSelecionados(new Set());
    }
  }
  if (carregando) return <AdminLoadingPage usuario={usuario} />;
  const indiceEtapa = Math.max(etapas.indexOf(etapaAtual), 0);

  function atualizarImagem(index: number, campo: keyof FormImagem, valor: string) {
    setForm({
      ...form,
      imagens: form.imagens.map((imagem, atual) =>
        atual === index ? { ...imagem, [campo]: valor } : imagem,
      ),
    });
  }
  function montarImagensPayload() {
    return form.imagens
      .map((imagem, ordem) => ({
        url: imagem.url.trim(),
        ...(imagem.textoAlternativo.trim()
          ? { textoAlternativo: imagem.textoAlternativo.trim() }
          : {}),
        ...(imagem.credito.trim() ? { credito: imagem.credito.trim() } : {}),
        ...(imagem.origem.trim() ? { origem: imagem.origem.trim() } : {}),
        ...(imagem.tamanhoBytes.trim() ? { tamanhoBytes: Number(imagem.tamanhoBytes) } : {}),
        ordem,
      }))
      .filter((imagem) => imagem.url);
  }
  function montarPayload(): SalvarComercioPayload {
    const payload: SalvarComercioPayload = {
      nome: form.nome.trim(),
      categoriaSlug: form.categoriaSlug,
      area: form.area.trim(),
      possuiPagina: form.possuiPagina,
      patrocinado: form.patrocinado,
      demonstracao: form.demonstracao,
      status: form.status,
      imagens: montarImagensPayload(),
      video: form.videoUrl.trim()
        ? {
            url: form.videoUrl.trim(),
            ...(form.videoTitulo.trim() ? { titulo: form.videoTitulo.trim() } : {}),
            origem: form.videoOrigem.trim() || "LINK_EXTERNO",
          }
        : null,
    };
    payload.descricao = form.descrição.trim();
    const serviços = form.serviços
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    payload.servicos = serviços;
    const horários = form.horários
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    payload.horarios = horários;
    payload.endereco = form.endereço.trim();
    for (const campo of ["telefone", "whatsapp", "siteExterno"] as const) {
      const valor = form[campo].trim();
      if (valor) payload[campo] = valor;
    }
    return payload;
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (!form.nome.trim() || !form.area.trim()) {
      setErro("Preencha o nome do estabelecimento e a área ou bairro.");
      setEtapaAtual("Dados principais");
      return;
    }
    if (
      form.imagens.some(
        (imagem) =>
          imagem.tamanhoBytes.trim() &&
          (!Number.isFinite(Number(imagem.tamanhoBytes)) ||
            Number(imagem.tamanhoBytes) > TAMANHO_MAXIMO_IMAGEM_BYTES),
      )
    ) {
      setErro("Cada imagem deve ter no máximo 2 MB.");
      setEtapaAtual("Midias");
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await adminApi.atualizarComercio(editando.id, montarPayload());
        toast.success("Comércio atualizado com sucesso.");
      } else {
        await adminApi.criarComercio(montarPayload());
        toast.success("Comércio criado com sucesso.");
      }
      fecharFormulario();
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setSalvando(false);
    }
  }
  function editar(item: ComercioAdmin) {
    setEditando(item);
    setForm({
      nome: item.nome,
      categoriaSlug: item.categoria.slug,
      area: item.area,
      descrição: item.descricao ?? "",
      serviços: (item.servicos ?? []).join(", "),
      horários: (item.horarios ?? []).join("\n"),
      endereço: item.endereco ?? "",
      telefone: item.telefone ?? "",
      whatsapp: item.whatsapp ?? "",
      siteExterno: item.siteExterno ?? "",
      possuiPagina: item.possuiPagina,
      patrocinado: item.patrocinado,
      demonstracao: item.demonstracao,
      status: item.status,
      imagens: (item.imagens ?? [])
        .filter((midia) => midia.tipoMidia === "IMAGEM")
        .sort((a, b) => a.ordem - b.ordem)
        .map((midia) => ({
          url: midia.url,
          textoAlternativo: midia.textoAlternativo ?? "",
          credito: midia.credito ?? "",
          origem: midia.origem ?? "UPLOAD_ADMIN",
          tamanhoBytes: midia.tamanhoBytes ? String(midia.tamanhoBytes) : "",
        })),
      videoUrl: item.video?.url ?? "",
      videoTitulo: item.video?.titulo ?? "",
      videoOrigem: item.video?.origem ?? "LINK_EXTERNO",
    });
    setEtapaAtual("Dados principais");
    setFormularioAberto(true);
  }
  function novoComercio() {
    setEditando(null);
    setForm(formInicial);
    setErro("");
    setEtapaAtual("Dados principais");
    setFormularioAberto(true);
  }
  function fecharFormulario() {
    setFormularioAberto(false);
    setEditando(null);
    setForm(formInicial);
    setEtapaAtual("Dados principais");
  }
  async function publicar(item: ComercioAdmin) {
    try {
      await adminApi.publicarComercio(item.id);
      toast.success("Comércio publicado.");
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    }
  }
  async function excluir() {
    if (!comercioParaExcluir) return;
    setExcluindo(true);
    try {
      await adminApi.excluirComercio(comercioParaExcluir.id);
      setComercioParaExcluir(null);
      toast.success("Comércio excluído.");
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <AdminShell usuario={usuario}>
      <AdminMassActions
        entidade="COMERCIO"
        selecionados={Array.from(selecionados)}
        onClearSelection={() => setSelecionados(new Set())}
        onSuccess={() => {
          setSelecionados(new Set());
          carregar();
        }}
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="admin-eyebrow">Comércios</span>
          <h1 className="mt-3 font-display text-4xl font-semibold">Comércios</h1>
          <p className="admin-subtitle mt-2">
            Mantenha o guia comercial com dados, mídias e destaques.
          </p>
        </div>
        <button type="button" onClick={novoComercio} className="admin-primary-action">
          <Plus className="h-4 w-4" />
          Novo comércio
        </button>
      </div>
      {erro && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <section className="admin-surface mt-6">
        <div className="grid gap-3 border-b border-admin-border p-4 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Buscar comércio</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar comércio"
              className="admin-input pl-9"
            />
          </label>
          <Button type="button" variant="outline" onClick={() => carregar()}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="border-b border-admin-border bg-admin-background/40 p-4">
          <AdminFiltroPeriodo
            dataInicio={dataInicio}
            dataFim={dataFim}
            aoMudarDataInicio={handleMudarDataInicio}
            aoMudarDataFim={handleMudarDataFim}
            aoLimpar={handleLimparPeriodo}
            totalRegistros={filtrados.length}
            titulo="Filtrar por Período de Cadastro"
          />
        </div>
        {carregandoLista ? (
          <p className="admin-subtitle p-5 text-sm">Carregando comercios...</p>
        ) : (
          <>
            <div className="divide-y divide-admin-border md:hidden">
              {paginados.map((item) => (
                <article
                  key={item.id}
                  className={`grid gap-4 p-4 transition-colors ${
                    selecionados.has(item.id) ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  onClick={() => handleSelecionarUm(item.id, !selecionados.has(item.id))}
                >
                  <div className="flex gap-4">
                    <div className="pt-1">
                      <Checkbox
                        checked={selecionados.has(item.id)}
                        onCheckedChange={(c) => handleSelecionarUm(item.id, c as boolean)}
                        aria-label="Selecionar comercio"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-admin-foreground">{item.nome}</h3>
                      <p className="mt-1 text-sm text-admin-muted truncate">{item.categoria.nome}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm text-admin-muted">
                    <div className="flex justify-between">
                      <span><span className="font-semibold uppercase tracking-wider text-xs">Local:</span> {item.area || "Não informado"}</span>
                      <span className="font-semibold">{item.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setComercioParaVisualizar(item);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3 text-sm font-semibold text-admin-foreground hover:bg-admin-background flex-1"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        editar(item);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3 text-sm font-semibold text-admin-foreground hover:bg-admin-background flex-1"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        publicar(item);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3 text-sm font-semibold text-admin-foreground hover:bg-admin-background flex-1"
                    >
                      <Send className="h-4 w-4" />
                      Publicar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setComercioParaExcluir(item);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="px-4 py-3 w-[40px]">
                    <Checkbox
                      checked={todosDaPaginaSelecionados}
                      onCheckedChange={(c) => handleSelecionarTodos(c as boolean)}
                      aria-label="Selecionar tudo"
                    />
                  </th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Local</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {paginados.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selecionados.has(item.id)}
                        onCheckedChange={(c) => handleSelecionarUm(item.id, c as boolean)}
                        aria-label="Selecionar comércio"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold">{item.nome}</td>
                    <td className="px-4 py-3">{item.categoria.nome}</td>
                    <td className="px-4 py-3">{item.area}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setComercioParaVisualizar(item)}
                          className="admin-icon-action"
                          title="Visualizar comércio"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editar(item)}
                          className="admin-icon-action"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => publicar(item)}
                          className="admin-icon-action"
                          title="Publicar"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setComercioParaExcluir(item)}
                          className="admin-icon-action text-red-700"
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
            {!filtrados.length && (
              <p className="p-6 text-sm text-admin-muted">Nenhum comércio encontrado.</p>
            )}
            {filtrados.length > 0 && (
              <div className="border-t border-admin-border px-4 pb-4 pt-4">
                <AdminPaginacao
                  paginaAtual={paginaAtual}
                  totalPaginas={Math.max(1, Math.ceil(filtrados.length / porPagina))}
                  totalItens={filtrados.length}
                  porPagina={porPagina}
                  setPagina={setPagina}
                  setPorPagina={setPorPagina}
                  selectId="comercios-admin-por-pagina"
                />
              </div>
            )}
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
              {editando ? "Editar comércio" : "Novo comércio"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações, revise os detalhes e salve quando estiver tudo pronto.
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
              <TabsContent value="Dados principais" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Campo label="Nome do estabelecimento" obrigatorio>
                    <input
                      value={form.nome}
                      onChange={(event) => setForm({ ...form, nome: event.target.value })}
                      className="admin-input"
                      required
                    />
                  </Campo>
                  <Campo label="Categoria">
                    <select
                      value={form.categoriaSlug}
                      onChange={(event) => setForm({ ...form, categoriaSlug: event.target.value })}
                      className="admin-input"
                    >
                      <option value="alimentacao">Alimentação</option>
                      <option value="comercio">Comércio</option>
                      <option value="servicos">Serviços</option>
                      <option value="saude">Saúde</option>
                      <option value="transporte">Transporte</option>
                    </select>
                  </Campo>
                  <Campo label="Área ou bairro" obrigatorio>
                    <input
                      value={form.area}
                      onChange={(event) => setForm({ ...form, area: event.target.value })}
                      className="admin-input"
                      required
                    />
                  </Campo>
                </div>
              </TabsContent>
              <TabsContent value="Detalhes" className="mt-0">
                <div className="grid gap-4">
                  <Campo label="Descrição">
                    <textarea
                      value={form.descrição}
                      onChange={(event) => setForm({ ...form, descrição: event.target.value })}
                      className="admin-textarea"
                    />
                  </Campo>
                  <Campo label="Serviços separados por vírgula">
                    <textarea
                      value={form.serviços}
                      onChange={(event) => setForm({ ...form, serviços: event.target.value })}
                      className="admin-textarea"
                    />
                  </Campo>
                  <Campo label="Horários, um por linha">
                    <textarea
                      value={form.horários}
                      onChange={(event) => setForm({ ...form, horários: event.target.value })}
                      className="admin-textarea"
                    />
                  </Campo>
                </div>
              </TabsContent>
              <TabsContent value="Contato" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Campo label="Endereço">
                    <input
                      value={form.endereço}
                      onChange={(event) => setForm({ ...form, endereço: event.target.value })}
                      className="admin-input"
                    />
                  </Campo>
                  <Campo label="Telefone">
                    <input
                      value={form.telefone}
                      onChange={(event) => setForm({ ...form, telefone: event.target.value })}
                      className="admin-input"
                    />
                  </Campo>
                  <Campo label="WhatsApp">
                    <input
                      value={form.whatsapp}
                      onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
                      className="admin-input"
                    />
                  </Campo>
                  <Campo label="Site externo">
                    <input
                      type="url"
                      value={form.siteExterno}
                      onChange={(event) => setForm({ ...form, siteExterno: event.target.value })}
                      className="admin-input"
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
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          form.imagens.length < LIMITE_IMAGENS &&
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
                          })
                        }
                        disabled={form.imagens.length >= LIMITE_IMAGENS}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Adicionar imagem
                      </Button>
                    </div>
                    {form.imagens.length === 0 ? (
                      <p className="p-4 text-sm text-admin-muted">
                        Nenhuma imagem cadastrada para este comércio.
                      </p>
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
                                  Máximo de 2 MB quando o tamanho for informado.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    imagens: form.imagens.filter((_, atual) => atual !== index),
                                  })
                                }
                                title="Remover imagem"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-4">
                              <ImageUploader
                                url={imagem.url}
                                onChange={(novaUrl) => atualizarImagem(index, "url", novaUrl)}
                                pasta="comercios"
                                label="Foto do comércio"
                                ajuda="Selecione a foto ou logo do comércio para o Supabase (até 5 MB)"
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
                              <Campo label="Crédito">
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
                      <Campo label="Link do vídeo">
                        <input
                          value={form.videoUrl}
                          onChange={(event) => setForm({ ...form, videoUrl: event.target.value })}
                          className="admin-input"
                          placeholder="https://www.youtube.com/..."
                        />
                      </Campo>
                      <Campo label="Título do vídeo">
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
                      {form.nome || "Nome do estabelecimento aparecerá aqui..."}
                    </h1>
                    <p className="mt-3 text-sm text-foreground/80 font-medium whitespace-pre-wrap">
                      {form.descrição || "A descrição aparecerá aqui..."}
                    </p>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-admin-border bg-white p-4">
                      <h3 className="font-semibold text-primary text-sm mb-2">Informações de Contato</h3>
                      <p className="text-sm text-muted-foreground mb-1"><strong>Endereço:</strong> {form.endereço || "Não informado"}</p>
                      <p className="text-sm text-muted-foreground mb-1"><strong>Telefone:</strong> {form.telefone || "Não informado"}</p>
                      <p className="text-sm text-muted-foreground mb-1"><strong>WhatsApp:</strong> {form.whatsapp || "Não informado"}</p>
                    </div>
                    <div className="rounded-lg border border-admin-border bg-white p-4">
                      <h3 className="font-semibold text-primary text-sm mb-2">Serviços e Horários</h3>
                      <p className="text-sm text-muted-foreground mb-2"><strong>Horários:</strong> {form.horários || "Não informado"}</p>
                      <div className="flex flex-wrap gap-1">
                        {(form.serviços ? form.serviços.split(",").map(s => s.trim()) : ["Serviço 1"]).map((s, i) => (
                          <span key={i} className="inline-block bg-secondary px-2 py-1 text-[10px] rounded border border-border">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {form.imagens && form.imagens.length > 0 && form.imagens[0]?.url && (
                    <div className="mb-6">
                      <MediaLightbox
                        images={form.imagens.map((imagem, index) => ({
                          id: String(index),
                          url: imagem.url,
                          alt: imagem.textoAlternativo || form.nome || `Imagem ${index + 1}`
                        }))}
                        title={form.nome || "Imagens"}
                      />
                    </div>
                  )}
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
                        checked={form.possuiPagina}
                        onChange={(event) =>
                          setForm({ ...form, possuiPagina: event.target.checked })
                        }
                      />
                      Possui página completa
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.patrocinado}
                        onChange={(event) =>
                          setForm({ ...form, patrocinado: event.target.checked })
                        }
                      />
                      Destaque patrocinado
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.demonstracao}
                        onChange={(event) =>
                          setForm({ ...form, demonstracao: event.target.checked })
                        }
                      />
                      Conteúdo de demonstração
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
                  disabled={indiceEtapa <= 0}
                  onClick={() => setEtapaAtual(etapas[indiceEtapa - 1] ?? "Dados principais")}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={indiceEtapa >= etapas.length - 1}
                  onClick={() => setEtapaAtual(etapas[indiceEtapa + 1] ?? "Publicação")}
                >
                  Próximo
                </Button>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={fecharFormulario}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar comércio"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Pré-visualização Fiel */}
      <Dialog
        open={Boolean(comercioParaVisualizar)}
        onOpenChange={(aberto) => !aberto && setComercioParaVisualizar(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {comercioParaVisualizar && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                    {comercioParaVisualizar.categoria.nome}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      comercioParaVisualizar.status === "PUBLICADO"
                        ? "bg-emerald-100 text-emerald-800"
                        : comercioParaVisualizar.status === "RASCUNHO"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {comercioParaVisualizar.status}
                  </span>
                  {comercioParaVisualizar.patrocinado && (
                    <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      ★ Patrocinado
                    </span>
                  )}
                </div>
                <DialogTitle className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight text-primary">
                  {comercioParaVisualizar.nome}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-foreground/80">
                  {comercioParaVisualizar.area}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {comercioParaVisualizar.imagens && comercioParaVisualizar.imagens.length > 0 && (
                  <div className="overflow-hidden rounded-lg">
                    <MediaLightbox
                      images={comercioParaVisualizar.imagens.map((imagem, index) => ({
                        id: imagem.id || String(index),
                        url: imagem.url,
                        alt: imagem.textoAlternativo || comercioParaVisualizar.nome || `Imagem ${index + 1}`,
                      }))}
                      title={comercioParaVisualizar.nome}
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-admin-border bg-white p-4">
                    <h3 className="mb-2 text-sm font-semibold text-primary">Informações de Contato</h3>
                    <p className="mb-1 text-sm text-muted-foreground">
                      <strong className="text-foreground">Endereço: </strong>
                      {comercioParaVisualizar.endereco || comercioParaVisualizar.area || "Não informado"}
                    </p>
                    {comercioParaVisualizar.telefone && (
                      <p className="mb-1 text-sm text-muted-foreground">
                        <strong className="text-foreground">Telefone: </strong>
                        {comercioParaVisualizar.telefone}
                      </p>
                    )}
                    {comercioParaVisualizar.whatsapp && (
                      <p className="mb-1 text-sm text-muted-foreground">
                        <strong className="text-foreground">WhatsApp: </strong>
                        <span className="text-emerald-700 font-semibold">{comercioParaVisualizar.whatsapp}</span>
                      </p>
                    )}
                    {comercioParaVisualizar.siteExterno && (
                      <p className="mb-1 text-sm text-muted-foreground">
                        <strong className="text-foreground">Site / Link: </strong>
                        <a href={comercioParaVisualizar.siteExterno} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          {comercioParaVisualizar.siteExterno}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-admin-border bg-white p-4">
                    <h3 className="mb-2 text-sm font-semibold text-primary">Horários e Serviços</h3>
                    {comercioParaVisualizar.horarios && comercioParaVisualizar.horarios.length > 0 ? (
                      <div className="mb-2 text-sm text-muted-foreground">
                        <strong className="text-foreground">Horários: </strong>
                        <ul className="mt-1 list-disc pl-4 text-xs space-y-0.5">
                          {comercioParaVisualizar.horarios.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mb-2 text-sm text-muted-foreground">Horários não informados</p>
                    )}
                    {comercioParaVisualizar.servicos && comercioParaVisualizar.servicos.length > 0 && (
                      <div>
                        <strong className="text-foreground text-xs">Serviços / Produtos: </strong>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {comercioParaVisualizar.servicos.map((s, i) => (
                            <span key={i} className="inline-block rounded border border-border bg-secondary px-2 py-0.5 text-[11px] text-primary">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {comercioParaVisualizar.descricao && (
                  <div className="rounded-lg border border-admin-border bg-gray-50/50 p-4">
                    <h3 className="mb-1 text-sm font-semibold text-primary">Sobre o estabelecimento</h3>
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {comercioParaVisualizar.descricao}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-admin-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setComercioParaVisualizar(null)}
                >
                  Fechar
                </Button>
                {comercioParaVisualizar.status === "RASCUNHO" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      const item = comercioParaVisualizar;
                      setComercioParaVisualizar(null);
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
                    const item = comercioParaVisualizar;
                    setComercioParaVisualizar(null);
                    editar(item);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Editar comércio
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(comercioParaExcluir)}
        onOpenChange={(aberto) => !aberto && setComercioParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comércio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação vai remover “{comercioParaExcluir?.nome ?? "comércio"}” da administração.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={excluir}
              disabled={excluindo}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
