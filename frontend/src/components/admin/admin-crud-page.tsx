import { Edit, Eye, ImageIcon, Plus, RefreshCcw, Search, Send, Trash2, X } from "lucide-react";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { formatarDataPtBr, formatarErroApi } from "../../lib/admin-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AdminShell, AdminLoadingPage } from "./admin-shell";
import { AdminPaginacao, AdminFiltroPeriodo } from "./admin-list-controls";
import { AdminMassActions } from "./admin-mass-actions";
import { ImageUploader } from "./image-uploader";
import { useAdminAuth } from "./use-admin-auth";
import { Checkbox } from "../ui/checkbox";
import { CheckCircle, FileEdit, Archive } from "lucide-react";
import { toast } from "sonner";

export type FormImagemCrud = {
  url: string;
  textoAlternativo: string;
  credito: string;
  origem: string;
  tamanhoBytes: string;
};

type ValorFormulario = string | boolean | FormImagemCrud[];
type Formulario = Record<string, ValorFormulario>;

type CampoFormulario = {
  chave: string;
  label: string;
  tipo:
    | "text"
    | "url"
    | "textarea"
    | "select"
    | "checkbox"
    | "lines"
    | "tags"
    | "datetime"
    | "imagens";
  obrigatorio?: boolean;
  opcoes?: Array<{ valor: string; label: string }>;
  largo?: boolean;
  etapa?: string;
  placeholder?: string;
  ajuda?: string;
};

type Coluna<T> = {
  label: string;
  valor: (item: T) => ReactNode;
};

type AdminCrudPageProps<T, P> = {
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  entidadeParaMassa?: "NOTICIA" | "COMERCIO" | "EVENTO" | "CURSO" | "COMENTARIO" | "CONTATO" | "PEDIDO_ANUNCIO";
  novoRotulo: string;
  formularioInicial: Formulario;
  campos: CampoFormulario[];
  colunas: Coluna<T>[];
  listar: (filtros?: { dataInicio?: string | undefined; dataFim?: string | undefined }) => Promise<T[]>;
  criar: (payload: P) => Promise<unknown>;
  atualizar: (id: string, payload: P) => Promise<unknown>;
  publicar: (id: string) => Promise<unknown>;
  excluir: (id: string) => Promise<unknown>;
  paraFormulario: (item: T) => Formulario;
  paraPayload: (formulario: Formulario) => P;
  obterId: (item: T) => string;
  obterTitulo: (item: T) => string;
  buscarTexto: (item: T) => string;
  renderPreview?: (formulario: Formulario) => ReactNode;
};

