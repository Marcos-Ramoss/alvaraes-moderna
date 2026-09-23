import { Eye, Megaphone, RefreshCcw, Search, CheckCircle, Clock, Archive, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AdminOrdenacao,
  AdminPaginacao,
  AdminStatusSelect,
  type AdminOrdenacaoValor,
} from "@/components/admin/admin-list-controls";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminMassActions } from "@/components/admin/admin-mass-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminApi,
  formatarDataPtBr,
  formatarErroApi,
  type PedidoAnuncioAdmin,
  type StatusPedidoAnuncioAdmin,
} from "@/lib/admin-api";

const tiposPedido: Record<PedidoAnuncioAdmin["tipo"], string> = {
  CADASTRO_BASICO: "Cadastro básico",
  PAGINA_COMPLETA: "Página completa",
  DESTAQUE_PATROCINADO: "Destaque patrocinado",
};

const statusPedido: Array<{ valor: StatusPedidoAnuncioAdmin; label: string }> = [
  { valor: "NOVO", label: "Novo" },
  { valor: "EM_CONTATO", label: "Em contato" },
  { valor: "CONVERTIDO", label: "Convertido" },
  { valor: "ARQUIVADO", label: "Arquivado" },
];

const statusVisual: Record<StatusPedidoAnuncioAdmin, string> = {
  NOVO: "bg-emerald-600",
  EM_CONTATO: "bg-amber-500",
  CONVERTIDO: "bg-blue-600",
  ARQUIVADO: "bg-slate-400",
};

