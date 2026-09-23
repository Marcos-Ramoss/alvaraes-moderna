import { useEffect, useState } from "react";
import { Loader2, Store, Calendar, GraduationCap, Newspaper } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

// APIs
import { noticiasApi, formatarDataPublica } from "@/modules/noticias/api/noticias.api";
import { comerciosApi } from "@/modules/comercios/api/comercios.api";
import { eventosApi } from "@/modules/eventos/api/eventos.api";
import { cursosApi } from "@/modules/cursos/api/cursos.api";

// Types
import type { NoticiaPublica } from "@/modules/noticias/types/noticia.types";
import type { ComercioPublico } from "@/modules/comercios/types/comercio.types";
import type { EventoPublico } from "@/modules/eventos/types/evento.types";
import type { OportunidadePublica } from "@/modules/cursos/types/curso.types";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Results
  const [noticias, setNoticias] = useState<NoticiaPublica[]>([]);
  const [comercios, setComercios] = useState<ComercioPublico[]>([]);
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [cursos, setCursos] = useState<OportunidadePublica[]>([]);
  
  const hasResults = noticias.length > 0 || comercios.length > 0 || eventos.length > 0 || cursos.length > 0;

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setNoticias([]);
      setComercios([]);
      setEventos([]);
      setCursos([]);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const [resNoticias, resComercios, resEventos, resCursos] = await Promise.allSettled([
          noticiasApi.listar({ busca: query, limite: 3 }),
          comerciosApi.listar({ busca: query, limite: 3 }),
          eventosApi.listar({ busca: query, limite: 3 }),
          cursosApi.listarOportunidades({ busca: query, limite: 3 })
        ]);

        setNoticias(resNoticias.status === "fulfilled" ? resNoticias.value.dados : []);
        setComercios(resComercios.status === "fulfilled" ? resComercios.value.dados : []);
        setEventos(resEventos.status === "fulfilled" ? resEventos.value : []);
        setCursos(resCursos.status === "fulfilled" ? resCursos.value.dados : []);
        
      } catch (error) {
        console.error("Erro na busca global:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Reset query on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setNoticias([]);
      setComercios([]);
      setEventos([]);
      setCursos([]);
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput 
        placeholder="Buscar notícias, comércios, eventos..."
        value={query} 
        onValueChange={setQuery} 
      />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </div>
          ) : query.trim().length > 1 ? (
            "Nenhum resultado encontrado."
          ) : (
            "Digite algo para pesquisar."
          )}
        </CommandEmpty>
        
        {!loading && hasResults && (
          <>
            {/* NOTICIAS */}
            {noticias.length > 0 && (
              <CommandGroup heading="Notícias">
                {noticias.map((noticia) => (
                  <CommandItem 
                    key={noticia.id} 
                    onSelect={() => {
                      onOpenChange(false);
                      navigate({ to: "/noticias/$slug", params: { slug: noticia.slug } });
                    }}
                    className="flex cursor-pointer items-start gap-4 p-3"
                  >
                    {noticia.imagemUrl ? (
                      <img 
                        src={noticia.imagemUrl} 
                        alt={noticia.titulo}
                        className="h-14 w-20 shrink-0 rounded-md object-cover border border-border/50"
                      />
                    ) : (
                      <div className="h-14 w-20 shrink-0 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground border border-border/50">
                        <Newspaper className="size-4" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="font-medium line-clamp-1">{noticia.titulo}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {noticia.resumo}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {formatarDataPublica(noticia.publicadoEm)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* COMERCIOS */}
            {comercios.length > 0 && (
              <>
                {noticias.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Comércios">
                  {comercios.map((comercio) => (
                    <CommandItem 
                      key={comercio.id} 
                      onSelect={() => {
                        onOpenChange(false);
                        navigate({ to: "/comercios/$slug", params: { slug: comercio.slug } });
                      }}
                      className="flex cursor-pointer items-center gap-3 p-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Store className="size-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium line-clamp-1">{comercio.nome}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {comercio.area}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* EVENTOS */}
            {eventos.length > 0 && (
              <>
                {(noticias.length > 0 || comercios.length > 0) && <CommandSeparator />}
                <CommandGroup heading="Eventos">
                  {eventos.map((evento) => (
                    <CommandItem 
                      key={evento.id} 
                      onSelect={() => {
                        onOpenChange(false);
                        navigate({ to: "/agenda/$id", params: { id: evento.id } });
                      }}
                      className="flex cursor-pointer items-center gap-3 p-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <Calendar className="size-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium line-clamp-1">{evento.titulo}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {evento.local}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* CURSOS / OPORTUNIDADES */}
            {cursos.length > 0 && (
              <>
                {(noticias.length > 0 || comercios.length > 0 || eventos.length > 0) && <CommandSeparator />}
                <CommandGroup heading="Cursos e Oportunidades">
                  {cursos.map((curso) => (
                    <CommandItem 
                      key={curso.id} 
                      onSelect={() => {
                        onOpenChange(false);
                        navigate({ to: "/cursos/$id", params: { id: curso.id } });
                      }}
                      className="flex cursor-pointer items-center gap-3 p-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <GraduationCap className="size-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium line-clamp-1">{curso.titulo}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {curso.organizador}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
