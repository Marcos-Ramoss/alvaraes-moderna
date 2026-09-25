import { Link } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
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
  const contatoParaLink = (comercio.whatsapp || comercio.telefone || "").replace(/\D/g, "");
  const linkWhatsapp =
    contatoParaLink.length >= 8
      ? `https://wa.me/${contatoParaLink.length <= 11 ? `55${contatoParaLink}` : contatoParaLink}?text=${encodeURIComponent(`Olá! Vi o anúncio do ${comercio.nome} no portal Alvarães Conecta.`)}`
      : undefined;

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
        <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{comercio.endereço ?? comercio.area}</span>
          </p>
          {comercio.telefone && (
            <p className="flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0 text-primary/70" />
              <span>{comercio.telefone}</span>
            </p>
          )}
          {comercio.horários?.[0] && (
            <p className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0 text-primary/70" />
              <span>{comercio.horários[0]}</span>
            </p>
          )}
        </div>
        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
          {linkWhatsapp && (
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          {comercio.possuiPagina ? (
            <Link
              to="/comercios/$slug"
              params={{ slug: comercio.slug }}
              className="inline-flex min-h-[36px] items-center rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-secondary/80"
            >
              Ver detalhes →
            </Link>
          ) : (
            comercio.telefone && !linkWhatsapp && (
              <a
                href={`tel:${comercio.telefone.replace(/\D/g, "")}`}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-secondary/80"
              >
                <Phone className="size-3.5" />
                <span>Ligar</span>
              </a>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export function ComercioCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm animate-pulse">
      <div className="aspect-[16/9] w-full bg-muted" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="mt-auto pt-4 flex gap-2">
          <div className="h-8 w-24 rounded-full bg-muted" />
          <div className="h-8 w-24 rounded-full bg-muted" />
        </div>
      </div>
    </article>
  );
}


