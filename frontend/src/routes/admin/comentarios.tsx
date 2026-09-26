import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, AdminLoadingPage } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import { formatarDataPtBr, formatarErroApi } from "@/lib/admin-api";
import { AdminPaginacao, AdminStatusSelect } from "@/components/admin/admin-list-controls";


const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

export const Route = createFileRoute("/admin/comentarios")({
  head: () => ({
    meta: [{ title: "Moderacao de Comentarios - Alvaraes Moderna" }],
  }),
  component: AdminComentariosPage,
});

function AdminComentariosPage() {
  const { usuario, carregando } = useAdminAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("am_admin_token") : null;
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(50);
  const [statusFiltro, setStatusFiltro] = useState<string>("PENDENTE");
  const [erro, setErro] = useState("");
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!token) return;
    buscarComentarios();
  }, [token, pagina, porPagina, statusFiltro]);

  const buscarComentarios = async () => {
    setBuscando(true);
    setErro("");
    try {
      const qs = new URLSearchParams({
        pagina: pagina.toString(),
        limite: porPagina.toString(),
        status: statusFiltro !== "TODOS" ? statusFiltro : "",
      });
      const res = await fetch(`${API_URL}/admin/comentarios?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar comentarios");
      const data = await res.json();
      setComentarios(data.items);
      setTotal(data.total);
    } catch (err) {
      setErro(formatarErroApi(err));
    } finally {
      setBuscando(false);
    }
  };

  const atualizarStatus = async (id: string, novoStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/comentarios/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      buscarComentarios(); // recarrega a lista
    } catch (err) {
      alert(formatarErroApi(err));
    }
  };

  const excluirComentario = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este comentario?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/comentarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir comentario");
      buscarComentarios(); // recarrega a lista
    } catch (err) {
      alert(formatarErroApi(err));
    }
  };

  if (carregando) return <AdminLoadingPage usuario={usuario} />;

  return (
    <AdminShell usuario={usuario}>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-admin-foreground">Comentarios</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Modere os comentarios deixados pelos visitantes no portal.
          </p>
        </div>
      </header>

      {erro && (
        <p className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-md border border-admin-border bg-admin-surface p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="status" className="text-sm font-semibold text-admin-muted">Filtrar por Status:</label>
          <select 
            id="status"
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="h-10 rounded-md border border-admin-border bg-admin-soft px-3 text-sm outline-none focus:border-admin-sidebar text-admin-foreground"
          >
            <option value="TODOS">Todos os status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="APROVADO">Aprovados</option>
            <option value="REJEITADO">Rejeitados</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-admin-border bg-admin-surface">
        <div className="divide-y divide-admin-border md:hidden">
          {comentarios.map((c) => (
            <article key={c.id} className="grid gap-3 p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-semibold text-admin-foreground">{c.autorNome}</h3>
                  <p className="mt-1 text-sm text-admin-muted">{c.autorEmail || "Sem e-mail"}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  c.status === "APROVADO" ? "bg-emerald-100 text-emerald-800" :
                  c.status === "REJEITADO" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="text-xs text-admin-muted font-semibold uppercase tracking-wider">
                {formatarDataPtBr(c.criadoEm)}
              </div>
              <div className="rounded bg-admin-background/50 p-3">
                <p className="text-sm text-admin-foreground whitespace-pre-wrap">{c.conteudo}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="inline-flex rounded-full bg-admin-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-admin-muted">
                  {c.entidadeTipo}
                </span>
                <div className="flex gap-2">
                  {c.status !== "APROVADO" && (
                    <button onClick={() => atualizarStatus(c.id, "APROVADO")} className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Aprovar</button>
                  )}
                  {c.status !== "REJEITADO" && (
                    <button onClick={() => atualizarStatus(c.id, "REJEITADO")} className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">Rejeitar</button>
                  )}
                  <button onClick={() => excluirComentario(c.id)} className="rounded border border-admin-border bg-admin-soft px-3 py-1 text-xs font-semibold text-admin-foreground hover:bg-admin-background">Excluir</button>
                </div>
              </div>
            </article>
          ))}
          {comentarios.length === 0 && !buscando && (
            <div className="p-12 text-center text-admin-muted">Nenhum comentario encontrado.</div>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
          <thead className="bg-admin-soft font-semibold text-admin-muted">
            <tr>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Comentario</th>
              <th className="px-4 py-3">Referencia</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border text-admin-foreground">
            {comentarios.map((c) => (
              <tr key={c.id} className="hover:bg-admin-background/50">
                <td className="px-4 py-3">
                  <strong>{c.autorNome}</strong><br/>
                  <span className="text-xs text-admin-muted">{c.autorEmail || "Sem e-mail"}</span><br/>
                  <span className="text-xs text-admin-muted">{formatarDataPtBr(c.criadoEm)}</span>
                </td>
                <td className="px-4 py-3 max-w-sm">
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm">{c.conteudo}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-admin-background px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-admin-muted">
                    {c.entidadeTipo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    c.status === "APROVADO" ? "bg-emerald-100 text-emerald-800" :
                    c.status === "REJEITADO" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.status !== "APROVADO" && (
                      <button onClick={() => atualizarStatus(c.id, "APROVADO")} className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Aprovar</button>
                    )}
                    {c.status !== "REJEITADO" && (
                      <button onClick={() => atualizarStatus(c.id, "REJEITADO")} className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">Rejeitar</button>
                    )}
                    <button onClick={() => excluirComentario(c.id)} className="rounded border border-admin-border bg-admin-soft px-3 py-1 text-xs font-semibold text-admin-foreground hover:bg-admin-background">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {comentarios.length === 0 && !buscando && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-admin-muted">Nenhum comentario encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-admin-muted">Mostrando {comentarios.length} de {total}</p>
        <AdminPaginacao 
          paginaAtual={pagina}
          totalPaginas={Math.ceil(total / porPagina)}
          totalItens={total}
          porPagina={porPagina}
          setPagina={setPagina}
          setPorPagina={setPorPagina}
          selectId="comentarios-por-pagina"
        />
      </div>
    </AdminShell>
  );
}

