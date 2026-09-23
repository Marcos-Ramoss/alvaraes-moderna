import { Eye, MessageSquare, RefreshCcw, Search, Trash2, CheckCircle, Clock, Archive, Sparkles } from "lucide-react";
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
  type ContatoAdmin,
  type StatusContatoAdmin,
} from "@/lib/admin-api";

const tiposContato: Record<ContatoAdmin["tipo"], string> = {
  SUGESTAO_PAUTA: "Sugestao de pauta",
  CORRECAO: "Correcao",
  MENSAGEM_GERAL: "Mensagem geral",
};

const statusContato: Array<{ valor: StatusContatoAdmin | "TODOS"; label: string }> = [
  { valor: "TODOS", label: "Todos" },
  { valor: "NOVO", label: "Novo" },
  { valor: "EM_ANALISE", label: "Em analise" },
  { valor: "RESPONDIDO", label: "Respondido" },
  { valor: "ARQUIVADO", label: "Arquivado" },
];

const statusVisual: Record<ContatoAdmin["status"], string> = {
  NOVO: "bg-green-500",
  EM_ANALISE: "bg-amber-500",
  RESPONDIDO: "bg-blue-500",
  ARQUIVADO: "bg-neutral-400",
};

export function AdminContatosView() {
  const { usuario, carregando } = useAdminAuth();
  const [contatos, setContatos] = useState<ContatoAdmin[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [alterandoId, setAlterandoId] = useState("");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusContatoAdmin | "TODOS">("TODOS");
  const [ordenacao, setOrdenacao] = useState<AdminOrdenacaoValor>("RECENTES");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [contatoSelecionado, setContatoSelecionado] = useState<ContatoAdmin | null>(null);

  function handleSelecionarTodos(checked: boolean) {
    if (checked) {
      setSelecionados(new Set(contatos.map((c) => c.id)));
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

  async function carregarContatos() {
    setCarregandoLista(true);
    setErro("");
    try {
      const dados = await adminApi.listarContatos();
      setContatos(dados);
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarContatos();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro, ordenacao, porPagina]);

  const contatosFiltrados = useMemo(() => {
    return contatos
      .filter((c) => {
        if (statusFiltro !== "TODOS" && c.status !== statusFiltro) return false;
        if (busca) {
          const termo = busca.toLowerCase();
          return (
            c.nome.toLowerCase().includes(termo) ||
            c.assunto?.toLowerCase().includes(termo) ||
            c.contatoResposta.toLowerCase().includes(termo)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (ordenacao === "RECENTES") return b.criadoEm.localeCompare(a.criadoEm);
        return a.criadoEm.localeCompare(b.criadoEm);
      });
  }, [contatos, busca, statusFiltro, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(contatosFiltrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const contatosPaginados = contatosFiltrados.slice(inicio, inicio + porPagina);

  async function alterarStatus(id: string, novoStatus: string) {
    setAlterandoId(id);
    try {
      await adminApi.atualizarStatusContato(id, novoStatus as StatusContatoAdmin);
      setContatos(
        contatos.map((c) => (c.id === id ? { ...c, status: novoStatus as StatusContatoAdmin } : c))
      );
      if (contatoSelecionado?.id === id) {
        setContatoSelecionado({ ...contatoSelecionado, status: novoStatus as StatusContatoAdmin });
      }
    } catch (error) {
      alert(formatarErroApi(error));
    } finally {
      setAlterandoId("");
    }
  }

  if (carregando) return null;

  return (
    <AdminShell usuario={usuario} wide>
      <AdminMassActions
        entidade="CONTATO"
        selecionados={Array.from(selecionados)}
        onClearSelection={() => setSelecionados(new Set())}
        onSuccess={() => {
          setSelecionados(new Set());
          carregarContatos();
        }}
        opcoesStatus={[
          { value: "NOVO", label: "Marcar como novo", icon: <Sparkles className="size-4 text-green-600" /> },
          { value: "EM_ANALISE", label: "Em análise", icon: <Clock className="size-4 text-amber-600" /> },
          { value: "RESPONDIDO", label: "Marcar como respondido", icon: <CheckCircle className="size-4 text-blue-600" /> },
          { value: "ARQUIVADO", label: "Arquivar", icon: <Archive className="size-4 text-neutral-500" /> },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-[#f4e5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#c9502c]">
            Contatos
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold">Mensagens recebidas</h1>
          <p className="mt-2 max-w-2xl text-[#456054]">
            Acompanhe sugestoes, correcoes e mensagens enviadas pelo formulario publico.
          </p>
        </div>
        <button
          type="button"
          onClick={carregarContatos}
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
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-3xl font-semibold">{contatos.length}</p>
              <p className="text-xs font-semibold tracking-[0.08em] text-[#456054]">MENSAGENS</p>
            </div>
          </div>
        </div>
      </section>

      {erro && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <section className="mt-6 rounded-md border border-[#ded8ca] bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <label className="relative block">
            <span className="sr-only">Buscar contato</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#456054]" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, contato, assunto ou mensagem..."
              className="h-12 w-full rounded-md border border-[#ded8ca] bg-white pl-12 pr-4 text-sm outline-none focus:border-[#c9502c]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <label
              htmlFor="status-contato"
              className="text-sm font-semibold text-[#12372a] sm:text-right"
            >
              Status
            </label>
            <select
              id="status-contato"
              value={statusFiltro}
              onChange={(event) =>
                setStatusFiltro(event.target.value as StatusContatoAdmin | "TODOS")
              }
              className="h-12 rounded-md border border-[#ded8ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#c9502c]"
            >
              <option value="TODOS">Todos</option>
              {statusContato.map((status) => (
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
            {contatosFiltrados.length} mensagens encontradas
          </p>
          <AdminOrdenacao value={ordenacao} onChange={setOrdenacao} selectId="ordenacao-contato" />
        </div>

        <section className="overflow-hidden rounded-md border border-[#ded8ca] bg-white shadow-sm">
          {carregandoLista ? (
            <p className="p-5 text-sm text-[#456054]">Carregando contatos...</p>
          ) : contatosFiltrados.length === 0 ? (
            <p className="p-5 text-sm text-[#456054]">Nenhuma mensagem encontrada.</p>
          ) : (
            <>
              <div className="divide-y divide-[#eee8dc] md:hidden">
                {contatosPaginados.map((contato) => (
                  <article
                    key={contato.id}
                    className={`grid gap-4 p-4 transition-colors ${
                      selecionados.has(contato.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleSelecionarUm(contato.id, !selecionados.has(contato.id))}
                  >
                    <div className="flex gap-4">
                      <div className="pt-1">
                        <Checkbox
                          checked={selecionados.has(contato.id)}
                          onCheckedChange={(c) => handleSelecionarUm(contato.id, c as boolean)}
                          aria-label="Selecionar contato"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                          {formatarDataPtBr(contato.criadoEm)}
                        </p>
                        <h3 className="mt-2 truncate font-display text-xl font-semibold text-[#082c22]">
                          {contato.assunto || "Mensagem sem assunto"}
                        </h3>
                        <p className="mt-1 truncate text-sm font-semibold text-[#12372a]">
                          {contato.nome}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                          Tipo
                        </p>
                        <p className="mt-1 text-[#12372a]">{tiposContato[contato.tipo]}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                          Contato
                        </p>
                        <p className="mt-1 break-words text-[#12372a]">{contato.contatoResposta}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <AdminStatusSelect
                            value={contato.status}
                            options={statusContato}
                            dotClassName={statusVisual[contato.status]}
                            disabled={alterandoId === contato.id}
                            onChange={(status) => alterarStatus(contato.id, status)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContatoSelecionado(contato);
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
                          checked={contatos.length > 0 && selecionados.size === contatos.length}
                          onCheckedChange={(c) => handleSelecionarTodos(c as boolean)}
                          aria-label="Selecionar tudo"
                        />
                      </th>
                      <th className="w-[150px] px-4 py-3">Recebido em</th>
                      <th className="w-[150px] px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Assunto</th>
                      <th className="w-[170px] px-4 py-3">Nome</th>
                      <th className="w-[200px] px-4 py-3">Contato</th>
                      <th className="w-[190px] px-4 py-3">Status</th>
                      <th className="w-[110px] px-4 py-3 text-right">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8dc]">
                    {contatosPaginados.map((contato) => (
                      <tr key={contato.id} className="align-middle">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selecionados.has(contato.id)}
                            onCheckedChange={(c) => handleSelecionarUm(contato.id, c as boolean)}
                            aria-label="Selecionar contato"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-[#456054]">
                          {formatarDataPtBr(contato.criadoEm)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-[#f8f5ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#456054]">
                            {tiposContato[contato.tipo]}
                          </span>
                        </td>
                        <td className="max-w-[220px] px-4 py-4 font-semibold text-[#082c22]">
                          <span className="block truncate">
                            {contato.assunto || "Mensagem sem assunto"}
                          </span>
                        </td>
                        <td className="max-w-[180px] px-4 py-4">
                          <span className="block truncate">{contato.nome}</span>
                        </td>
                        <td className="max-w-[200px] px-4 py-4 text-[#456054]">
                          <span className="block truncate">{contato.contatoResposta}</span>
                        </td>
                        <td className="px-4 py-4">
                          <AdminStatusSelect
                            value={contato.status}
                            options={statusContato}
                            dotClassName={statusVisual[contato.status]}
                            disabled={alterandoId === contato.id}
                            onChange={(status) => alterarStatus(contato.id, status)}
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setContatoSelecionado(contato)}
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

        {!carregandoLista && contatosFiltrados.length > 0 && (
          <AdminPaginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={contatosFiltrados.length}
            porPagina={porPagina}
            setPagina={setPagina}
            setPorPagina={setPorPagina}
            selectId="contatos-por-pagina"
          />
        )}
      </section>

      <Dialog
        open={!!contatoSelecionado}
        onOpenChange={(open) => !open && setContatoSelecionado(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {contatoSelecionado?.assunto || "Mensagem sem assunto"}
            </DialogTitle>
            <DialogDescription>
              {contatoSelecionado
                ? `${contatoSelecionado.nome} - ${tiposContato[contatoSelecionado.tipo]}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {contatoSelecionado && (
            <div className="grid gap-5">
              <dl className="grid gap-3 rounded-md border border-[#ded8ca] bg-[#faf8f2] p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[#456054]">Contato</dt>
                  <dd className="mt-1 break-words text-[#12372a]">
                    {contatoSelecionado.contatoResposta}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#456054]">Recebido em</dt>
                  <dd className="mt-1 text-[#12372a]">
                    {formatarDataPtBr(contatoSelecionado.criadoEm)}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-sm font-semibold text-[#12372a]">Mensagem completa</p>
                <p className="mt-2 max-h-[50vh] overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-[#ded8ca] bg-white p-4 text-sm leading-6 text-[#243b31]">
                  {contatoSelecionado.mensagem}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
