/// <reference types="vite-plugin-pwa/client" />
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { LoadingLogo } from "@/components/loading-logo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="max-w-md text-center">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Esta página não carregou
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Algo deu errado do nosso lado. Você pode tentar novamente ou voltar para a página inicial.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Tentar novamente
        </button>

        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  </div>
);
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: (ctx) => {
    const isAdmin =
      ctx?.matches?.some(
        (m) => m.pathname?.startsWith("/admin") || m.id?.startsWith("/admin")
      ) ?? false;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" },
        { title: isAdmin ? "Painel administrativo - Alvarães Moderna" : "Alvarães Moderna — Alvarães perto de você" },
        { name: "theme-color", content: "#12372a" },
        { name: "apple-mobile-web-app-title", content: isAdmin ? "Alvarães Admin" : "Alvarães" },
        {
          name: "description",
          content: isAdmin
            ? "Painel de administração e gestão de conteúdo do portal Alvarães Moderna."
            : "Notícias, comercios, serviços, agenda e oportunidades da cidade de Alvarães, no Amazonas.",
        },
        { name: "author", content: "Alvarães Moderna" },
        { property: "og:site_name", content: "Alvarães Moderna" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: isAdmin ? "/manifest-admin.webmanifest" : "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/logo.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Source+Sans+3:wght@400;600;700&display=swap",
        },
        { rel: "icon", href: "/logo.png", type: "image/png" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaPrompt = e;
                window.dispatchEvent(new Event('pwa-prompt-available'));
              });
            `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function GlobalLoader() {
  const isRouterLoading = useRouterState({ select: (s) => s.isLoading });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isRouterLoading) {
      setIsMounted(true);
    } else {
      // Aguarda 300ms (tempo da transição CSS) antes de desmontar o componente do DOM
      timeout = setTimeout(() => setIsMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [isRouterLoading]);

  if (!isMounted && !isRouterLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${isRouterLoading ? "opacity-100" : "opacity-0"}`}
    >
      <LoadingLogo />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      import("virtual:pwa-register")
        .then(({ registerSW }) => {
          registerSW({ immediate: true });
        })
        .catch(() => {
          // Ignorar erro silenciosamente se plugin n estiver resolvido (ex: testes)
        });
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const targetHref = isAdminRoute ? "/manifest-admin.webmanifest" : "/manifest.webmanifest";
    if (manifestLink && manifestLink.getAttribute("href") !== targetHref) {
      manifestLink.setAttribute("href", targetHref);
    }
  }, [isAdminRoute]);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoader />
      <a
        href="#conteúdo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Ir para o conteúdo
      </a>
      {isAdminRoute ? (
        <Outlet />
      ) : (
        <>
          <SiteHeader />
          <main id="conteúdo" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <SiteFooter />
        </>
      )}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

