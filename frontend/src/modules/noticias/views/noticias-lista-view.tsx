import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppPagination } from "@/components/app-pagination";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EmptyState, PhotoPlaceholder, Tag } from "@/components/ui-bits";
import { formatarDataPublica, noticiasApi } from "../api/noticias.api";
import { NoticiaCard } from "../components/noticia-card";
import type { NoticiaPublica } from "../types/noticia.types";

const ITENS_POR_PAGINA_INICIAL = 6;

export function NoticiasListaView({
  categoriaBusca,
}: {
  categoriaBusca?: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const [buscaSubmetida, setBuscaSubmetida] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [categorias, setCategorias] = useState<{ slug: string; nome: string }[]>([]);
  const [destaques, setDestaques] = useState<NoticiaPublica[]>([]);
  const [maisLidas, setMaisLidas] = useState<NoticiaPublica[]>([]);
  const [category, setCategory] = useState<string>(categoriaBusca ?? "Todas");
  const [noticias, setNoticias] = useState<NoticiaPublica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(ITENS_POR_PAGINA_INICIAL);

  useEffect(() => {
    setCarregando(true);
    setErro("");
    noticiasApi.listar().then(res => setNoticias(res.dados))
      .catch((error) =>
        setErro(error instanceof Error ? error.message : "Não foi possível carregar noticias."),
      )
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    setCategory(categoriaBusca ?? "Todas");
    setPagina(1);
  }, [categoriaBusca]);

  useEffect(() => {
    if (!categoriaBusca || carregando) return;

    window.requestAnimationFrame(() => {
      document.getElementById("lista-noticias")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [categoriaBusca, carregando]);

  

  

  useEffect(() => {
    setCarregando(true);
    setErro("");
    noticiasApi
      .listar({ pagina, limite: itensPorPagina, busca: buscaSubmetida, categoria: category })
      .then(res => {
        setNoticias(res.dados);
        setTotalItems(res.total);
      })
      .catch((error) =>
        setErro(error instanceof Error ? error.message : "Não foi possível carregar noticias."),
      )
      .finally(() => setCarregando(false));
  }, [pagina, itensPorPagina, buscaSubmetida, category]);

  

  

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          Notícias
        </p>
        <h1 className="mt-2 font-display text-4xl leading-none text-primary sm:text-5xl">
          Notícias
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground/70">
          As últimas notícias e histórias da nossa cidade, com o que realmente importa para o seu
          dia a dia em Alvarães.
        </p>
      </header>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      {!carregando && destaques.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl text-primary">Destaques</h2>
            <span className="text-xs text-muted-foreground">Ver todas as noticias -&gt;</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_285px]">
            <Carousel className="relative overflow-hidden rounded-lg">
              <CarouselContent>
                {destaques.map((noticia) => (
                  <CarouselItem key={noticia.slug}>
                    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                      <Link
                        to="/noticias/$slug"
                        params={{ slug: noticia.slug }}
                        className="block"
                      >
                        {noticia.imagemUrl ? (
                          <img
                            src={noticia.imagemUrl}
                            alt={noticia.imagemAlt ?? noticia.titulo}
                            className="aspect-[16/8] w-full object-cover"
                          />
                        ) : (
                          <PhotoPlaceholder className="aspect-[16/8] rounded-none" />
                        )}
                      </Link>
                      <div className="p-5 sm:p-6">
                        <Tag>{noticia.categoria.nome}</Tag>
                        <h3 className="mt-3 max-w-2xl font-display text-2xl leading-tight text-primary sm:text-3xl">
                          <Link
                            to="/noticias/$slug"
                            params={{ slug: noticia.slug }}
                            className="hover:text-primary/80"
                          >
                            {noticia.titulo}
                          </Link>
                        </h3>
                        <p className="mt-2 max-w-xl text-xs leading-relaxed text-foreground/75 sm:text-sm">
                          {noticia.resumo}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                          <p className="text-[11px] text-muted-foreground">
                            {formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}
                          </p>
                          <Link
                            to="/noticias/$slug"
                            params={{ slug: noticia.slug }}
                            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                          >
                            Ler reportagem -&gt;
                          </Link>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {destaques.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 top-[38%]" />
                  <CarouselNext className="right-3 top-[38%]" />
                </>
              )}
            </Carousel>

            <aside className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-primary">#</span>
                <h2 className="font-display text-xl text-primary">Mais lidas</h2>
              </div>
              <div className="divide-y divide-border">
                {maisLidas.map((noticia, index) => (
                  <Link
                    key={noticia.slug}
                    to="/noticias/$slug"
                    params={{ slug: noticia.slug }}
                    className="flex gap-2 py-2.5"
                  >
                    <span className="font-display text-lg text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {noticia.imagemUrl && (
                      <img
                        src={noticia.imagemUrl}
                        alt=""
                        className="size-12 shrink-0 rounded object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <Tag>{noticia.categoria.nome}</Tag>
                      <strong className="mt-1 block font-display text-xs leading-tight text-primary">
                        {noticia.titulo}
                      </strong>
                      <small className="text-[9px] text-muted-foreground">
                        {formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
        <form onSubmit={(e) => { e.preventDefault(); setBuscaSubmetida(query); setPagina(1); }} className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
          
          <Search className="h-4 w-4 text-primary" />
          <span className="sr-only">Buscar por palavra-chave</span>
          <input type="search" id="busca" name="busca" autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por palavra-chave..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        
        </form>
        <div className="flex flex-wrap gap-2">
          {[{ slug: "Todas", nome: "Todas" }, ...categorias].map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                category === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/70 text-foreground/70 hover:border-primary"
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </section>

      <section id="lista-noticias" className="scroll-mt-24">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-primary">Todas as noticias</h2>
            <p className="text-xs text-muted-foreground">{totalItems} noticias encontradas</p>
          </div>
          <select className="rounded-md border border-border bg-card px-3 py-2 text-xs">
            <option>Mais recentes</option>
            <option>Mais antigas</option>
          </select>
        </div>

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <NoticiaCard key={n.slug} noticia={n} />
            ))}
          </div>
        )}

        {!carregando && totalItems === 0 && (
          <div className="mt-6">
            <EmptyState>
              Nenhuma publicação encontrada com esses termos. Tente outra palavra ou escolha outra
              categoria.
            </EmptyState>
          </div>
        )}

        {!carregando && totalItems > 0 && (
          <AppPagination
            totalItems={totalItems}
            page={pagina}
            itemsPerPage={itensPorPagina}
            onPageChange={setPagina}
            onItemsPerPageChange={setItensPorPagina}
            selectId="noticias-por-pagina"
          />
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-secondary/70 p-4 sm:flex-row sm:items-center sm:px-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">
          Email
        </span>
        <div>
          <h2 className="font-display text-base text-primary">
            Receba as principais noticias no seu e-mail
          </h2>
          <p className="text-xs text-foreground/65">Fique por dentro do que acontece em Alvarães.</p>
        </div>
        <Link
          to="/boletim"
          className="rounded-full bg-primary px-5 py-2 text-center text-xs font-semibold text-primary-foreground sm:ml-auto"
        >
          Inscreva-se -&gt;
        </Link>
      </section>
    </div>
  );
}
