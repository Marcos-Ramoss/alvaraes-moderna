import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { AppPagination } from "@/components/app-pagination";
import { EmptyState } from "@/components/ui-bits";
import { cursosApi } from "../api/cursos.api";
import type { OportunidadePublica } from "../types/curso.types";
import { CursoCard, CursoCardSkeleton } from "../components/curso-card";

const ITENS_POR_PAGINA_INICIAL = 6;

export function CursosListaView() {
  const [query, setQuery] = useState("");
  const [buscaSubmetida, setBuscaSubmetida] = useState("");
  
  const [open, setOpen] = useState<OportunidadePublica[]>([]);
  const [totalOpen, setTotalOpen] = useState(0);
  const [carregandoOpen, setCarregandoOpen] = useState(true);
  const [erroOpen, setErroOpen] = useState("");
  const [paginaAbertas, setPaginaAbertas] = useState(1);
  const [itensPorPaginaAbertas, setItensPorPaginaAbertas] = useState(ITENS_POR_PAGINA_INICIAL);
  
  const [closed, setClosed] = useState<OportunidadePublica[]>([]);
  const [totalClosed, setTotalClosed] = useState(0);
  const [carregandoClosed, setCarregandoClosed] = useState(true);
  const [erroClosed, setErroClosed] = useState("");
  const [paginaEncerradas, setPaginaEncerradas] = useState(1);
  const [itensPorPaginaEncerradas, setItensPorPaginaEncerradas] = useState(ITENS_POR_PAGINA_INICIAL);

  const openSectionRef = useRef<HTMLElement>(null);
  const mudouPaginaAbertasRef = useRef(false);

  const mudarPaginaAbertas = (novaPagina: number) => {
    mudouPaginaAbertasRef.current = true;
    setPaginaAbertas(novaPagina);
  };

  useEffect(() => {
    setCarregandoOpen(true);
    setErroOpen("");
    cursosApi
      .listarOportunidades({ pagina: paginaAbertas, limite: itensPorPaginaAbertas, busca: buscaSubmetida, situacao: "ABERTA" })
      .then((res) => {
        setOpen(res.dados);
        setTotalOpen(res.total);
        if (mudouPaginaAbertasRef.current) {
          mudouPaginaAbertasRef.current = false;
          setTimeout(() => {
            openSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
      })
      .catch((error) => setErroOpen(error instanceof Error ? error.message : "Erro."))
      .finally(() => setCarregandoOpen(false));
  }, [paginaAbertas, itensPorPaginaAbertas, buscaSubmetida]);

  useEffect(() => {
    setCarregandoClosed(true);
    setErroClosed("");
    cursosApi
      .listarOportunidades({ pagina: paginaEncerradas, limite: itensPorPaginaEncerradas, busca: buscaSubmetida, situacao: "ENCERRADA" })
      .then((res) => {
        setClosed(res.dados);
        setTotalClosed(res.total);
      })
      .catch((error) => setErroClosed(error instanceof Error ? error.message : "Erro."))
      .finally(() => setCarregandoClosed(false));
  }, [paginaEncerradas, itensPorPaginaEncerradas, buscaSubmetida]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          Educacao e vagas
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary sm:text-4xl">
          Cursos e oportunidades
        </h1>
        <p className="mt-2 max-w-2xl text-foreground/80">
          Encontre novas possibilidades para aprender e trabalhar. Confira cursos, vagas e inscrições,
          com prazos e orientações para participar.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
        <form onSubmit={(e) => { e.preventDefault(); setBuscaSubmetida(query); setPaginaAbertas(1); setPaginaEncerradas(1); }} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center w-full">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
            <Search className="h-4 w-4 text-primary shrink-0" />
            <span className="sr-only">Buscar oportunidades</span>
            <input
              id="busca-cursos"
              name="busca-cursos"
              autoComplete="off"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou tipo de vaga..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setBuscaSubmetida(''); setPaginaAbertas(1); setPaginaEncerradas(1); }}
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
      </section>

      {(erroOpen || erroClosed) && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erroOpen || erroClosed}</p>}

      <section id="cursos-abertos" ref={openSectionRef} className="scroll-mt-24 min-h-[480px]">
        <h2 className="font-display text-2xl font-semibold">Inscrições abertas</h2>
        {carregandoOpen ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CursoCardSkeleton key={index} />
            ))}
          </ul>
        ) : totalOpen > 0 ? (
          <>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {open.map((oportunidade) => (
                <CursoCard key={oportunidade.id} oportunidade={oportunidade} />
              ))}
            </ul>
            <div className="mt-8">
              <AppPagination
                totalItems={totalOpen}
                page={paginaAbertas}
                itemsPerPage={itensPorPaginaAbertas}
                onPageChange={mudarPaginaAbertas}
                onItemsPerPageChange={setItensPorPaginaAbertas}
                selectId="cursos-abertos-por-pagina"
              />
            </div>
          </>
        ) : (
          <div className="mt-4">
            <EmptyState>Nenhuma oportunidade com inscrições abertas no momento.</EmptyState>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Encerradas</h2>
        {carregandoClosed ? (
          <ul className="mt-4 grid gap-4 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <CursoCardSkeleton key={index} />
            ))}
          </ul>
        ) : totalClosed > 0 ? (
          <>
            <ul className="mt-4 grid gap-4 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
              {closed.map((oportunidade) => (
                <CursoCard key={oportunidade.id} oportunidade={oportunidade} isClosed />
              ))}
            </ul>
            <div className="mt-8">
              <AppPagination
                totalItems={totalClosed}
                page={paginaEncerradas}
                itemsPerPage={itensPorPaginaEncerradas}
                onPageChange={setPaginaEncerradas}
                onItemsPerPageChange={setItensPorPaginaEncerradas}
                selectId="cursos-encerrados-por-pagina"
              />
            </div>
          </>
        ) : (
          <div className="mt-4">
            <EmptyState>Nenhum registro encerrado.</EmptyState>
          </div>
        )}
      </section>
    </div>
  );
}
