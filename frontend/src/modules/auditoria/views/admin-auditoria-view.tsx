import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  User,
  Activity,
  FileText,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Code2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import { AdminPaginacao } from "@/components/admin/admin-list-controls";
import {
  adminApi,
  temPermissao,
  formatarDataPtBr,
  formatarErroApi,
  type LogAuditoriaAdmin,
  type AcaoAuditoria,
  type RecursoAuditoria,
} from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ACOES_LABELS: Record<AcaoAuditoria, { label: string; classe: string }> = {
  CRIAR: { label: "Criação", classe: "bg-emerald-50 text-emerald-800 border-emerald-300" },
  ATUALIZAR: { label: "Edição", classe: "bg-sky-50 text-sky-800 border-sky-300" },
  PUBLICAR: { label: "Publicação", classe: "bg-indigo-50 text-indigo-800 border-indigo-300" },
  STATUS: { label: "Status", classe: "bg-amber-50 text-amber-800 border-amber-300" },
  EXCLUIR: { label: "Exclusão", classe: "bg-rose-50 text-rose-800 border-rose-300" },
  LOGIN: { label: "Acesso", classe: "bg-slate-50 text-slate-800 border-slate-300" },
};

const RECURSOS_LABELS: Record<RecursoAuditoria, string> = {
  NOTICIA: "Notícia",
  COMERCIO: "Comércio",
  EVENTO: "Evento / Agenda",
  CURSO: "Curso / Oportunidade",
  COMENTARIO: "Comentário",
  CONTATO: "Contato / Fale Conosco",
  PEDIDO_ANUNCIO: "Pedido de Anúncio",
  USUARIO: "Usuário Admin",
  SISTEMA: "Sistema / Geral",
};

