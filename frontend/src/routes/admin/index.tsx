import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  GraduationCap,
  Mail,
  Newspaper,
  Plus,
  Store,
  Users,
  MessageSquare,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  History,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminShell, AdminLoadingPage } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import { AdminFiltroPeriodo } from "@/components/admin/admin-list-controls";
import {
  adminApi,
  formatarDataPtBr,
  formatarErroApi,
  temPermissao,
  type ResumoAdmin,
  type Permissao,
  type MetricaCard,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Painel administrativo - Alvarães Moderna" }],
  }),
  component: AdminDashboardPage,
});

type TipoPeriodo = "hoje" | "7d" | "30d" | "90d" | "custom";

const CARDS_CONFIG = [
  { chave: "noticias" as const, label: "NOTÍCIAS", icon: Newspaper, href: "/admin/noticias", permissao: "NOTICIAS" as Permissao },
  { chave: "comercios" as const, label: "COMÉRCIOS", icon: Store, href: "/admin/comercios", permissao: "COMERCIOS" as Permissao },
  { chave: "eventos" as const, label: "EVENTOS", icon: CalendarDays, href: "/admin/eventos", permissao: "EVENTOS" as Permissao },
  { chave: "cursos" as const, label: "CURSOS E OPORTUNIDADES", icon: GraduationCap, href: "/admin/cursos", permissao: "CURSOS" as Permissao },
  { chave: "anuncios" as const, label: "PEDIDOS DE ANÚNCIO", icon: Megaphone, href: "/admin/pedidos-anuncio", permissao: "ANUNCIOS" as Permissao },
  { chave: "contatos" as const, label: "MENSAGENS DE CONTATO", icon: MessageSquare, href: "/admin/contatos", permissao: "CONTATOS" as Permissao },
  { chave: "inscritosBoletim" as const, label: "INSCRITOS NO BOLETIM", icon: Mail, href: "/admin/boletim", permissao: "BOLETIM" as Permissao },
  { chave: "usuarios" as const, label: "USUÁRIOS", icon: Users, href: "/admin/usuarios", permissao: "USUARIOS" as Permissao },
];

function formatarDataIsoLocal(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function calcularDatasPorPeriodo(tipo: TipoPeriodo): { dataInicio: string; dataFim: string } {
  const hoje = new Date();
  const hojeIso = formatarDataIsoLocal(hoje);

  if (tipo === "hoje") {
    return { dataInicio: hojeIso, dataFim: hojeIso };
  }
  if (tipo === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { dataInicio: formatarDataIsoLocal(d), dataFim: hojeIso };
  }
  if (tipo === "90d") {
    const d = new Date();
    d.setDate(d.getDate() - 89);
    return { dataInicio: formatarDataIsoLocal(d), dataFim: hojeIso };
  }
  // Padrão: 30 dias
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return { dataInicio: formatarDataIsoLocal(d), dataFim: hojeIso };
}

function formatarTempoRelativo(dataIso: string): string {
  try {
    const data = new Date(dataIso);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return "Agora mesmo";
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffHoras < 24) return `Há ${diffHoras} ${diffHoras === 1 ? "hora" : "horas"}`;
    if (diffDias === 1) return "Ontem";
    if (diffDias < 7) return `Há ${diffDias} dias`;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return dataIso;
  }
}

