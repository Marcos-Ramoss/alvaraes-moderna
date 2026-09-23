import { Link } from "@tanstack/react-router";
import { Tag } from "@/components/ui-bits";
import type { ComercioPublico } from "../types/comercio.types";

export function obterImagemPrincipal(comercio: ComercioPublico) {
  return [...(comercio.imagens ?? [])]
    .filter((midia) => midia.tipoMidia === "IMAGEM")
    .sort((a, b) => a.ordem - b.ordem)[0];
}

export function ComercioMiniCard({ comercio }: { comercio: ComercioPublico }) {
  const imagemPrincipal = obterImagemPrincipal(comercio);

  return (
    <Link to="/comercios/$slug" params={{ slug: comercio.slug }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-sm">
      <div className="size-20 shrink-0 overflow-hidden rounded-md bg-primary/10">
        {imagemPrincipal ? (
          <img src={imagemPrincipal.url} alt={imagemPrincipal.textoAlternativo ?? comercio.nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-primary">⌂</div>
        )}
      </div>
      <div className="min-w-0">
        <Tag>{comercio.categoria.nome}</Tag>
        <h3 className="mt-1 truncate font-display text-sm text-primary">{comercio.nome}</h3>
        <p className="truncate text-[11px] text-muted-foreground">{comercio.area}</p>
      </div>
      <span className="ml-auto text-primary">›</span>
    </Link>
  );
}

export function ComercioCard({ comercio }: { comercio: ComercioPublico }) {
  const imagemPrincipal = obterImagemPrincipal(comercio);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Link to="/comercios/$slug" params={{ slug: comercio.slug }} className="relative block aspect-[16/9] shrink-0 overflow-hidden bg-primary/10">
        {imagemPrincipal ? (
          <img src={imagemPrincipal.url} alt={imagemPrincipal.textoAlternativo ?? comercio.nome} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-primary">⌂</div>
        )}
        {comercio.video && <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">Vídeo</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-h-7 flex-wrap content-start gap-2">
          <Tag>{comercio.categoria.nome}</Tag>
          {comercio.patrocinado && <Tag>Patrocinado</Tag>}
        </div>
        <h3 className="mt-3 min-h-11 font-display text-lg leading-tight text-primary">
          <Link to="/comercios/$slug" params={{ slug: comercio.slug }}>{comercio.nome}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-relaxed text-foreground/70">{comercio.descrição ?? comercio.area}</p>
        <div className="mt-4 space-y-1 text-[11px] text-muted-foreground">
          <p>⌖ {comercio.endereço ?? comercio.area}</p>
          {comercio.telefone && <p>◉ {comercio.telefone}</p>}
          {comercio.horários?.[0] && <p>◷ {comercio.horários[0]}</p>}
        </div>
        <div className="mt-auto pt-4">
          {comercio.possuiPagina && <Link to="/comercios/$slug" params={{ slug: comercio.slug }} className="inline-flex rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-primary">Ver detalhes →</Link>}
        </div>
      </div>
    </article>
  );
}

