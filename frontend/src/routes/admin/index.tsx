import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, Mail, Newspaper, Plus, Store, Users, MessageSquare, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell, AdminLoadingPage } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import { adminApi, formatarDataPtBr, formatarErroApi, type ResumoAdmin } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Painel administrativo - Alvarães Moderna" }],
  }),
  component: AdminDashboardPage,
});

const cards = [
  { chave: "noticias", label: "NOTICIAS", icon: Newspaper, href: "/admin/noticias" },
  { chave: "comercios", label: "COMERCIOS", icon: Store, href: "/admin/comercios" },
  { chave: "eventos", label: "EVENTOS", icon: CalendarDays, href: "/admin/eventos" },
  { chave: "cursos", label: "CURSOS", icon: GraduationCap, href: "/admin/cursos" },
  { chave: "anuncios", label: "PEDIDOS DE ANÚNCIO", icon: Megaphone, href: "/admin/pedidos-anuncio" },
  { chave: "contatos", label: "MENSAGENS DE CONTATO", icon: MessageSquare, href: "/admin/contatos" },
  { chave: "inscritosBoletim", label: "INSCRITOS NO BOLETIM", icon: Mail, href: "/admin/boletim" },
  { chave: "usuarios", label: "USUARIOS", icon: Users, href: "/admin/usuarios" },
] as const;

function AdminDashboardPage() {
  const { usuario, carregando } = useAdminAuth();
  const [resumo, setResumo] = useState<ResumoAdmin | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    adminApi
      .resumo()
      .then(setResumo)
      .catch((error) => setErro(formatarErroApi(error)));
  }, []);

  if (carregando) return <AdminLoadingPage usuario={usuario} />;

  return (
    <AdminShell usuario={usuario}>
      <span className="inline-flex rounded-full bg-[#f4e5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#c9502c]">
        Visão geral
      </span>
      <h1 className="mt-3 font-display text-4xl font-semibold">Olá, {usuario?.nome}</h1>
      <p className="mt-2 max-w-2xl text-[#33483d]">
        Aqui você publica noticias, atualiza o guia comercial, a agenda e os cursos sem precisar
        de programador. Tudo que salvar aparece no site na hora.
      </p>

      {erro && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const valor = resumo?.contagens[card.chave] ?? 0;
          return (
            <Link 
              to={card.href} 
              key={card.chave} 
              className="group rounded-md border border-[#ded8ca] bg-white p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ebdf] transition-colors group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 transition-colors group-hover:text-primary" />
                </span>
                <div>
                  <p className="font-display text-3xl font-semibold transition-colors group-hover:text-primary">{valor}</p>
                  <p className="text-xs font-semibold tracking-[0.08em] text-[#456054]">
                    {card.label}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 rounded-md border border-[#ded8ca] bg-white p-6">
        <h2 className="font-display text-xl font-semibold">Conteúdo de demonstracao no site</h2>
        <p className="mt-2 text-sm text-[#456054]">
          Ainda existem {resumo?.demo.total ?? 0} itens ficticios (
          {resumo?.demo.noticias ?? 0} noticias, {resumo?.demo.comercios ?? 0} comercios,{" "}
          {resumo?.demo.eventos ?? 0} eventos, {resumo?.demo.cursos ?? 0} cursos).
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-md border border-[#ded8ca] bg-white p-6">
          <h2 className="font-display text-xl font-semibold">Últimas notícias</h2>
          <div className="mt-4 divide-y divide-[#e5dfd0]">
            {(resumo?.noticiasRecentes ?? []).map((noticia) => (
              <Link
                key={noticia.id}
                to="/admin/noticias"
                className="flex items-center justify-between gap-4 py-3 text-sm hover:text-[#c9502c]"
              >
                <span className="underline underline-offset-2">{noticia.titulo}</span>
                <span className="shrink-0 text-xs text-[#456054]">
                  {formatarDataPtBr(noticia.publicadoEm)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-md bg-[#062f1f] p-6 text-white">
          <h2 className="font-display text-xl font-semibold">Atalhos</h2>
          <div className="mt-4 grid gap-2">
            <Link
              to="/admin/noticias"
              className="inline-flex h-10 items-center gap-3 rounded-md bg-white/12 px-4 text-sm font-semibold hover:bg-white/18"
            >
              <Plus className="h-4 w-4" />
              Nova noticia
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