export function AdminCrudPage<T extends { id: string }, P>({
  titulo,
  subtitulo,
  etiqueta,
  novoRotulo,
  formularioInicial,
  campos,
  colunas,
  listar,
  criar,
  atualizar,
  publicar,
  excluir,
  paraFormulario,
  paraPayload,
  obterId,
  obterTitulo,
  buscarTexto,
  entidadeParaMassa,
  renderPreview,
}: AdminCrudPageProps<T, P>) {
  const { usuario, carregando } = useAdminAuth();
  const [items, setItems] = useState<T[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);
  const [editando, setEditando] = useState<T | null>(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("");
  const [itemParaVisualizar, setItemParaVisualizar] = useState<T | null>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<T | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  function handleSelecionarUm(id: string, checked: boolean) {
    const next = new Set(selecionados);
    if (checked) next.add(id);
    else next.delete(id);
    setSelecionados(next);
  }

  async function carregar(inicio = dataInicio, fim = dataFim) {
    setCarregandoLista(true);
    try {
      const dados = await listar({
        dataInicio: inicio || undefined,
        dataFim: fim || undefined,
      });
      setItems(dados);
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

  const etapas = useMemo(() => {
    const nomes = campos.map((campo) => campo.etapa ?? "Dados principais");
    const baseEtapas = [...new Set(nomes)];
    if (renderPreview) {
      baseEtapas.push("Pré-visualização");
    }
    return baseEtapas;
  }, [campos, renderPreview]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) => buscarTexto(item).toLowerCase().includes(termo));
  }, [busca, buscarTexto, items]);

  useEffect(() => {
    setPagina(1);
  }, [busca, porPagina]);

  const paginaAtual = Math.min(pagina, Math.max(1, Math.ceil(filtrados.length / porPagina)));
  const paginados = filtrados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  useEffect(() => {
    setSelecionados(new Set());
  }, [pagina, porPagina, busca]);

  const todosDaPaginaSelecionados =
    paginados.length > 0 &&
    paginados.every((item) => selecionados.has(obterId(item)));

  function handleSelecionarTodos(checked: boolean) {
    if (checked) {
      setSelecionados(new Set(paginados.map((item) => obterId(item))));
    } else {
      setSelecionados(new Set());
    }
  }

  const indiceEtapaAtual = Math.max(
    etapas.findIndex((etapa) => etapa === (etapaAtual || etapas[0])),
    0,
  );
  const primeiraEtapa = indiceEtapaAtual <= 0;
  const ultimaEtapa = indiceEtapaAtual >= etapas.length - 1;

  if (carregando) return <AdminLoadingPage usuario={usuario} />;

  function atualizarCampo(chave: string, valor: ValorFormulario) {
    setFormulario((atual) => ({ ...atual, [chave]: valor }));
  }

  function novoItem() {
    setEditando(null);
    setFormulario(formularioInicial);
    setErro("");
    setMensagem("");
    setEtapaAtual(etapas[0] ?? "Dados principais");
    setFormularioAberto(true);
  }

  function editar(item: T) {
    setEditando(item);
    setFormulario(paraFormulario(item));
    setErro("");
    setMensagem("");
    setEtapaAtual(etapas[0] ?? "Dados principais");
    setFormularioAberto(true);
  }

  function fecharFormulario() {
    setFormularioAberto(false);
    setEditando(null);
    setFormulario(formularioInicial);
    setEtapaAtual(etapas[0] ?? "Dados principais");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const campoInvalido = campos.find((campo) => {
      if (!campo.obrigatorio) return false;
      const valor = formulario[campo.chave];
      return typeof valor === "string" ? valor.trim().length === 0 : !valor;
    });

    if (campoInvalido) {
      const textoErro = `Preencha o campo obrigatorio: ${campoInvalido.label}.`;
      setErro(textoErro);
      setEtapaAtual(campoInvalido.etapa ?? "Dados principais");
      toast.error(textoErro);
      return;
    }

    const campoImagensInvalido = campos.find((campo) => {
      if (campo.tipo !== "imagens") return false;
      const imagens = formulario[campo.chave];
      return (
        Array.isArray(imagens) &&
        imagens.some((imagem) => {
          if (!imagem.tamanhoBytes.trim()) return false;
          const tamanho = Number(imagem.tamanhoBytes);
          return !Number.isFinite(tamanho) || tamanho > TAMANHO_MAXIMO_IMAGEM_BYTES;
        })
      );
    });

    if (campoImagensInvalido) {
      const textoErro = "Cada imagem deve ter no maximo 2 MB.";
      setErro(textoErro);
      setEtapaAtual(campoImagensInvalido.etapa ?? "Midias");
      toast.error(textoErro);
      return;
    }

    setSalvando(true);

    try {
      const payload = paraPayload(formulario);
      if (editando) {
        await atualizar(obterId(editando), payload);
        const textoMensagem = `${titulo} atualizado com sucesso.`;
        setMensagem(textoMensagem);
        toast.success(textoMensagem);
      } else {
        await criar(payload);
        const textoMensagem = `${titulo} criado com sucesso.`;
        setMensagem(textoMensagem);
        toast.success(textoMensagem);
      }
      fecharFormulario();
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  async function publicarItem(item: T) {
    setErro("");
    setMensagem("");
    try {
      await publicar(obterId(item));
      setMensagem("Publicação realizada.");
      toast.success("Publicação realizada.");
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    }
  }

  async function confirmarExclusao() {
    if (!itemParaExcluir) return;
    setErro("");
    setMensagem("");
    setExcluindo(true);
    try {
      await excluir(obterId(itemParaExcluir));
      setMensagem("Registro excluido.");
      toast.success("Registro excluido.");
      setItemParaExcluir(null);
      await carregar();
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <AdminShell usuario={usuario}>
      {entidadeParaMassa && (
        <AdminMassActions
          entidade={entidadeParaMassa}
          selecionados={Array.from(selecionados)}
          onClearSelection={() => setSelecionados(new Set())}
          onSuccess={() => {
            setSelecionados(new Set());
            carregar();
          }}
          opcoesStatus={[
            { value: "PUBLICADO", label: "Publicar", icon: <CheckCircle className="size-4 text-green-600" /> },
            { value: "RASCUNHO", label: "Mover para Rascunho", icon: <FileEdit className="size-4" /> },
            { value: "ARQUIVADO", label: "Arquivar", icon: <Archive className="size-4" /> },
          ]}
        />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="admin-eyebrow">{etiqueta}</span>
          <h1 className="mt-3 font-display text-4xl font-semibold">{titulo}</h1>
          <p className="admin-subtitle mt-2">{subtitulo}</p>
        </div>
        <button
          type="button"
          onClick={novoItem}
          className="admin-primary-action"
        >
          <Plus className="h-4 w-4" />
          {novoRotulo}
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
            <span className="sr-only">Buscar em {titulo.toLowerCase()}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder={`Buscar em ${titulo.toLowerCase()}`}
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
            titulo={titulo === "Agenda" ? "Filtrar por Data do Evento" : "Filtrar por Período de Cadastro"}
          />
        </div>

        {carregandoLista ? (
          <p className="admin-subtitle p-5 text-sm">Carregando registros...</p>
        ) : filtrados.length === 0 ? (
          <div className="p-6">
            <p className="font-display text-xl font-semibold">Nenhum registro encontrado</p>
            <p className="admin-subtitle mt-1 text-sm">
              Ajuste a busca ou cadastre um novo item para comecar.
            </p>
          </div>
        ) : (
          <>
          <div className="grid gap-3 p-4 md:hidden">
            {paginados.map((item) => (
              <article
                key={obterId(item)}
                className={`admin-mobile-card transition-colors ${
                  entidadeParaMassa && selecionados.has(obterId(item)) ? "bg-primary/5 border-primary/20" : ""
                }`}
                onClick={() => {
                  if (entidadeParaMassa) {
                    handleSelecionarUm(obterId(item), !selecionados.has(obterId(item)));
                  }
                }}
              >
                <div className="flex gap-4">
                  {entidadeParaMassa && (
                    <div className="pt-1">
                      <Checkbox
                        checked={selecionados.has(obterId(item))}
                        onCheckedChange={(c) => handleSelecionarUm(obterId(item), c as boolean)}
                        aria-label="Selecionar item"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold leading-snug">{obterTitulo(item)}</h2>
                    <dl className="mt-3 grid gap-2 text-sm">
                      {colunas.slice(1).map((coluna) => (
                        <div key={coluna.label}>
                          <dt className="admin-label-muted">
                            {coluna.label}
                          </dt>
                          <dd className="mt-1 text-admin-foreground">{coluna.valor(item)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemParaVisualizar(item);
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
                      editar(item);
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
                      publicarItem(item);
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Publicar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemParaExcluir(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="admin-table-head">
                <tr>
                  {entidadeParaMassa && (
                    <th className="px-4 py-3 w-[40px]">
                      <Checkbox
                        checked={todosDaPaginaSelecionados}
                        onCheckedChange={(c) => handleSelecionarTodos(c as boolean)}
                        aria-label="Selecionar tudo"
                      />
                    </th>
                  )}
                  {colunas.map((coluna) => (
                    <th key={coluna.label} className="px-4 py-3">
                      {coluna.label}
                    </th>
                  ))}
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {paginados.map((item) => (
                  <tr key={obterId(item)}>
                    {entidadeParaMassa && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selecionados.has(obterId(item))}
                          onCheckedChange={(c) => handleSelecionarUm(obterId(item), c as boolean)}
                          aria-label="Selecionar item"
                        />
                      </td>
                    )}
                    {colunas.map((coluna) => (
                      <td key={coluna.label} className="px-4 py-3">
                        {coluna.valor(item)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setItemParaVisualizar(item)}
                          className="admin-icon-action"
                          title={`Visualizar ${etiqueta.toLowerCase()}`}
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
                          onClick={() => publicarItem(item)}
                          className="admin-icon-action"
                          title="Publicar"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemParaExcluir(item)}
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
              totalPaginas={Math.max(1, Math.ceil(filtrados.length / porPagina))}
              totalItens={filtrados.length}
              porPagina={porPagina}
              setPagina={setPagina}
              setPorPagina={setPorPagina}
              selectId={`${etiqueta.toLowerCase()}-por-pagina`}
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
              {editando ? `Editar ${etiqueta.toLowerCase()}` : novoRotulo}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações, revise os detalhes e salve quando estiver tudo pronto.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={salvar}>
            <Tabs
              value={etapaAtual || etapas[0] || "Dados principais"}
              onValueChange={setEtapaAtual}
            >
              {etapas.length > 1 && (
                <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
                  {etapas.map((etapa) => (
                    <TabsTrigger key={etapa} value={etapa}>
                      {etapa}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}

              <div className="min-h-[55vh] sm:min-h-[400px] md:min-h-[500px]">
              {etapas.map((etapa) => (
                <TabsContent key={etapa} value={etapa} className="mt-0">
                  {etapa === "Pré-visualização" && renderPreview ? (
                    renderPreview(formulario)
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {campos
                        .filter((campo) => (campo.etapa ?? "Dados principais") === etapa)
                        .map((campo) => (
                          <Campo
                            key={campo.chave}
                            label={campo.label}
                            {...(campo.obrigatorio ? { obrigatorio: true } : {})}
                            {...(campo.ajuda ? { ajuda: campo.ajuda } : {})}
                            {...(campo.largo ? { largo: true } : {})}
                          >
                            {renderCampo(campo, formulario, atualizarCampo)}
                          </Campo>
                        ))}
                    </div>
                  )}
                </TabsContent>
              ))}
              </div>
            </Tabs>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-admin-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={primeiraEtapa}
                  onClick={() =>
                    setEtapaAtual(etapas[indiceEtapaAtual - 1] ?? etapas[0] ?? "Dados principais")
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
                      etapas[indiceEtapaAtual + 1] ??
                        etapas[etapas.length - 1] ??
                        "Dados principais",
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
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Pré-visualização Fiel */}
      <Dialog
        open={Boolean(itemParaVisualizar)}
        onOpenChange={(aberto) => !aberto && setItemParaVisualizar(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {itemParaVisualizar && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                    {etiqueta}
                  </span>
                </div>
                <DialogTitle className="mt-2 font-display text-2xl font-bold leading-tight text-primary">
                  {obterTitulo(itemParaVisualizar)}
                </DialogTitle>
                <DialogDescription>
                  Pré-visualização do conteúdo e detalhes do registro.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                {renderPreview ? (
                  renderPreview(paraFormulario(itemParaVisualizar))
                ) : (
                  <div className="space-y-4 rounded-lg border border-admin-border bg-gray-50/50 p-4">
                    <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                      {colunas.map((coluna) => (
                        <div key={coluna.label}>
                          <dt className="admin-label-muted">{coluna.label}</dt>
                          <dd className="mt-1 font-medium text-admin-foreground">{coluna.valor(itemParaVisualizar)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-admin-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setItemParaVisualizar(null)}
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    const item = itemParaVisualizar;
                    setItemParaVisualizar(null);
                    publicarItem(item);
                  }}
                >
                  <Send className="h-4 w-4" />
                  Publicar
                </Button>
                <Button
                  type="button"
                  className="gap-1.5"
                  onClick={() => {
                    const item = itemParaVisualizar;
                    setItemParaVisualizar(null);
                    editar(item);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Editar {etiqueta.toLowerCase()}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(itemParaExcluir)}
        onOpenChange={(aberto) => {
          if (!aberto) setItemParaExcluir(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai remover "{itemParaExcluir ? obterTitulo(itemParaExcluir) : "registro"}"
              da administracao. Confirme apenas se tiver certeza.
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
    </AdminShell>
  );
}

function Campo({
  label,
  children,
  largo,
  obrigatorio,
  ajuda,
}: {
  label: string;
  children: ReactNode;
  largo?: boolean;
  obrigatorio?: boolean;
  ajuda?: string;
}) {
  return (
    <label className={`block text-sm font-semibold ${largo ? "md:col-span-2" : ""}`}>
      <span>
        {label}
        {obrigatorio && <span className="text-red-700"> *</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {ajuda && <span className="mt-1 block text-xs font-normal text-admin-muted">{ajuda}</span>}
    </label>
  );
}

function renderCampo(
  campo: CampoFormulario,
  formulario: Formulario,
  atualizarCampo: (chave: string, valor: ValorFormulario) => void,
) {
  const valor = formulario[campo.chave];

  if (campo.tipo === "imagens") {
    const imagens = Array.isArray(valor) ? valor : [];

    function atualizarImagem(index: number, chave: keyof FormImagemCrud, novoValor: string) {
      atualizarCampo(
        campo.chave,
        imagens.map((imagem, atual) =>
          atual === index ? { ...imagem, [chave]: novoValor } : imagem,
        ),
      );
    }

    return (
      <div className="rounded-md border border-admin-border">
        <div className="flex flex-col gap-3 border-b border-admin-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">Imagens</p>
            <p className="admin-subtitle mt-1 text-sm">
              {imagens.length} de {LIMITE_IMAGENS} imagens cadastradas.
            </p>
            <p className="admin-subtitle mt-1 text-xs">
              Use URL http/https de imagem já otimizada, preferencialmente WebP, quadrada e ate 2
              MB.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              imagens.length < LIMITE_IMAGENS &&
              atualizarCampo(campo.chave, [
                ...imagens,
                {
                  url: "",
                  textoAlternativo: "",
                  credito: "",
                  origem: "UPLOAD_ADMIN",
                  tamanhoBytes: "",
                },
              ])
            }
            disabled={imagens.length >= LIMITE_IMAGENS}
          >
            <ImageIcon className="h-4 w-4" />
            Adicionar imagem
          </Button>
        </div>

        {imagens.length === 0 ? (
          <p className="p-4 text-sm text-admin-muted">
            Nenhuma imagem cadastrada para este registro.
          </p>
        ) : (
          <div className="grid gap-4 p-4">
            {imagens.map((imagem, index) => (
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
                    onClick={() =>
                      atualizarCampo(
                        campo.chave,
                        imagens.filter((_, atual) => atual !== index),
                      )
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
                    pasta="geral"
                    label="Upload da imagem"
                    ajuda="Selecione uma imagem para salvar no Supabase (até 5 MB)"
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
                      onChange={(event) => atualizarImagem(index, "credito", event.target.value)}
                      className="admin-input"
                    />
                  </Campo>
                  <Campo label="Origem">
                    <input
                      value={imagem.origem}
                      onChange={(event) => atualizarImagem(index, "origem", event.target.value)}
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
      </div>
    );
  }

  if (campo.tipo === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(valor)}
        onChange={(event) => atualizarCampo(campo.chave, event.target.checked)}
        className="h-4 w-4 rounded border-admin-border"
      />
    );
  }

  if (campo.tipo === "select") {
    return (
      <select
        value={String(valor ?? "")}
        onChange={(event) => atualizarCampo(campo.chave, event.target.value)}
        className="admin-input"
        required={campo.obrigatorio}
        aria-required={campo.obrigatorio}
      >
        {campo.opcoes?.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>
    );
  }

  if (campo.tipo === "textarea" || campo.tipo === "lines" || campo.tipo === "tags") {
    return (
      <textarea
        value={String(valor ?? "")}
        onChange={(event) => atualizarCampo(campo.chave, event.target.value)}
        className="admin-textarea"
        required={campo.obrigatorio}
        aria-required={campo.obrigatorio}
        placeholder={campo.placeholder}
      />
    );
  }

  return (
    <input
      type={campo.tipo === "datetime" ? "datetime-local" : campo.tipo}
      inputMode={campo.tipo === "url" ? "url" : undefined}
      pattern={campo.tipo === "url" ? "https?://.*" : undefined}
      value={String(valor ?? "")}
      onChange={(event) => atualizarCampo(campo.chave, event.target.value)}
      className="admin-input"
      required={campo.obrigatorio}
      aria-required={campo.obrigatorio}
      placeholder={campo.placeholder}
    />
  );
}

export function linhasParaArray(valor: ValorFormulario | undefined) {
  return String(valor ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

export function tagsParaArray(valor: ValorFormulario | undefined) {
  return String(valor ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function textoOpcional(valor: ValorFormulario | undefined) {
  const texto = String(valor ?? "").trim();
  return texto.length > 0 ? texto : undefined;
}

export function imagensParaPayload(valor: ValorFormulario | undefined) {
  if (!Array.isArray(valor)) return [];

  return valor
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

export function paraDatetimeLocal(dataIso?: string) {
  if (!dataIso) return "";
  return dataIso.slice(0, 16);
}

export function paraIsoDatetime(valor: ValorFormulario | undefined) {
  const data = new Date(String(valor));
  if (Number.isNaN(data.getTime())) throw new Error("Informe uma data valida.");
  return data.toISOString();
}

export function textoObrigatorio(formulario: Formulario, chave: string) {
  return String(formulario[chave] ?? "");
}

export function booleano(formulario: Formulario, chave: string) {
  return Boolean(formulario[chave]);
}

export { formatarDataPtBr };

const LIMITE_IMAGENS = 5;
const TAMANHO_MAXIMO_IMAGEM_BYTES = 2 * 1024 * 1024;

