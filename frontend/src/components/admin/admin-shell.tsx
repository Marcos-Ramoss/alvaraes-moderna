import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Download,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { LoadingLogo } from "@/components/loading-logo";
import { removerTokenAdmin, temPermissao, type Permissao, type UsuarioAdmin } from "../../lib/admin-api";
import { limparCacheUsuarioAdmin } from "./use-admin-auth";

type AdminShellProps = {
  usuario?: UsuarioAdmin | null;
  children: ReactNode;
  wide?: boolean;
};

type MenuItem = {
  to: string;
  label: string;
  icon: any;
  permissao?: Permissao;
};

const menu: MenuItem[] = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { to: "/admin/noticias", label: "Notícias", icon: Newspaper, permissao: "NOTICIAS" },
  { to: "/admin/comercios", label: "Comércios", icon: Store, permissao: "COMERCIOS" },
  { to: "/admin/eventos", label: "Agenda", icon: CalendarDays, permissao: "EVENTOS" },
  { to: "/admin/cursos", label: "Cursos", icon: GraduationCap, permissao: "CURSOS" },
  { to: "/admin/comentarios", label: "Comentários", icon: MessageSquare, permissao: "COMENTARIOS" },
  { to: "/admin/boletim", label: "Boletim", icon: Mail, permissao: "BOLETIM" },
  { to: "/admin/contatos", label: "Contatos", icon: MessageSquare, permissao: "CONTATOS" },
  { to: "/admin/pedidos-anuncio", label: "Anúncios", icon: Megaphone, permissao: "ANUNCIOS" },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, permissao: "USUARIOS" },
  { to: "/admin/auditoria", label: "Auditoria", icon: ShieldCheck, permissao: "AUDITORIA" },
];

export function AdminShell({ usuario, children, wide = false }: AdminShellProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { canInstall, promptInstall, isIos, isInstalled, isStandalone } = usePwaInstall();

  const itensVisiveis = menu.filter((item) => {
    if (!item.permissao) return true;
    return temPermissao(usuario, item.permissao);
  });

  useEffect(() => {
    const el = document.getElementById("active-mobile-menu-item");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [pathname]);

  function sair() {
    limparCacheUsuarioAdmin();
    removerTokenAdmin();
    window.location.href = "/admin/login";
  }

  const handleInstallClick = async () => {
    if (canInstall) {
      try {
        await promptInstall();
      } catch {
        toast.error("Não foi possível abrir a instalação do Painel Admin.", {
          description: "Confira no menu do navegador se há uma opção para instalar este aplicativo.",
          position: "top-center",
        });
      }
      return;
    }

    if (isStandalone) {
      toast.info("Você já está usando o aplicativo do Painel Admin instalado.", {
        position: "top-center",
      });
      return;
    }

    if (isInstalled) {
      toast.info("O aplicativo do Painel Admin já está instalado neste dispositivo.", {
        description: "Procure nos seus aplicativos ou na tela inicial.",
        position: "top-center",
      });
      return;
    }

    if (isIos) {
      toast("Instalar Painel Admin no iPhone ou iPad", {
        description:
          "No Safari, toque no botão Compartilhar (ícone com quadrado e seta) e selecione 'Adicionar à Tela de Início'.",
        position: "top-center",
        duration: 8000,
      });
      return;
    }

    toast.info("Instalação do Painel Admin", {
      description:
        "No menu do seu navegador (três pontinhos ou ícone de computador na barra de endereços), clique em 'Instalar aplicativo' ou 'Adicionar à tela inicial'.",
      position: "top-center",
    });
  };

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
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {itensVisiveis.map((item) => {
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
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition-all hover:bg-white/20 hover:border-white/40"
            title="Instalar o painel administrativo como aplicativo no seu computador ou celular"
          >
            <Download className="h-4 w-4" />
            <span>{isStandalone ? "Painel Admin instalado" : "Instalar App Admin"}</span>
          </button>
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{usuario?.nome ?? "Administrador"}</p>
            {usuario?.role === "MASTER" ? (
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                MASTER
              </span>
            ) : (
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
                ADMIN
              </span>
            )}
          </div>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-2.5 text-xs font-semibold text-admin-foreground transition-colors hover:bg-admin-border"
                title="Instalar aplicativo do Painel Admin"
              >
                <Download className="h-3.5 w-3.5 text-admin-sidebar" />
                <span>{isStandalone ? "App Instalado" : "Instalar App"}</span>
              </button>
              <button
                type="button"
                onClick={sair}
                className="inline-flex h-9 items-center justify-center rounded-md border border-admin-border px-3 text-sm font-semibold"
              >
                Sair
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {itensVisiveis.map((item) => (
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
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm font-semibold text-admin-foreground"
            >
              <Download className="h-4 w-4 text-admin-sidebar" />
              {isStandalone ? "App Admin instalado" : "Instalar App Admin"}
            </button>
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

export function AdminLoadingContent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-16">
      <LoadingLogo />
    </div>
  );
}

export function AdminLoadingPage({
  usuario,
  wide = false,
}: {
  usuario?: UsuarioAdmin | null;
  wide?: boolean;
}) {
  if (!usuario) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-admin-background">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <AdminShell usuario={usuario} wide={wide}>
      <AdminLoadingContent />
    </AdminShell>
  );
}