export function AdminAuditoriaView() {
  const { usuario: usuarioLogado, carregando: carregandoAuth } = useAdminAuth();

  const [logs, setLogs] = useState<LogAuditoriaAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [carregandoLista, setCarregandoLista] = useState(true);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroAcao, setFiltroAcao] = useState<string>("");
  const [filtroRecurso, setFiltroRecurso] = useState<string>("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);

  // Modal de Detalhes / Inspecionar Diff
  const [logSelecionado, setLogSelecionado] = useState<LogAuditoriaAdmin | null>(null);

  // Exclusão Individual
  const [logParaExcluir, setLogParaExcluir] = useState<LogAuditoriaAdmin | null>(null);
  const [excluindoIndividual, setExcluindoIndividual] = useState(false);

  // Exclusão em Lote (Expurgo por data limite)
  const [modalExpurgarAberto, setModalExpurgarAberto] = useState(false);
  const [dataLimiteExpurgo, setDataLimiteExpurgo] = useState("");
  const [contagemExpurgo, setContagemExpurgo] = useState<number | null>(null);
  const [verificandoContagem, setVerificandoContagem] = useState(false);
  const [executandoExpurgo, setExecutandoExpurgo] = useState(false);
  const [dialogConfirmacaoExpurgoAberto, setDialogConfirmacaoExpurgoAberto] = useState(false);

  const autorizado = useMemo(() => {
    return temPermissao(usuarioLogado, "AUDITORIA");
  }, [usuarioLogado]);

  const carregarLogs = async () => {
    try {
      setCarregandoLista(true);
      const res = await adminApi.listarLogsAuditoria({
        busca: busca.trim() || undefined,
        acao: (filtroAcao as AcaoAuditoria) || undefined,
        recurso: (filtroRecurso as RecursoAuditoria) || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        pagina,
        limite: porPagina,
      });
      setLogs(res.dados);
      setTotal(res.total);
    } catch (err) {
      toast.error("Erro ao carregar histórico de auditoria", {
        description: formatarErroApi(err),
      });
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    if (!carregandoAuth && autorizado) {
      carregarLogs();
    }
  }, [carregandoAuth, autorizado, pagina, porPagina, filtroAcao, filtroRecurso]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    carregarLogs();
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroAcao("");
    setFiltroRecurso("");
    setDataInicio("");
    setDataFim("");
    setPagina(1);
    setCarregandoLista(true);
    adminApi
      .listarLogsAuditoria({ pagina: 1, limite: porPagina })
      .then((res) => {
        setLogs(res.dados);
        setTotal(res.total);
      })
      .catch((err) => {
        toast.error("Erro ao carregar histórico", { description: formatarErroApi(err) });
      })
      .finally(() => {
        setCarregandoLista(false);
      });
  };

  const handleExcluirIndividual = async () => {
    if (!logParaExcluir) return;
    try {
      setExcluindoIndividual(true);
      await adminApi.excluirLogAuditoria(logParaExcluir.id);
      toast.success("Registro de rastreamento excluído com sucesso.");
      setLogParaExcluir(null);
      carregarLogs();
    } catch (err) {
      toast.error("Erro ao excluir registro de auditoria", {
        description: formatarErroApi(err),
      });
    } finally {
      setExcluindoIndividual(false);
    }
  };

  const handleVerificarQuantidade = async () => {
    if (!dataLimiteExpurgo) {
      toast.error("Informe a data limite para contagem.");
      return;
    }
    try {
      setVerificandoContagem(true);
      const res = await adminApi.contarLogsAuditoriaAntigos(dataLimiteExpurgo);
      setContagemExpurgo(res.dados.total);
    } catch (err) {
      toast.error("Erro ao verificar quantidade de registros", {
        description: formatarErroApi(err),
      });
    } finally {
      setVerificandoContagem(false);
    }
  };

  const handleExecutarExpurgo = async () => {
    if (!dataLimiteExpurgo) return;
    try {
      setExecutandoExpurgo(true);
      const res = await adminApi.expurgarLogsAuditoriaAntigos(dataLimiteExpurgo);
      toast.success(
        `${res.dados.totalExcluidos} registro(s) de rastreamento foram excluídos com sucesso.`
      );
      setDialogConfirmacaoExpurgoAberto(false);
      setModalExpurgarAberto(false);
      setContagemExpurgo(null);
      setDataLimiteExpurgo("");
      setPagina(1);
      carregarLogs();
    } catch (err) {
      toast.error("Erro ao excluir registros em lote", {
        description: formatarErroApi(err),
      });
    } finally {
      setExecutandoExpurgo(false);
    }
  };

  const totalPaginas = Math.ceil(total / porPagina) || 1;

  const formatarHora = (dataIso?: string) => {
    if (!dataIso) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dataIso));
  };

  if (carregandoAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-background">
        <p className="text-admin-muted">Carregando painel...</p>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <AdminShell usuario={usuarioLogado} wide>
        <div className="mx-auto max-w-xl py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-admin-foreground">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-sm text-admin-muted">
            Você não possui permissão para visualizar os registros de auditoria do sistema.
            Solicite autorização ao Administrador Master para ter acesso a esta seção.
          </p>
          <div className="mt-6">
            <Link
              to="/admin"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-admin-sidebar px-4 text-sm font-semibold text-white shadow hover:opacity-90"
            >
              Voltar para a Visão Geral
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell usuario={usuarioLogado} wide>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-sidebar text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-admin-foreground sm:text-3xl">
                  Auditoria e Rastreamento
                </h1>
                <p className="text-xs text-admin-muted sm:text-sm">
                  Histórico completo e imutável de todas as ações administrativas realizadas no sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setModalExpurgarAberto(true);
                setContagemExpurgo(null);
              }}
              className="gap-2 text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Antigos</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={carregarLogs}
              disabled={carregandoLista}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${carregandoLista ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <form onSubmit={handleBuscar} className="rounded-xl border border-admin-border bg-admin-surface p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Campo de Busca Geral */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
              <Input
                type="text"
                placeholder="Buscar por descrição, título, autor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-admin-muted hover:text-admin-foreground"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtro de Ação */}
            <div>
              <select
                aria-label="Filtro de Ação"
                value={filtroAcao}
                onChange={(e) => setFiltroAcao(e.target.value)}
                className="h-10 w-full rounded-md border border-admin-border bg-admin-background px-3 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-border"
              >
                <option value="">Todas as Ações</option>
                <option value="CRIAR">Criação (CRIAR)</option>
                <option value="ATUALIZAR">Edição (ATUALIZAR)</option>
                <option value="PUBLICAR">Publicação (PUBLICAR)</option>
                <option value="STATUS">Mudança de Status (STATUS)</option>
                <option value="EXCLUIR">Exclusão (EXCLUIR)</option>
                <option value="LOGIN">Acesso (LOGIN)</option>
              </select>
            </div>

            {/* Filtro de Módulo/Recurso */}
            <div>
              <select
                aria-label="Filtro de Módulo"
                value={filtroRecurso}
                onChange={(e) => setFiltroRecurso(e.target.value)}
                className="h-10 w-full rounded-md border border-admin-border bg-admin-background px-3 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-border"
              >
                <option value="">Todos os Módulos</option>
                <option value="NOTICIA">Notícias</option>
                <option value="COMERCIO">Comércios</option>
                <option value="EVENTO">Eventos / Agenda</option>
                <option value="CURSO">Cursos / Oportunidades</option>
                <option value="COMENTARIO">Comentários</option>
                <option value="CONTATO">Contatos</option>
                <option value="PEDIDO_ANUNCIO">Pedidos de Anúncio</option>
                <option value="USUARIO">Usuários Admin</option>
                <option value="SISTEMA">Sistema / Geral</option>
              </select>
            </div>

            {/* Botões Pesquisar e Limpar */}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-admin-sidebar text-white hover:opacity-95">
                Filtrar
              </Button>
              <Button type="button" variant="outline" onClick={limparFiltros} title="Limpar Filtros">
                Limpar
              </Button>
            </div>
          </div>

          {/* Filtro de Datas Opcional (Mobile-friendly) */}
          <div className="pt-2 border-t border-admin-border/50 text-xs text-admin-muted space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-admin-foreground">
                <Calendar className="h-3.5 w-3.5 text-admin-sidebar" />
                Filtrar por Período
              </span>
              <span className="text-[11px] text-admin-muted">
                ({total} registros encontrados)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-md border border-admin-border bg-admin-background px-3 py-1.5">
                <span className="text-xs text-admin-muted font-medium w-8 shrink-0">De:</span>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-transparent text-xs text-admin-foreground focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-2 rounded-md border border-admin-border bg-admin-background px-3 py-1.5">
                <span className="text-xs text-admin-muted font-medium w-8 shrink-0">Até:</span>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full bg-transparent text-xs text-admin-foreground focus:outline-none"
                />
              </label>
            </div>
          </div>
        </form>

        {/* Histórico de Auditoria (Cards Mobile + Tabela Desktop) */}
        <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-sm">
          {carregandoLista ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-admin-muted" />
              <span className="ml-3 text-sm text-admin-muted">Carregando histórico de auditoria...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <Activity className="h-10 w-10 text-admin-muted/60" />
              <p className="mt-3 text-base font-semibold text-admin-foreground">
                Nenhum registro de auditoria encontrado
              </p>
              <p className="mt-1 text-xs text-admin-muted">
                {busca || filtroAcao || filtroRecurso || dataInicio || dataFim
                  ? "Tente ajustar os filtros de busca."
                  : "As ações realizadas pelos administradores serão exibidas aqui."}
              </p>
            </div>
          ) : (
            <>
              {/* Cards Mobile (< md) */}
              <div className="grid gap-3 p-4 md:hidden">
                {logs.map((log) => {
                  const infoAcao = ACOES_LABELS[log.acao] ?? {
                    label: log.acao,
                    classe: "bg-slate-50 text-slate-800 border-slate-300",
                  };

                  return (
                    <article
                      key={log.id}
                      className="admin-mobile-card transition-colors bg-admin-surface/70 space-y-3"
                    >
                      {/* Top Row: Ação Badge, Módulo, Data e Hora */}
                      <div className="flex items-start justify-between gap-2 border-b border-admin-border/50 pb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${infoAcao.classe}`}
                          >
                            {infoAcao.label}
                          </span>
                          <span className="rounded bg-admin-border/40 px-2 py-0.5 text-xs font-medium text-admin-foreground">
                            {RECURSOS_LABELS[log.recurso] ?? log.recurso}
                          </span>
                        </div>
                        <span className="text-[11px] text-admin-muted shrink-0 text-right">
                          {formatarDataPtBr(log.criadoEm)} <span className="font-mono">{formatarHora(log.criadoEm)}</span>
                        </span>
                      </div>

                      {/* Descrição e Recurso */}
                      <div>
                        <p className="font-semibold text-admin-foreground text-sm leading-snug">
                          {log.descricao}
                        </p>
                        {log.tituloRecurso && (
                          <p className="text-xs text-admin-muted mt-1">
                            Recurso: <span className="font-semibold text-admin-foreground/90">{log.tituloRecurso}</span>
                          </p>
                        )}
                      </div>

                      {/* Responsável */}
                      <dl className="mt-2 text-xs">
                        <dt className="admin-label-muted">Responsável</dt>
                        <dd className="mt-1 flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-admin-sidebar/10 text-xs font-bold text-admin-sidebar">
                            {log.usuarioNome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-admin-foreground">{log.usuarioNome}</span>
                          <span className="text-admin-muted text-[11px] truncate">({log.usuarioEmail})</span>
                        </dd>
                      </dl>

                      {/* Ações Mobile: Ver Detalhes + Excluir */}
                      <div className="pt-2.5 border-t border-admin-border/50 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogSelecionado(log)}
                          className="flex-1 gap-2 h-9 text-xs text-admin-sidebar hover:bg-admin-sidebar/10 font-semibold"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Detalhes do Log & Diffs</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogParaExcluir(log)}
                          title="Excluir este registro de rastreamento"
                          className="h-9 w-9 p-0 text-admin-muted hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Tabela Desktop (>= md) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-admin-border bg-admin-background/60 text-xs font-semibold text-admin-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-3">Ação</th>
                      <th className="px-3.5 py-3">Módulo</th>
                      <th className="px-3.5 py-3">Descrição da Operação</th>
                      <th className="px-3.5 py-3">Responsável</th>
                      <th className="px-3.5 py-3">Data e Hora</th>
                      <th className="px-3.5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border">
                    {logs.map((log) => {
                      const infoAcao = ACOES_LABELS[log.acao] ?? {
                        label: log.acao,
                        classe: "bg-slate-50 text-slate-800 border-slate-300",
                      };

                      return (
                        <tr
                          key={log.id}
                          className="transition-colors hover:bg-admin-background/40"
                        >
                          {/* Ação */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${infoAcao.classe}`}
                            >
                              {infoAcao.label}
                            </span>
                          </td>

                          {/* Módulo */}
                          <td className="px-3.5 py-3 whitespace-nowrap text-xs font-medium text-admin-foreground">
                            {RECURSOS_LABELS[log.recurso] ?? log.recurso}
                          </td>

                          {/* Descrição */}
                          <td className="px-3.5 py-3 min-w-[200px]">
                            <p className="font-medium text-admin-foreground leading-snug">
                              {log.descricao}
                            </p>
                            {log.tituloRecurso && (
                              <p className="text-xs text-admin-muted mt-0.5">
                                Recurso: <span className="font-semibold text-admin-foreground/80">{log.tituloRecurso}</span>
                              </p>
                            )}
                          </td>

                          {/* Responsável */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-admin-sidebar/10 text-xs font-bold text-admin-sidebar">
                                {log.usuarioNome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-admin-foreground">
                                  {log.usuarioNome}
                                </p>
                                <p className="truncate text-[11px] text-admin-muted">
                                  {log.usuarioEmail}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Data e Hora */}
                          <td className="px-3.5 py-3 whitespace-nowrap text-xs text-admin-muted">
                            <p className="font-medium text-admin-foreground">
                              {formatarDataPtBr(log.criadoEm)}
                            </p>
                            <p className="text-[11px] text-admin-muted">{formatarHora(log.criadoEm)}</p>
                          </td>

                          {/* Ações: Ver Detalhes e Excluir */}
                          <td className="px-3.5 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLogSelecionado(log)}
                                className="h-8 gap-1.5 text-xs text-admin-sidebar hover:bg-admin-sidebar/10"
                                title="Inspecionar dados e diff"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Ver</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLogParaExcluir(log)}
                                className="h-8 w-8 text-admin-muted hover:text-rose-600 hover:bg-rose-50"
                                title="Excluir este registro de rastreamento"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Paginação */}
          {total > 0 && (
            <div className="border-t border-admin-border px-4 py-3 bg-admin-background/40">
              <AdminPaginacao
                paginaAtual={pagina}
                totalPaginas={totalPaginas}
                totalItens={total}
                porPagina={porPagina}
                setPagina={setPagina}
                setPorPagina={(valor) => {
                  setPorPagina(valor);
                  setPagina(1);
                }}
                selectId="auditoria-admin-por-pagina"
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALHES / INSPEÇÃO DE DADOS */}
      <Dialog open={Boolean(logSelecionado)} onOpenChange={(aberto) => !aberto && setLogSelecionado(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Code2 className="h-5 w-5 text-admin-sidebar" />
              Detalhes do Registro de Auditoria
            </DialogTitle>
            <DialogDescription>
              Informações completas do evento, parâmetros gravados e metadados de requisição.
            </DialogDescription>
          </DialogHeader>

          {logSelecionado && (
            <div className="space-y-4 pt-2">
              {/* Card Resumo */}
              <div className="rounded-xl border border-admin-border bg-admin-surface p-4 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-admin-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        ACOES_LABELS[logSelecionado.acao]?.classe ?? "bg-slate-50 text-slate-800"
                      }`}
                    >
                      {ACOES_LABELS[logSelecionado.acao]?.label ?? logSelecionado.acao}
                    </span>
                    <span className="font-bold text-admin-foreground text-sm">
                      {RECURSOS_LABELS[logSelecionado.recurso] ?? logSelecionado.recurso}
                    </span>
                  </div>
                  <span className="text-admin-muted">
                    {formatarDataPtBr(logSelecionado.criadoEm)} às {formatarHora(logSelecionado.criadoEm)}
                  </span>
                </div>

                <p className="text-sm font-semibold text-admin-foreground pt-1">
                  {logSelecionado.descricao}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-admin-muted">
                  <div>
                    <span className="font-semibold text-admin-foreground">Responsável: </span>
                    {logSelecionado.usuarioNome} ({logSelecionado.usuarioEmail})
                  </div>
                  <div>
                    <span className="font-semibold text-admin-foreground">ID do Recurso: </span>
                    <code className="bg-admin-border/40 px-1 py-0.5 rounded text-[11px]">
                      {logSelecionado.recursoId ?? "N/A"}
                    </code>
                  </div>
                  {logSelecionado.ip && (
                    <div>
                      <span className="font-semibold text-admin-foreground">Endereço IP: </span>
                      {logSelecionado.ip}
                    </div>
                  )}
                  {logSelecionado.userAgent && (
                    <div className="sm:col-span-2 truncate">
                      <span className="font-semibold text-admin-foreground">User Agent: </span>
                      <span title={logSelecionado.userAgent}>{logSelecionado.userAgent}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Diffs / Payloads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dados Anteriores */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-admin-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Valores Anteriores
                  </h4>
                  <pre className="max-h-64 overflow-auto rounded-lg border border-admin-border bg-slate-900 p-3 font-mono text-xs text-slate-100 shadow-inner">
                    {logSelecionado.dadosAnteriores
                      ? JSON.stringify(logSelecionado.dadosAnteriores, null, 2)
                      : "// Nenhum dado anterior gravado"}
                  </pre>
                </div>

                {/* Novos Dados */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-admin-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Novos Valores (ou Registro Atual)
                  </h4>
                  <pre className="max-h-64 overflow-auto rounded-lg border border-admin-border bg-slate-900 p-3 font-mono text-xs text-slate-100 shadow-inner">
                    {logSelecionado.dadosNovos
                      ? JSON.stringify(logSelecionado.dadosNovos, null, 2)
                      : "// Nenhum dado novo gravado"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INDIVIDUAL */}
      <AlertDialog open={Boolean(logParaExcluir)} onOpenChange={(aberto) => !aberto && setLogParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-700">
              <Trash2 className="h-5 w-5" />
              Excluir Registro de Rastreamento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de rastreamento?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {logParaExcluir && (
            <div className="rounded-lg border border-admin-border bg-admin-background/50 p-3 text-xs space-y-1">
              <p className="font-semibold text-admin-foreground">{logParaExcluir.descricao}</p>
              <p className="text-admin-muted">
                Responsável: <strong className="text-admin-foreground">{logParaExcluir.usuarioNome}</strong> • {formatarDataPtBr(logParaExcluir.criadoEm)} às {formatarHora(logParaExcluir.criadoEm)}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindoIndividual}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluirIndividual}
              disabled={excluindoIndividual}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {excluindoIndividual ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL DE CONFIGURAÇÃO DE EXCLUSÃO EM LOTE (POR DATA LIMITE) */}
      <Dialog open={modalExpurgarAberto} onOpenChange={setModalExpurgarAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl text-rose-700">
              <Trash2 className="h-5 w-5" />
              Excluir Rastreamentos Antigos
            </DialogTitle>
            <DialogDescription>
              Remova do histórico os registros de auditoria anteriores a uma data limite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="data-limite-expurgo" className="text-sm font-semibold">
                Excluir rastreamentos até a data (inclusive):
              </Label>
              <Input
                id="data-limite-expurgo"
                type="date"
                value={dataLimiteExpurgo}
                onChange={(e) => {
                  setDataLimiteExpurgo(e.target.value);
                  setContagemExpurgo(null);
                }}
              />
              <p className="text-xs text-admin-muted">
                Exemplo: ao selecionar <strong>25/09/2026</strong>, serão excluídos todos os registros criados até o fim do dia 25/09/2026.
              </p>
            </div>

            {contagemExpurgo === null ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleVerificarQuantidade}
                disabled={!dataLimiteExpurgo || verificandoContagem}
                className="w-full gap-2 text-xs h-9"
              >
                <Search className={`h-3.5 w-3.5 ${verificandoContagem ? "animate-spin" : ""}`} />
                {verificandoContagem ? "Consultando quantidade..." : "Verificar quantidade de registros"}
              </Button>
            ) : (
              <div
                className={`rounded-lg border p-3 text-xs space-y-1 ${
                  contagemExpurgo === 0
                    ? "border-slate-200 bg-slate-50 text-slate-700"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}
              >
                <p className="font-semibold text-sm">
                  {contagemExpurgo === 0
                    ? "Nenhum registro anterior encontrado."
                    : `Foram encontrados ${contagemExpurgo} registro(s) para exclusão.`}
                </p>
                <p className="text-xs opacity-90">
                  {contagemExpurgo === 0
                    ? `Não existem registros de rastreamento com data até ${formatarDataPtBr(dataLimiteExpurgo)}.`
                    : `Estes ${contagemExpurgo} registro(s) realizados até ${formatarDataPtBr(dataLimiteExpurgo)} serão removidos permanentemente.`}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalExpurgarAberto(false)}
              disabled={executandoExpurgo}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!dataLimiteExpurgo || contagemExpurgo === null || contagemExpurgo === 0 || executandoExpurgo}
              onClick={() => setDialogConfirmacaoExpurgoAberto(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>
                {contagemExpurgo !== null && contagemExpurgo > 0
                  ? `Excluir ${contagemExpurgo} registro(s)`
                  : "Prosseguir para exclusão"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO FINAL DE EXCLUSÃO EM LOTE */}
      <AlertDialog open={dialogConfirmacaoExpurgoAberto} onOpenChange={setDialogConfirmacaoExpurgoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-700">Confirmar exclusão em lote</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a remover permanentemente <strong>{contagemExpurgo}</strong> registro(s) de rastreamento realizados até <strong>{dataLimiteExpurgo ? formatarDataPtBr(dataLimiteExpurgo) : ""}</strong>.
              <br /><br />
              Tem certeza que deseja prosseguir com a exclusão?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={executandoExpurgo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecutarExpurgo}
              disabled={executandoExpurgo}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {executandoExpurgo ? "Excluindo..." : "Sim, confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
