import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppPagination } from "@/components/app-pagination";
import { EmptyState } from "@/components/ui-bits";
import { ComercioCard, ComercioCardSkeleton, ComercioMiniCard } from "../components/comercio-card";
import { comerciosApi } from "../api/comercios.api";
import type { ComercioPublico } from "../types/comercio.types";

const ITENS_POR_PAGINA_INICIAL = 6;

export function ComerciosListaView() {
  const [query, setQuery] = useState("");
  const [buscaSubmetida, setBuscaSubmetida] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [categorias, setCategorias] = useState<{ slug: string; nome: string }[]>([]);
  const [destaques, setDestaques] = useState<ComercioPublico[]>([]);
  const [category, setCategory] = useState<string>("Todas");
  const [comercios, setComercios] = useState<ComercioPublico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(ITENS_POR_PAGINA_INICIAL);

  const listaRef = useRef<HTMLElement>(null);
  const mudouPaginaRef = useRef(false);

  const mudarPagina = (novaPagina: number) => {
    mudouPaginaRef.current = true;
    setPagina(novaPagina);
  };

  useEffect(() => {
    comerciosApi.listarCategorias().then(setCategorias).catch(console.error);
    comerciosApi.listar({ limite: 4, patrocinado: true, possuiPagina: true })
      .then(res => setDestaques(res.dados))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setCarregando(true);
    setErro("");
    comerciosApi
      .listar({ pagina, limite: itensPorPagina, busca: buscaSubmetida, categoria: category })
      .then(res => {
        setComercios(res.dados);
        setTotalItems(res.total);
        if (mudouPaginaRef.current) {
          mudouPaginaRef.current = false;
          setTimeout(() => {
            listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
      })
      .catch((error) =>
        setErro(error instanceof Error ? error.message : "Não foi possível carregar comercios."),
      )
      .finally(() => setCarregando(false));
  }, [pagina, itensPorPagina, buscaSubmetida, category]);

  const comerciosPaginados = comercios;

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="relative isolate -mx-4 overflow-hidden border-y border-border bg-secondary sm:mx-0 sm:rounded-[28px] sm:border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_35%,oklch(0.86_0.06_185),transparent_42%),linear-gradient(110deg,oklch(0.99_0.008_95),oklch(0.92_0.045_175))]" />
        <div className="px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            Guia local
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-none text-primary sm:text-5xl">
            Comércios e serviços da cidade
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/75 sm:text-base">
            Procure onde comprar ou quem contratar. Explore os negócios de Alvarães por categoria e
            encontre informações para entrar em contato.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
        <form onSubmit={(e) => { e.preventDefault(); setBuscaSubmetida(query); setPagina(1); }} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center w-full">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
            <Search className="h-4 w-4 text-primary shrink-0" />
            <span className="sr-only">Buscar por palavra-chave</span>
            <input
              type="search"
              id="busca-comercios"
              name="busca-comercios"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, categoria ou bairro..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setBuscaSubmetida(''); setPagina(1); }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground p-1"
              >
                Limpar
              </button>
            )}
          </div>
          <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground w-full sm:w-auto transition-opacity hover:opacity-90 active:opacity-80">
            Pesquisar
          </button>
        </form>
        <div className="flex items-center flex-nowrap gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide whitespace-nowrap">
          {[{ slug: "Todas", nome: "Todas" }, ...categorias].map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => { setCategory(cat.slug); setPagina(1); }}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                category === cat.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/70 text-foreground/70 hover:border-primary"
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </section>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <section className="rounded-xl bg-secondary/70 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex gap-3">
            <span className="text-2xl text-primary">★</span>
            <div>
              <h2 className="font-display text-xl text-primary">Destaques do guia</h2>
              <p className="mt-1 text-xs text-foreground/70">
                Conheça alguns estabelecimentos que fazem a diferença em Alvarães.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {destaques
              .slice(0, 2)
              .map((comercio) => (
                <ComercioMiniCard key={comercio.slug} comercio={comercio} />
              ))}
          </div>
        </div>
      </section>

      <section id="lista-comercios" ref={listaRef} className="scroll-mt-24 min-h-[480px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-primary sm:text-3xl">
              Todos os comércios
            </h2>
            <p className="text-sm text-muted-foreground">{totalItems} resultados encontrados</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Ordenar por:
            <select className="rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground">
              <option>Mais recentes</option>
              <option>Nome A-Z</option>
            </select>
          </label>
        </div>

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ComercioCardSkeleton key={index} />
            ))}
          </div>
        ) : totalItems === 0 ? (
          <EmptyState>Nenhum comércio encontrado.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comerciosPaginados.map((comercio) => (
                <ComercioCard key={comercio.slug} comercio={comercio} />
              ))}
            </div>
            <aside className="rounded-lg border border-border bg-secondary/60 p-5 text-center">
              <span className="text-4xl text-primary">♜</span>
              <h2 className="mt-3 font-display text-2xl leading-tight text-primary">
                Seu comércio faz parte da cidade.
              </h2>
              <p className="mt-2 text-sm text-foreground/70">
                Faça parte do guia e alcance mais pessoas.
              </p>
              <Link
                to="/anuncie"
                className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Quero incluir meu negócio →
              </Link>
              <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Destaque-se
              </p>
            </aside>
          </div>
        )}

        {totalItems > 0 && !carregando && (
          <div className="mt-8 flex justify-center">
            <AppPagination
              totalItems={totalItems}
              page={pagina}
              itemsPerPage={itensPorPagina}
              onPageChange={mudarPagina}
              onItemsPerPageChange={setItensPorPagina}
              selectId="comercios-por-pagina"
            />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-secondary/70 p-4 sm:flex-row sm:items-center sm:px-5">
        <span className="text-2xl text-primary">✉</span>
        <strong className="font-display text-base text-primary">Receba novidades de Alvarães</strong>
        <span className="text-xs text-foreground/70">
          Fique por dentro das notícias, eventos e novos comércios da cidade.
        </span>
        <Link
          to="/boletim"
          className="rounded-full bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground sm:ml-auto"
        >
          Inscrever-se →
        </Link>
      </section>
    </div>
  );
}
