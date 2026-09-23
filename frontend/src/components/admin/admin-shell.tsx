import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Store,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { removerTokenAdmin, type UsuarioAdmin } from "../../lib/admin-api";

type AdminShellProps = {
  usuario?: UsuarioAdmin | null;
  children: ReactNode;
  wide?: boolean;
};

const menu = [
  { to: "/admin", label: "Visao geral", icon: LayoutDashboard },
  { to: "/admin/noticias", label: "Noticias", icon: Newspaper },
  { to: "/admin/comercios", label: "Comercios", icon: Store },
  { to: "/admin/eventos", label: "Agenda", icon: CalendarDays },
  { to: "/admin/cursos", label: "Cursos", icon: GraduationCap },
  { to: "/admin/comentarios", label: "Comentarios", icon: MessageSquare },
  { to: "/admin/boletim", label: "Boletim", icon: Mail },
  { to: "/admin/contatos", label: "Contatos", icon: MessageSquare },
  { to: "/admin/pedidos-anuncio", label: "Anuncios", icon: Megaphone },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
] as const;

export function AdminShell({ usuario, children, wide = false }: AdminShellProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const el = document.getElementById("active-mobile-menu-item");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [pathname]);

  function sair() {
    removerTokenAdmin();
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-page">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-admin-sidebar text-white lg:flex">
        <div className="border-b border-white/10 p-5">
          <p className="font-display text-xl font-semibold">
            Alvarães <span className="italic">Moderna</span>
          </p>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-white/70">
            PAINEL DA REDAÇÃO
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {menu.map((item) => {
            const Icon = item.icon;
            const ativo = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors ${
                  ativo ? "bg-white/16 text-white" : "text-white/88 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold">{usuario?.nome ?? "Administrador"}</p>
          <p className="truncate text-xs text-white/70">{usuario?.email}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href="/"
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-white/10 px-2 text-xs font-semibold hover:bg-white/16"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver site
            </a>
            <button
              type="button"
              onClick={sair}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-white/10 px-2 text-xs font-semibold hover:bg-white/16"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-admin-border bg-admin-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold">Alvarães Moderna</p>
              <p className="text-xs font-semibold tracking-[0.16em] text-admin-muted">PAINEL</p>
            </div>
            <button
              type="button"
              onClick={sair}
              className="inline-flex h-9 items-center justify-center rounded-md border border-admin-border px-3 text-sm font-semibold"
            >
              Sair
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {menu.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                id={pathname === item.to ? "active-mobile-menu-item" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
                  pathname === item.to
                    ? "bg-admin-sidebar text-white"
                    : "bg-admin-surface text-admin-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main
          className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10 ${
            wide ? "max-w-[1480px]" : "max-w-6xl"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
