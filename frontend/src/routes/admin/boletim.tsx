import { createFileRoute } from "@tanstack/react-router";
import { Mail, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppPagination } from "@/components/app-pagination";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import {
  adminApi,
  formatarDataPtBr,
  formatarErroApi,
  type InscritoBoletimAdmin,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/boletim")({
  component: AdminBoletimPage,
});

function AdminBoletimPage() {
  const { usuario, carregando } = useAdminAuth();
  const [inscritos, setInscritos] = useState<InscritoBoletimAdmin[]>([]);
  const [erro, setErro] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [removendoId, setRemovendoId] = useState("");
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  async function carregarInscritos() {
    setCarregandoLista(true);
    setErro("");
    try {
      const dados = await adminApi.listarInscritosBoletim();
      setInscritos(dados);
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarInscritos();
  }, []);

  async function removerInscrito(id: string) {
    setRemovendoId(id);
    setErro("");
    try {
      await adminApi.removerInscritoBoletim(id);
      setInscritos((atuais) => atuais.filter((inscrito) => inscrito.id !== id));
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setRemovendoId("");
    }
  }

  const paginaAtual = Math.min(pagina, Math.max(1, Math.ceil(inscritos.length / itensPorPagina)));
  const inscritosPaginados = inscritos.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  if (carregando) return <div className="min-h-screen bg-[#f4f1e9] p-8">Carregando painel...</div>;
  return (
    <AdminShell usuario={usuario}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-[#f4e5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#c9502c]">
            Boletim
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold">Inscritos no boletim</h1>
          <p className="mt-2 max-w-2xl text-[#456054]">
            Lista de leitores que pediram para receber o resumo semanal por e-mail.
          </p>
        </div>
        <button
          type="button"
          onClick={carregarInscritos}
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
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-3xl font-semibold">{inscritos.length}</p>
              <p className="text-xs font-semibold tracking-[0.08em] text-[#456054]">
                INSCRITOS ATIVOS
              </p>
            </div>
          </div>
        </div>
      </section>

      {erro && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <section className="mt-8 overflow-hidden rounded-md border border-[#ded8ca] bg-white">
        <div className="border-b border-[#ded8ca] px-5 py-4">
          <h2 className="font-display text-xl font-semibold">Lista de inscritos</h2>
        </div>

        {carregandoLista ? (
          <p className="p-5 text-sm text-[#456054]">Carregando inscritos...</p>
        ) : inscritos.length === 0 ? (
          <p className="p-5 text-sm text-[#456054]">Nenhum inscrito ativo no boletim.</p>
        ) : (
          <>
            <div className="divide-y divide-[#eee8dc] md:hidden">
              {inscritosPaginados.map((inscrito) => (
                <article key={inscrito.id} className="grid gap-3 p-4">
                  <div>
                    <h3 className="font-semibold text-[#082c22]">{inscrito.nome}</h3>
                    <p className="mt-1 text-sm text-[#12372a]">{inscrito.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#456054]">
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-[0.08em]">Origem</span>
                      <span className="mt-1 block">{inscrito.origem}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-[0.08em]">Data</span>
                      <span className="mt-1 block">{formatarDataPtBr(inscrito.criadoEm)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removerInscrito(inscrito.id)}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-[#ded8ca] bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#f8f5ed] text-xs uppercase tracking-[0.08em] text-[#456054]">
                  <tr>
                    <th className="px-5 py-3">Nome</th>
                    <th className="px-5 py-3">E-mail</th>
                    <th className="px-5 py-3">Origem</th>
                    <th className="px-5 py-3">Inscrito em</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8dc]">
                  {inscritosPaginados.map((inscrito) => (
                    <tr key={inscrito.id}>
                      <td className="px-5 py-4 font-semibold text-[#082c22]">{inscrito.nome}</td>
                      <td className="px-5 py-4 text-[#12372a]">{inscrito.email}</td>
                      <td className="px-5 py-4 text-[#456054]">{inscrito.origem}</td>
                      <td className="px-5 py-4 text-[#456054]">{formatarDataPtBr(inscrito.criadoEm)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removerInscrito(inscrito.id)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#ded8ca] bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                          title="Remover inscrito"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#ded8ca] px-5 pb-5 pt-4">
              <AppPagination
                totalItems={inscritos.length}
                page={paginaAtual}
                itemsPerPage={itensPorPagina}
                onPageChange={setPagina}
                onItemsPerPageChange={setItensPorPagina}
                selectId="boletim-inscritos-por-pagina"
              />
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
