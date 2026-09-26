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
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const limite = 25;

  // Modal de Detalhes / Inspecionar Diff
  const [logSelecionado, setLogSelecionado] = useState<LogAuditoriaAdmin | null>(null);

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
        limite,
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
  }, [carregandoAuth, autorizado, pagina, filtroAcao, filtroRecurso]);

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
  };

  const totalPaginas = Math.ceil(total / limite) || 1;

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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={carregarLogs}
              disabled={carregandoLista}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${carregandoLista ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
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

          {/* Filtro de Datas Opcional */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-admin-border/50 text-xs text-admin-muted">
            <span className="flex items-center gap-1 font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              Período:
            </span>
            <div className="flex items-center gap-1.5">
              <span>De</span>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="rounded border border-admin-border bg-admin-background px-2 py-1 text-xs text-admin-foreground"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span>Até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="rounded border border-admin-border bg-admin-background px-2 py-1 text-xs text-admin-foreground"
              />
            </div>
            <span className="text-admin-muted">({total} registros encontrados)</span>
          </div>
        </form>

        {/* Tabela de Registros */}
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-admin-border bg-admin-background/60 text-xs font-semibold text-admin-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Ação</th>
                    <th className="px-5 py-3.5">Módulo</th>
                    <th className="px-5 py-3.5">Descrição da Operação</th>
                    <th className="px-5 py-3.5">Responsável</th>
                    <th className="px-5 py-3.5">Data e Hora</th>
                    <th className="px-5 py-3.5 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {logs.map((log) => {
                    const infoAcao = ACOES_LABELS[log.acao] ?? {
                      label: log.acao,
                      classe: "bg-slate-50 text-slate-800 border-slate-300",
                    };
                    const temDiff = Boolean(log.dadosAnteriores || log.dadosNovos);

                    return (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-admin-background/40"
                      >
                        {/* Ação */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${infoAcao.classe}`}
                          >
                            {infoAcao.label}
                          </span>
                        </td>

                        {/* Módulo */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-admin-foreground">
                          {RECURSOS_LABELS[log.recurso] ?? log.recurso}
                        </td>

                        {/* Descrição */}
                        <td className="px-5 py-3.5 min-w-[280px]">
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
                        <td className="px-5 py-3.5 whitespace-nowrap">
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
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-admin-muted">
                          <p className="font-medium text-admin-foreground">
                            {formatarDataPtBr(log.criadoEm)}
                          </p>
                          <p className="text-[11px] text-admin-muted">{formatarHora(log.criadoEm)}</p>
                        </td>

                        {/* Botão Ver Detalhes */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between border-t border-admin-border px-5 py-3 bg-admin-background/40">
              <p className="text-xs text-admin-muted">
                Página <span className="font-semibold">{pagina}</span> de{" "}
                <span className="font-semibold">{totalPaginas}</span> ({total} registros no total)
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina <= 1 || carregandoLista}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina >= totalPaginas || carregandoLista}
                  onClick={() => setPagina((p) => p + 1)}
                  className="h-8 px-2"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
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
    </AdminShell>
  );
}