export function AdminPedidosAnuncioView() {
  const { usuario, carregando } = useAdminAuth();
  const [pedidos, setPedidos] = useState<PedidoAnuncioAdmin[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [alterandoId, setAlterandoId] = useState("");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusPedidoAnuncioAdmin | "TODOS">("TODOS");
  const [ordenacao, setOrdenacao] = useState<AdminOrdenacaoValor>("RECENTES");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoAnuncioAdmin | null>(null);

  function handleSelecionarTodos(checked: boolean) {
    if (checked) {
      setSelecionados(new Set(pedidos.map((p) => p.id)));
    } else {
      setSelecionados(new Set());
    }
  }

  function handleSelecionarUm(id: string, checked: boolean) {
    const next = new Set(selecionados);
    if (checked) next.add(id);
    else next.delete(id);
    setSelecionados(next);
  }

  async function carregarPedidos() {
    setCarregandoLista(true);
    setErro("");
    try {
      const dados = await adminApi.listarPedidosAnuncio();
      setPedidos(dados);
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro, ordenacao, porPagina]);

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return pedidos
      .filter((pedido) => {
        const correspondeStatus = statusFiltro === "TODOS" || pedido.status === statusFiltro;
        const textoBusca = [
          pedido.nomeComercio,
          pedido.nomeResponsavel,
          pedido.contatoResponsavel,
          pedido.categoriaPretendida,
          pedido.localizacaoResumida,
          pedido.mensagem,
          tiposPedido[pedido.tipo],
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return correspondeStatus && (!termo || textoBusca.includes(termo));
      })
      .sort((a, b) => {
        if (ordenacao === "AZ") return a.nomeComercio.localeCompare(b.nomeComercio);

        const dataA = new Date(a.criadoEm).getTime();
        const dataB = new Date(b.criadoEm).getTime();
        return ordenacao === "RECENTES" ? dataB - dataA : dataA - dataB;
      });
  }, [busca, ordenacao, pedidos, statusFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicioPagina = (paginaAtual - 1) * porPagina;
  const pedidosPaginados = pedidosFiltrados.slice(inicioPagina, inicioPagina + porPagina);

  async function alterarStatus(id: string, status: StatusPedidoAnuncioAdmin) {
    setAlterandoId(id);
    setErro("");
    try {
      const resposta = await adminApi.atualizarStatusPedidoAnuncio(id, status);
      setPedidos((atuais) => atuais.map((pedido) => (pedido.id === id ? resposta.dados : pedido)));
      setPedidoSelecionado((atual) => (atual?.id === id ? resposta.dados : atual));
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setAlterandoId("");
    }
  }

  if (carregando) return <div className="min-h-screen bg-[#f4f1e9] p-8">Carregando painel...</div>;

  return (
    <AdminShell usuario={usuario} wide>
      <AdminMassActions
        entidade="PEDIDO_ANUNCIO"
        selecionados={Array.from(selecionados)}
        onClearSelection={() => setSelecionados(new Set())}
        onSuccess={() => {
          setSelecionados(new Set());
          carregarPedidos();
        }}
        opcoesStatus={[
          { value: "NOVO", label: "Marcar como novo", icon: <Sparkles className="size-4 text-green-600" /> },
          { value: "EM_CONTATO", label: "Em contato", icon: <Clock className="size-4 text-amber-600" /> },
          { value: "CONVERTIDO", label: "Converter", icon: <CheckCircle className="size-4 text-blue-600" /> },
          { value: "ARQUIVADO", label: "Arquivar", icon: <Archive className="size-4 text-neutral-500" /> },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-[#f4e5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#c9502c]">
            Anúncios
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold">Pedidos de anúncio</h1>
          <p className="mt-2 max-w-2xl text-[#456054]">
            Acompanhe os estabelecimentos que pediram contato para anunciar no portal.
          </p>
        </div>
        <button
          type="button"
          onClick={carregarPedidos}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#ded8ca] bg-white px-4 text-sm font-semibold hover:bg-[#faf8f2]"
        >
          <RefreshCcw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-[#ded8ca] bg-white p-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ebdf]">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-3xl font-semibold">{pedidos.length}</p>
              <p className="text-xs font-semibold tracking-[0.08em] text-[#456054]">PEDIDOS</p>
            </div>
          </div>
        </div>
      </section>

      {erro && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <section className="mt-6 rounded-md border border-[#ded8ca] bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <label className="relative block">
            <span className="sr-only">Buscar pedido</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#456054]" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, e-mail, categoria ou localização..."
              className="h-12 w-full rounded-md border border-[#ded8ca] bg-white pl-12 pr-4 text-sm outline-none focus:border-[#c9502c]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <label
              htmlFor="status-pedido"
              className="text-sm font-semibold text-[#12372a] sm:text-right"
            >
              Status
            </label>
            <select
              id="status-pedido"
              value={statusFiltro}
              onChange={(event) =>
                setStatusFiltro(event.target.value as StatusPedidoAnuncioAdmin | "TODOS")
              }
              className="h-12 rounded-md border border-[#ded8ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#c9502c]"
            >
              <option value="TODOS">Todos</option>
              {statusPedido.map((status) => (
                <option key={status.valor} value={status.valor}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#12372a]">
            {pedidosFiltrados.length} pedidos encontrados
          </p>
          <AdminOrdenacao value={ordenacao} onChange={setOrdenacao} selectId="ordenacao-pedido" />
        </div>

        <section className="overflow-hidden rounded-md border border-[#ded8ca] bg-white shadow-sm">
          {carregandoLista ? (
            <p className="p-5 text-sm text-[#456054]">Carregando pedidos...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="p-5 text-sm text-[#456054]">Nenhum pedido encontrado.</p>
          ) : (
            <>
              <div className="divide-y divide-[#eee8dc] md:hidden">
                {pedidosPaginados.map((pedido) => (
                  <article
                    key={pedido.id}
                    className={`grid gap-4 p-4 transition-colors ${
                      selecionados.has(pedido.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleSelecionarUm(pedido.id, !selecionados.has(pedido.id))}
                  >
                    <div className="flex gap-4">
                      <div className="pt-1">
                        <Checkbox
                          checked={selecionados.has(pedido.id)}
                          onCheckedChange={(c) => handleSelecionarUm(pedido.id, c as boolean)}
                          aria-label="Selecionar pedido"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                          {formatarDataPtBr(pedido.criadoEm)}
                        </p>
                        <h3 className="mt-2 truncate font-display text-xl font-semibold text-[#082c22]">
                          {pedido.nomeComercio}
                        </h3>
                        <p className="mt-1 truncate text-sm font-semibold text-[#12372a]">
                          {pedido.nomeResponsavel}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                          Tipo
                        </p>
                        <p className="mt-1 text-[#12372a]">{tiposPedido[pedido.tipo]}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                          Contato
                        </p>
                        <p className="mt-1 break-words text-[#12372a]">
                          {pedido.contatoResponsavel}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                            Categoria
                          </p>
                          <p className="mt-1 text-[#12372a]">
                            {pedido.categoriaPretendida || "Não informada"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                            Localizacao
                          </p>
                          <p className="mt-1 text-[#12372a]">
                            {pedido.localizacaoResumida || "Não informada"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <AdminStatusSelect
                            value={pedido.status}
                            options={statusPedido}
                            dotClassName={statusVisual[pedido.status]}
                            disabled={alterandoId === pedido.id}
                            onChange={(status) => alterarStatus(pedido.id, status)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPedidoSelecionado(pedido);
                          }}
                          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#ded8ca] bg-white px-3 text-sm font-semibold text-[#12372a] hover:bg-[#faf8f2]"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-[#f8f5ed] text-xs uppercase tracking-[0.08em] text-[#456054]">
                    <tr>
                      <th className="px-4 py-3 w-[40px]">
                        <Checkbox
                          checked={pedidos.length > 0 && selecionados.size === pedidos.length}
                          onCheckedChange={(c) => handleSelecionarTodos(c as boolean)}
                          aria-label="Selecionar tudo"
                        />
                      </th>
                      <th className="w-[150px] px-4 py-3">Recebido em</th>
                      <th className="px-4 py-3">Comercio</th>
                      <th className="w-[220px] px-4 py-3">Responsavel</th>
                      <th className="w-[150px] px-4 py-3">Tipo</th>
                      <th className="w-[150px] px-4 py-3">Categoria</th>
                      <th className="w-[170px] px-4 py-3">Localizacao</th>
                      <th className="w-[190px] px-4 py-3">Status</th>
                      <th className="w-[110px] px-4 py-3 text-right">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8dc]">
                    {pedidosPaginados.map((pedido) => (
                      <tr key={pedido.id} className="align-middle">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selecionados.has(pedido.id)}
                            onCheckedChange={(c) => handleSelecionarUm(pedido.id, c as boolean)}
                            aria-label="Selecionar pedido"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-[#456054]">
                          {formatarDataPtBr(pedido.criadoEm)}
                        </td>
                        <td className="max-w-[200px] px-4 py-4 font-semibold text-[#082c22]">
                          <span className="block truncate">{pedido.nomeComercio}</span>
                        </td>
                        <td className="max-w-[220px] px-4 py-4">
                          <span className="block truncate">{pedido.nomeResponsavel}</span>
                          <span className="mt-1 block truncate text-xs text-[#456054]">
                            {pedido.contatoResponsavel}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-[#f8f5ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                            {tiposPedido[pedido.tipo]}
                          </span>
                        </td>
                        <td className="max-w-[160px] px-4 py-4 text-[#456054]">
                          <span className="block truncate">
                            {pedido.categoriaPretendida || "Não informada"}
                          </span>
                        </td>
                        <td className="max-w-[180px] px-4 py-4 text-[#456054]">
                          <span className="block truncate">
                            {pedido.localizacaoResumida || "Não informada"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <AdminStatusSelect
                            value={pedido.status}
                            options={statusPedido}
                            dotClassName={statusVisual[pedido.status]}
                            disabled={alterandoId === pedido.id}
                            onChange={(status) => alterarStatus(pedido.id, status)}
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setPedidoSelecionado(pedido)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#ded8ca] bg-white px-3 text-sm font-semibold text-[#12372a] hover:bg-[#faf8f2]"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {!carregandoLista && pedidosFiltrados.length > 0 && (
          <AdminPaginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={pedidosFiltrados.length}
            porPagina={porPagina}
            setPagina={setPagina}
            setPorPagina={setPorPagina}
            selectId="pedidos-por-pagina"
          />
        )}
      </section>

      <Dialog
        open={!!pedidoSelecionado}
        onOpenChange={(open) => !open && setPedidoSelecionado(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {pedidoSelecionado?.nomeComercio}
            </DialogTitle>
            <DialogDescription>
              {pedidoSelecionado
                ? `${pedidoSelecionado.nomeResponsavel} - ${tiposPedido[pedidoSelecionado.tipo]}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {pedidoSelecionado && (
            <div className="grid gap-5">
              <dl className="grid gap-3 rounded-md border border-[#ded8ca] bg-[#faf8f2] p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[#456054]">Contato</dt>
                  <dd className="mt-1 break-words text-[#12372a]">
                    {pedidoSelecionado.contatoResponsavel}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#456054]">Recebido em</dt>
                  <dd className="mt-1 text-[#12372a]">
                    {formatarDataPtBr(pedidoSelecionado.criadoEm)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#456054]">Categoria</dt>
                  <dd className="mt-1 text-[#12372a]">
                    {pedidoSelecionado.categoriaPretendida || "Não informada"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#456054]">Localizacao</dt>
                  <dd className="mt-1 text-[#12372a]">
                    {pedidoSelecionado.localizacaoResumida || "Não informada"}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-sm font-semibold text-[#12372a]">Mensagem completa</p>
                <p className="mt-2 max-h-[50vh] overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-[#ded8ca] bg-white p-4 text-sm leading-6 text-[#243b31]">
                  {pedidoSelecionado.mensagem || "Sem mensagem enviada."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