function getBadgeAcao(acao: string) {
  switch (acao) {
    case "CRIAR":
      return { label: "Criou", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "ATUALIZAR":
      return { label: "Editou", className: "bg-blue-50 text-blue-700 border-blue-200" };
    case "EXCLUIR":
      return { label: "Excluiu", className: "bg-rose-50 text-rose-700 border-rose-200" };
    case "PUBLICAR":
      return { label: "Publicou", className: "bg-amber-50 text-amber-700 border-amber-200" };
    case "STATUS":
      return { label: "Status", className: "bg-purple-50 text-purple-700 border-purple-200" };
    default:
      return { label: acao, className: "bg-stone-50 text-stone-700 border-stone-200" };
  }
}

function CustomEvolucaoTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, entry: any) => acc + (Number(entry.value) || 0), 0);
    return (
      <div className="rounded-lg border border-[#ded8ca] bg-white p-3 shadow-lg text-xs min-w-[150px]">
        <p className="font-semibold text-[#062f1f] mb-1.5 border-b border-[#e5dfd0] pb-1">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-stone-600">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-stone-900">{entry.value}</span>
            </div>
          ))}
          <div className="border-t border-[#e5dfd0] pt-1 mt-1 flex justify-between font-bold text-[#062f1f]">
            <span>Total:</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function AdminDashboardPage() {
  const { usuario, carregando: carregandoAuth } = useAdminAuth();
  const [resumo, setResumo] = useState<ResumoAdmin | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [atualizandoFiltro, setAtualizandoFiltro] = useState(false);
  const [erro, setErro] = useState("");

  const [periodoTipo, setPeriodoTipo] = useState<TipoPeriodo>("30d");
  const [dataInicio, setDataInicio] = useState(() => calcularDatasPorPeriodo("30d").dataInicio);
  const [dataFim, setDataFim] = useState(() => calcularDatasPorPeriodo("30d").dataFim);

  // Carregar dados sempre que dataInicio ou dataFim mudar
  useEffect(() => {
    let cancelado = false;
    setAtualizandoFiltro(true);

    adminApi
      .resumo({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      })
      .then((dados) => {
        if (!cancelado) {
          setResumo(dados);
          setErro("");
        }
      })
      .catch((error) => {
        if (!cancelado) {
          setErro(formatarErroApi(error));
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCarregandoDados(false);
          setAtualizandoFiltro(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [dataInicio, dataFim]);

  const aoMudarPeriodoTipo = (tipo: TipoPeriodo) => {
    setPeriodoTipo(tipo);
    if (tipo !== "custom") {
      const datas = calcularDatasPorPeriodo(tipo);
      setDataInicio(datas.dataInicio);
      setDataFim(datas.dataFim);
    }
  };

  const aoLimparPeriodoCustom = () => {
    aoMudarPeriodoTipo("30d");
  };

  const cardsVisiveis = useMemo(() => {
    return CARDS_CONFIG.filter((card) => temPermissao(usuario, card.permissao));
  }, [usuario]);

  const atalhosVisiveis = useMemo(() => {
    const lista = [];
    if (temPermissao(usuario, "NOTICIAS")) {
      lista.push({ rotulo: "Nova notícia", href: "/admin/noticias", icone: Newspaper });
    }
    if (temPermissao(usuario, "COMERCIOS")) {
      lista.push({ rotulo: "Novo comércio", href: "/admin/comercios", icone: Store });
    }
    if (temPermissao(usuario, "EVENTOS")) {
      lista.push({ rotulo: "Novo evento", href: "/admin/eventos", icone: CalendarDays });
    }
    if (temPermissao(usuario, "CURSOS")) {
      lista.push({ rotulo: "Nova oportunidade", href: "/admin/cursos", icone: GraduationCap });
    }
    if (temPermissao(usuario, "USUARIOS")) {
      lista.push({ rotulo: "Gerenciar usuários", href: "/admin/usuarios", icone: Users });
    }
    if (temPermissao(usuario, "AUDITORIA")) {
      lista.push({ rotulo: "Ver auditoria", href: "/admin/auditoria", icone: History });
    }
    return lista;
  }, [usuario]);

  if (carregandoAuth || (carregandoDados && !resumo)) {
    return <AdminLoadingPage usuario={usuario} />;
  }

  const distribuicao = resumo?.distribuicao ?? [];
  const totalDistribuicao = distribuicao.reduce((acc, item) => acc + item.total, 0);

  const evolucaoDados = resumo?.evolucao ?? [];
  const temDadosEvolucao = evolucaoDados.some((p) => p.total > 0);

  return (
    <AdminShell usuario={usuario}>
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-[#f4e5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#c9502c]">
            Visão Geral Interativa
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl text-[#062f1f]">
            Olá, {usuario?.nome}
          </h1>
          <p className="mt-1 text-sm text-[#456054]">
            Acompanhe as publicações, métricas de crescimento e atividades recentes do portal.
          </p>
        </div>

        {atualizandoFiltro && (
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#e4ebdf] px-3 py-1 text-xs font-semibold text-[#062f1f] sm:self-auto animate-pulse">
            <Clock className="h-3.5 w-3.5" />
            Atualizando indicadores...
          </div>
        )}
      </div>

      {erro && (
        <div className="mt-5 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* 1. FILTRO GLOBAL POR PERÍODO */}
      <section className="mt-6 rounded-md border border-[#ded8ca] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e4ebdf] text-[#062f1f]">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#456054]">
                Período de análise
              </span>
              <p className="text-xs text-[#5c7a6c]">
                {resumo?.periodo?.dataInicio && resumo?.periodo?.dataFim ? (
                  <>
                    Filtrando de{" "}
                    <strong className="text-[#062f1f]">{formatarDataPtBr(resumo.periodo.dataInicio)}</strong> até{" "}
                    <strong className="text-[#062f1f]">{formatarDataPtBr(resumo.periodo.dataFim)}</strong> (
                    {resumo.periodo.dias} {resumo.periodo.dias === 1 ? "dia" : "dias"})
                  </>
                ) : (
                  "Selecione o intervalo desejado"
                )}
              </p>
            </div>
          </div>

          {/* Botões de Opções Rápidas com rolagem horizontal no mobile (Regra 12) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {(
              [
                { id: "hoje", label: "Hoje" },
                { id: "7d", label: "Últimos 7 dias" },
                { id: "30d", label: "Últimos 30 dias" },
                { id: "90d", label: "Últimos 90 dias" },
                { id: "custom", label: "Personalizado" },
              ] as const
            ).map((opcao) => {
              const ativo = periodoTipo === opcao.id;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => aoMudarPeriodoTipo(opcao.id)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    ativo
                      ? "bg-[#062f1f] text-white shadow-sm"
                      : "bg-[#f0ebe1] text-[#33483d] hover:bg-[#e4ded2]"
                  }`}
                >
                  {opcao.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input customizado de datas caso selecionado */}
        {periodoTipo === "custom" && (
          <div className="mt-4 border-t border-[#f0ebe1] pt-4">
            <AdminFiltroPeriodo
              dataInicio={dataInicio}
              dataFim={dataFim}
              aoMudarDataInicio={setDataInicio}
              aoMudarDataFim={setDataFim}
              aoLimpar={aoLimparPeriodoCustom}
              titulo="Intervalo de datas personalizado"
            />
          </div>
        )}
      </section>

      {/* 2. CARDS PRINCIPAIS DE MÉTRICAS */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardsVisiveis.map((card) => {
          const Icon = card.icon;
          const metrica: MetricaCard | undefined = resumo?.cards?.[card.chave];
          const total = metrica?.total ?? resumo?.contagens[card.chave] ?? 0;
          const periodo = metrica?.periodo ?? 0;
          const variacao = metrica?.variacao ?? 0;
          const direcao = metrica?.direcao ?? "estavel";

          return (
            <Link
              to={card.href}
              key={card.chave}
              className="group relative flex flex-col justify-between rounded-md border border-[#ded8ca] bg-white p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ebdf] text-[#062f1f] transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[#889988] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-display text-3xl font-semibold tracking-tight text-[#062f1f] transition-colors group-hover:text-primary sm:text-4xl">
                    {total}
                  </p>
                  <p className="mt-1 text-xs font-semibold tracking-wider text-[#456054]">
                    {card.label}
                  </p>
                </div>
              </div>

              {/* Indicadores de período e tendência */}
              <div className="mt-4 border-t border-[#f0ebe1] pt-3 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <span className="font-medium text-[#456054]">
                  {metrica?.textoPeriodo ?? (periodo > 0 ? `+${periodo} no período` : "0 no período")}
                </span>

                {direcao === "subindo" && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 border border-emerald-200">
                    <TrendingUp className="h-3 w-3" />
                    +{variacao}%
                  </span>
                )}
                {direcao === "descendo" && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700 border border-rose-200">
                    <TrendingDown className="h-3 w-3" />
                    {variacao}%
                  </span>
                )}
                {direcao === "estavel" && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-600 border border-stone-200">
                    <Minus className="h-3 w-3" />
                    Estável
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </section>

      {/* 3. GRÁFICOS: EVOLUÇÃO E DISTRIBUIÇÃO */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Evolução (2 Colunas) */}
        <div className="rounded-md border border-[#ded8ca] bg-white p-5 sm:p-6 lg:col-span-2 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#f0ebe1] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#062f1f]" />
                <h2 className="font-display text-lg font-semibold text-[#062f1f] sm:text-xl">
                  Evolução de publicações
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-[#5c7a6c]">
                Volume de conteúdo adicionado no intervalo selecionado
              </p>
            </div>

            {/* Legenda compacta das séries */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#062f1f]" />
                Notícias
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c9502c]" />
                Eventos
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" />
                Cursos
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
                Comércios
              </span>
            </div>
          </div>

          <div className="mt-4 h-[280px] w-full">
            {evolucaoDados.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-stone-500">
                Carregando dados da evolução...
              </div>
            ) : !temDadosEvolucao ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-stone-500">
                <Activity className="h-8 w-8 text-stone-300 mb-2" />
                <p className="text-sm font-medium text-stone-700">
                  Nenhuma publicação registrada neste período.
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Altere o filtro de período acima ou cadastre novos conteúdos para visualizar o gráfico.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={evolucaoDados}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="corNoticias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#062f1f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#062f1f" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="corEventos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9502c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c9502c" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="corCursos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="corComercios" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe1" vertical={false} />
                  <XAxis
                    dataKey="rotulo"
                    stroke="#889988"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e5dfd0" }}
                  />
                  <YAxis
                    stroke="#889988"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e5dfd0" }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomEvolucaoTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="noticias"
                    name="Notícias"
                    stroke="#062f1f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#corNoticias)"
                  />
                  <Area
                    type="monotone"
                    dataKey="eventos"
                    name="Eventos"
                    stroke="#c9502c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#corEventos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cursos"
                    name="Cursos"
                    stroke="#d97706"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#corCursos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="comercios"
                    name="Comércios"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#corComercios)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico de Distribuição (1 Coluna) */}
        <div className="rounded-md border border-[#ded8ca] bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#f0ebe1] pb-4">
              <Layers className="h-5 w-5 text-[#c9502c]" />
              <div>
                <h2 className="font-display text-lg font-semibold text-[#062f1f]">
                  Distribuição
                </h2>
                <p className="text-xs text-[#5c7a6c]">
                  Proporção de conteúdos cadastrados
                </p>
              </div>
            </div>

            <div className="mt-4 h-[180px] w-full relative">
              {totalDistribuicao === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-stone-500">
                  Nenhum item cadastrado
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribuicao}
                        dataKey="total"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {distribuicao.map((item) => (
                          <Cell key={item.chave} fill={item.cor} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Total centralizado no donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display text-2xl font-bold text-[#062f1f]">
                      {totalDistribuicao}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#5c7a6c]">
                      Total
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legenda com percentuais */}
          <div className="mt-4 space-y-2 border-t border-[#f0ebe1] pt-3">
            {distribuicao.map((item) => {
              const porcentagem = totalDistribuicao > 0
                ? Math.round((item.total / totalDistribuicao) * 100)
                : 0;

              return (
                <div key={item.chave} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.cor }} />
                    <span className="font-medium text-stone-800">{item.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{item.total}</span>
                    <span className="text-stone-400">({porcentagem}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CONTEÚDO DE DEMONSTRAÇÃO (Ocultado se total === 0) */}
      {resumo?.demo && resumo.demo.total > 0 && (
        <section className="mt-8 rounded-md border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-amber-900">
                Conteúdo de demonstração no portal
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Ainda existem <strong>{resumo.demo.total}</strong> itens fictícios ativos que podem ser
                substituídos por dados reais:
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-amber-900">
                {resumo.demo.noticias > 0 && (
                  <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5">
                    {resumo.demo.noticias} notícias
                  </span>
                )}
                {resumo.demo.comercios > 0 && (
                  <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5">
                    {resumo.demo.comercios} comércios
                  </span>
                )}
                {resumo.demo.eventos > 0 && (
                  <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5">
                    {resumo.demo.eventos} eventos
                  </span>
                )}
                {resumo.demo.cursos > 0 && (
                  <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5">
                    {resumo.demo.cursos} cursos
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. ATIVIDADE RECENTE, ÚLTIMAS NOTÍCIAS E ATALHOS */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Atividades Recentes de Auditoria (Apenas se tiver permissão AUDITORIA) */}
          {temPermissao(usuario, "AUDITORIA") && (
            <section className="rounded-md border border-[#ded8ca] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f0ebe1] pb-4">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-[#062f1f]" />
                  <h2 className="font-display text-lg font-semibold text-[#062f1f]">
                    Atividade recente
                  </h2>
                </div>
                <Link
                  to="/admin/auditoria"
                  className="text-xs font-semibold text-[#c9502c] hover:underline flex items-center gap-1"
                >
                  Ver auditoria completa
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#f0ebe1]">
                {(resumo?.atividadesRecentes ?? []).length === 0 ? (
                  <p className="py-4 text-center text-xs text-stone-500">
                    Nenhum registro de auditoria encontrado.
                  </p>
                ) : (
                  (resumo?.atividadesRecentes ?? []).map((atividade) => {
                    const badge = getBadgeAcao(atividade.acao);
                    return (
                      <div key={atividade.id} className="py-3 flex items-start justify-between gap-3 text-sm">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`inline-flex shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-stone-900 leading-tight">
                              {atividade.descricao || atividade.tituloRecurso || `${atividade.acao} ${atividade.recurso}`}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#5c7a6c]">
                              Por <strong className="text-stone-700">{atividade.usuarioNome}</strong> ({atividade.usuarioEmail})
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-[#889988]">
                          {formatarTempoRelativo(atividade.criadoEm)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* Últimas Notícias (Apenas se tiver permissão NOTICIAS) */}
          {temPermissao(usuario, "NOTICIAS") && (
            <section className="rounded-md border border-[#ded8ca] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f0ebe1] pb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-[#062f1f]" />
                  <h2 className="font-display text-lg font-semibold text-[#062f1f]">
                    Últimas notícias
                  </h2>
                </div>
                <Link
                  to="/admin/noticias"
                  className="text-xs font-semibold text-[#c9502c] hover:underline flex items-center gap-1"
                >
                  Ver todas as notícias
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#f0ebe1]">
                {(resumo?.noticiasRecentes ?? []).length === 0 ? (
                  <p className="py-4 text-center text-xs text-stone-500">
                    Nenhuma notícia cadastrada até o momento.
                  </p>
                ) : (
                  (resumo?.noticiasRecentes ?? []).map((noticia) => (
                    <Link
                      key={noticia.id}
                      to="/admin/noticias"
                      className="group flex items-center justify-between gap-4 py-3 text-sm hover:text-[#c9502c]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            noticia.publicado
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {noticia.publicado ? (
                            <>
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Publicado
                            </>
                          ) : (
                            <>
                              <Clock className="h-2.5 w-2.5" />
                              Rascunho
                            </>
                          )}
                        </span>
                        <span className="underline underline-offset-2 font-medium transition-colors group-hover:text-[#c9502c]">
                          {noticia.titulo}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-[#5c7a6c]">
                        {formatarDataPtBr(noticia.publicadoEm)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        {/* 6. COLUNA LATERAL: ATALHOS RÁPIDOS */}
        <section className="rounded-md bg-[#062f1f] p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Plus className="h-5 w-5 text-white/80" />
              <h2 className="font-display text-xl font-semibold">Atalhos rápidos</h2>
            </div>
            <p className="mt-2 text-xs text-white/70">
              Acesse rapidamente as ferramentas de criação de conteúdo autorizadas para sua conta.
            </p>

            <div className="mt-5 grid gap-2.5">
              {atalhosVisiveis.map((atalho) => {
                const Icone = atalho.icone;
                return (
                  <Link
                    key={atalho.rotulo}
                    to={atalho.href}
                    className="inline-flex h-11 items-center justify-between rounded-md bg-white/10 px-4 text-sm font-semibold transition-all hover:bg-white/20 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icone className="h-4 w-4 text-white/80" />
                      {atalho.rotulo}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/60" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-md bg-black/20 p-4 border border-white/10 text-xs text-white/70 space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Painel Alvarães Moderna
            </p>
            <p className="text-[11px] text-white/60">
              Sessão iniciada como: <strong className="text-white/90">{usuario?.role === "MASTER" ? "Master" : "Administrador"}</strong>
            </p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
