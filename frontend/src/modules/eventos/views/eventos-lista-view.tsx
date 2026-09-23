import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppPagination } from "@/components/app-pagination";
import { EmptyState } from "@/components/ui-bits";
import { eventosApi } from "../api/eventos.api";
import { Calendar, EventoCard } from "../components/evento-card";
import type { EventoPublico } from "../types/evento.types";

const ITENS_POR_PAGINA_INICIAL = 6;

export function EventosListaView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [paginaPróximos, setPaginaPróximos] = useState(1);
  const [itensPorPaginaPróximos, setItensPorPaginaPróximos] = useState(ITENS_POR_PAGINA_INICIAL);
  const [paginaEncerrados, setPaginaEncerrados] = useState(1);
  const [itensPorPaginaEncerrados, setItensPorPaginaEncerrados] = useState(
    ITENS_POR_PAGINA_INICIAL,
  );
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);

  useEffect(() => {
    setCarregando(true);
    setErro("");
    eventosApi
      .listar()
      .then(setEventos)
      .catch((error) =>
        setErro(error instanceof Error ? error.message : "Não foi possível carregar eventos."),
      )
      .finally(() => setCarregando(false));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return eventos.filter((evento) => {
      const matchCat = category === "Todas" || evento.categoria.slug === category;
      const matchQ =
        !q ||
        evento.titulo.toLowerCase().includes(q) ||
        evento.local.toLowerCase().includes(q) ||
        evento.categoria.nome.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category, eventos]);

  const allUpcoming = useMemo(() => results.filter((evento) => !evento.encerrado), [results]);
  
  const upcoming = useMemo(() => {
    if (!dataSelecionada) return allUpcoming;
    return allUpcoming.filter((evento) => {
      const d = new Date(evento.data);
      return (
        d.getFullYear() === dataSelecionada.getFullYear() &&
        d.getMonth() === dataSelecionada.getMonth() &&
        d.getDate() === dataSelecionada.getDate()
      );
    });
  }, [allUpcoming, dataSelecionada]);

  const past = useMemo(() => results.filter((evento) => evento.encerrado), [results]);

  useEffect(() => {
    setPaginaPróximos(1);
  }, [upcoming.length, itensPorPaginaPróximos]);

  useEffect(() => {
    setPaginaEncerrados(1);
  }, [past.length, itensPorPaginaEncerrados]);

  const paginaAtualPróximos = Math.min(
    paginaPróximos,
    Math.max(1, Math.ceil(upcoming.length / itensPorPaginaPróximos)),
  );
  const próximosPaginados = upcoming.slice(
    (paginaAtualPróximos - 1) * itensPorPaginaPróximos,
    paginaAtualPróximos * itensPorPaginaPróximos,
  );
  const paginaAtualEncerrados = Math.min(
    paginaEncerrados,
    Math.max(1, Math.ceil(past.length / itensPorPaginaEncerrados)),
  );
  const encerradosPaginados = past.slice(
    (paginaAtualEncerrados - 1) * itensPorPaginaEncerrados,
    paginaAtualEncerrados * itensPorPaginaEncerrados,
  );
  const categorias = Array.from(
    new Map(eventos.map((evento) => [evento.categoria.slug, evento.categoria.nome])).entries(),
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
        <div className="flex flex-col justify-center rounded-lg bg-secondary p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Cultura, comunidade e mais vida para Alvarães
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[0.95] text-primary sm:text-5xl">
            Programe-se em Alvarães
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground/75">
            Festas, festejos, encontros e programação cultural. Confira as datas, os locais e os
            detalhes dos próximos eventos da nossa cidade.
          </p>
          <div className="mt-6 h-px w-16 bg-primary" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Eventos que fortalecem nossa gente
          </p>
        </div>
        <div className="relative flex min-h-64 items-end overflow-hidden rounded-lg bg-[radial-gradient(circle_at_65%_28%,oklch(0.8_0.12_80),transparent_25%),linear-gradient(135deg,oklch(0.25_0.08_158),oklch(0.6_0.12_70))] p-5 text-white sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="relative">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Nossa cultura vive em encontros.
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Alvarães é feita de gente, histórias e eventos que aproximam a comunidade.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-black/30 px-3 py-2 text-xs">
              Praca Central de Alvarães
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
        <form onSubmit={(e) => { e.preventDefault(); setPaginaPróximos(1); setPaginaEncerrados(1); }} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center w-full">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
            <Search className="h-4 w-4 text-primary shrink-0" />
            <span className="sr-only">Buscar eventos</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar eventos em Alvarães..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setPaginaPróximos(1); setPaginaEncerrados(1); }}
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
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[{ slug: "Todas", nome: "Todos" }, ...categorias.map(([slug, nome]) => ({ slug, nome }))]
            .slice(0, 6)
            .map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategory(cat.slug)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                  category === cat.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/70 text-foreground/70 hover:border-primary"
                }`}
              >
                {cat.nome}
              </button>
            ))}
        </div>
        <span className="rounded-full border border-border bg-primary px-4 py-2 text-center text-[11px] font-semibold text-primary-foreground">
          Próximos eventos
        </span>
      </section>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_235px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-primary">
              {dataSelecionada
                ? `Eventos em ${dataSelecionada.toLocaleDateString("pt-BR")}`
                : "Próximos eventos"}
            </h2>
            {dataSelecionada ? (
              <button
                type="button"
                onClick={() => setDataSelecionada(null)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Limpar filtro
              </button>
            ) : (
              <span className="text-xs font-semibold text-primary">Ver todos os eventos -&gt;</span>
            )}
          </div>
          {carregando ? (
            <ListaSkeleton />
          ) : upcoming.length > 0 ? (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {próximosPaginados.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} />
                ))}
              </ul>
              <AppPagination
                totalItems={upcoming.length}
                page={paginaAtualPróximos}
                itemsPerPage={itensPorPaginaPróximos}
                onPageChange={setPaginaPróximos}
                onItemsPerPageChange={setItensPorPaginaPróximos}
                selectId="eventos-próximos-por-pagina"
              />
            </>
          ) : (
            <EmptyState>
              {dataSelecionada
                ? "Nenhum evento encontrado para esta data."
                : "Ainda nao ha eventos futuros publicados."}
            </EmptyState>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-secondary/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg text-primary">Destaques da agenda</h2>
              <span className="text-[10px] font-semibold text-primary">Ver todos -&gt;</span>
            </div>
            {allUpcoming.slice(0, 1).map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </section>
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="font-display text-lg text-primary">Calendário da cidade</h2>
            <Calendar
              events={allUpcoming}
              selectedDate={dataSelecionada}
              onSelectDate={setDataSelecionada}
            />
          </section>
          <section className="rounded-lg bg-secondary p-4">
            <h2 className="font-display text-lg text-primary">Explore Alvarães</h2>
            <p className="mt-1 text-xs text-foreground/70">
              Eventos que movimentam nossa cidade, fortalecem nossa cultura e aproximam as pessoas.
            </p>
          </section>
        </aside>
      </div>

      {past.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-primary">Eventos encerrados</h2>
          <ul className="mt-4 grid gap-4 opacity-75 sm:grid-cols-2 lg:grid-cols-3">
            {encerradosPaginados.map((evento) => (
              <EventoCard key={evento.id} evento={evento} past />
            ))}
          </ul>
          <AppPagination
            totalItems={past.length}
            page={paginaAtualEncerrados}
            itemsPerPage={itensPorPaginaEncerrados}
            onPageChange={setPaginaEncerrados}
            onItemsPerPageChange={setItensPorPaginaEncerrados}
            selectId="eventos-encerrados-por-pagina"
          />
        </section>
      )}

      <section className="flex flex-col gap-4 rounded-lg bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
            Sua iniciativa tambem faz Alvarães mais forte
          </p>
          <h2 className="font-display text-2xl">Divulgue seu evento no portal</h2>
          <p className="mt-1 text-sm text-primary-foreground/75">
            Se você representa uma instituição, associação ou faz parte da comunidade, envie seu
            evento.
          </p>
        </div>
        <a
          href="/contato"
          className="shrink-0 rounded-full bg-background px-5 py-3 text-center text-xs font-semibold text-primary"
        >
          Enviar meu evento -&gt;
        </a>
      </section>
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-56 rounded-xl bg-muted" />
      ))}
    </div>
  );
}
