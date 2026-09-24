import { Link } from "@tanstack/react-router";
import { Menu, Search, X, Download } from "lucide-react";
import { useState } from "react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Início" },
  { to: "/comercios", label: "Comércios" },
  { to: "/agenda", label: "Agenda" },
  { to: "/cursos", label: "Cursos e oportunidades" },
  { to: "/boletim", label: "Boletim" },
  { to: "/sobre", label: "Sobre" },
] as const;

import { GlobalSearch } from "./global-search";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { canInstall, promptInstall } = usePwaInstall();

  const handleInstallClick = () => {
    if (canInstall) {
      promptInstall();
    } else {
      toast.info("Já instalado", {
        description: "Procure nos seus apps ou na tela inicial.",
        position: "top-center",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
      {/* NAVBAR DESKTOP / TABLET */}
      <div
        className="
          mx-auto flex h-[76px] max-w-6xl items-center
          gap-8 px-4 sm:px-6
          lg:justify-center lg:gap-10
        "
      >
        {/* LOGO */}
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="Alvarães Moderna, página inicial"
        >
          <img
            src="/logo.png"
            alt="Logo Alvarães Moderna"
            className="
              h-[58px] w-auto object-contain
              transition-transform duration-300
              hover:scale-[1.03]
              sm:h-[62px]
            "
          />
        </Link>

        {/* MENU DESKTOP */}
        <nav
          className="hidden items-center gap-5 lg:flex"
          aria-label="Navegação principal"
        >
          {/* INÍCIO */}
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{
              className: "border-primary text-primary",
            }}
            className="
              border-b-2 border-transparent
              px-1 py-2
              text-xs font-medium text-foreground/70
              transition-colors
              hover:text-primary
            "
          >
            Início
          </Link>

          {/* NOTÍCIAS */}
          <Link
            to="/noticias"
            search={{}}
            activeProps={{
              className: "border-primary text-primary",
            }}
            className="
              border-b-2 border-transparent
              px-1 py-2
              text-xs font-medium text-foreground/70
              transition-colors
              hover:text-primary
            "
          >
            Notícias
          </Link>

          {/* DEMAIS LINKS */}
          {nav.slice(1).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{
                className: "border-primary text-primary",
              }}
              className="
                border-b-2 border-transparent
                px-1 py-2
                text-xs font-medium text-foreground/70
                transition-colors
                hover:text-primary
              "
            >
              {item.label}
            </Link>
          ))}

          {/* BUSCA */}
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => setSearchOpen(true)}
            className="
              flex size-9 items-center justify-center
              rounded-full
              text-foreground/60
              transition-colors
              hover:bg-secondary
              hover:text-primary
            "
          >
            <Search className="size-4" />
          </button>

          {/* INSTALAR APP */}
          <button
            type="button"
            onClick={handleInstallClick}
            className="
              flex items-center gap-2
              rounded-full
              border border-primary/30
              bg-primary/5
              px-4 py-2.5
              text-xs font-semibold
              text-primary
              transition-all duration-300
              hover:-translate-y-0.5
              hover:bg-primary/10
              hover:border-primary/50
            "
          >
            <Download className="size-4" />
            Instalar App
          </button>

          {/* ANUNCIE */}
          <Link
            to="/anuncie"
            className="
              flex items-center gap-2
              rounded-full
              bg-primary
              px-5 py-2.5
              text-xs font-semibold
              text-primary-foreground
              transition-all duration-300
              hover:-translate-y-0.5
              hover:bg-primary/90
            "
          >
            Anuncie
            <span aria-hidden="true">→</span>
          </Link>
        </nav>

        {/* BOTÃO MENU MOBILE */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="
            ml-auto shrink-0
            rounded-full
            border border-border
            p-2
            text-primary
            transition-colors
            hover:bg-secondary
            lg:hidden
          "
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}

          <span className="sr-only">
            {open ? "Fechar menu" : "Abrir menu"}
          </span>
        </button>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navegação principal (celular)"
          className="
            border-t border-border
            bg-background
            lg:hidden
          "
        >
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {/* INÍCIO */}
            <li>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                activeOptions={{ exact: true }}
                activeProps={{
                  className: "text-primary font-semibold",
                }}
                className="
                  block
                  border-b border-border/60
                  py-3
                  text-base
                  text-foreground/80
                  transition-colors
                  hover:text-primary
                "
              >
                Início
              </Link>
            </li>

            {/* NOTÍCIAS */}
            <li>
              <Link
                to="/noticias"
                search={{}}
                onClick={() => setOpen(false)}
                activeProps={{
                  className: "text-primary font-semibold",
                }}
                className="
                  block
                  border-b border-border/60
                  py-3
                  text-base
                  text-foreground/80
                  transition-colors
                  hover:text-primary
                "
              >
                Notícias
              </Link>
            </li>

            {/* DEMAIS LINKS */}
            {nav.slice(1).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeProps={{
                    className: "text-primary font-semibold",
                  }}
                  className="
                    block
                    border-b border-border/60
                    py-3
                    text-base
                    text-foreground/80
                    transition-colors
                    hover:text-primary
                  "
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* BUSCA MOBILE */}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
                className="
                  flex w-full items-center gap-3
                  border-b border-border/60
                  py-3
                  text-base
                  text-foreground/80
                  transition-colors
                  hover:text-primary
                "
              >
                <Search className="size-5" />

                Buscar
              </button>
            </li>

            {/* ANUNCIE MOBILE */}
            <li className="py-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  handleInstallClick();
                }}
                className="
                  flex items-center justify-center gap-2
                  rounded-full
                  border-2 border-primary
                  bg-transparent
                  px-4 py-3
                  text-base font-semibold
                  text-primary
                  transition-colors
                  hover:bg-primary/10
                "
              >
                <Download className="size-5" />
                Instalar App
              </button>
              <Link
                to="/anuncie"
                onClick={() => setOpen(false)}
                className="
                  flex items-center justify-center gap-2
                  rounded-full
                  bg-primary
                  px-4 py-3
                  text-base font-semibold
                  text-primary-foreground
                  transition-colors
                  hover:bg-primary/90
                "
              >
                Anuncie
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}