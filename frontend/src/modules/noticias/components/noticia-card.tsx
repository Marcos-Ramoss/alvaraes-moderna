import { Link } from "@tanstack/react-router";
import { Heart, MessageSquare } from "lucide-react";
import { DemoTag, PhotoPlaceholder, Tag } from "@/components/ui-bits";
import { formatarDataPublica } from "../api/noticias.api";
import type { NoticiaPublica } from "../types/noticia.types";

export function NoticiaCard({ noticia }: { noticia: NoticiaPublica }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Link to="/noticias/$slug" params={{ slug: noticia.slug }}>
        {noticia.imagemUrl ? (
          <img
            src={noticia.imagemUrl}
            alt={noticia.imagemAlt ?? noticia.titulo}
            className="aspect-[16/9] w-full object-cover transition-transform hover:scale-[1.02]"
          />
        ) : (
          <PhotoPlaceholder
            label={noticia.imagemAlt ?? "Espaço reservado - fotografia local ainda não fornecida"}
            className="aspect-[16/9] rounded-none"
          />
        )}
      </Link>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          <Tag>{noticia.categoria.nome}</Tag>
          {noticia.tipoConteudo === "OPINIAO" && <Tag>Opinião</Tag>}
          {noticia.demonstracao && <DemoTag />}
        </div>
        <h3 className="mt-2 font-display text-base leading-tight text-primary">
          <Link to="/noticias/$slug" params={{ slug: noticia.slug }} className="hover:text-primary/75">
            {noticia.titulo}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/70">
          {noticia.resumo}
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}</span>
          <div className="flex gap-3">
            {(noticia.totalCurtidas ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="size-3" />
                {noticia.totalCurtidas}
              </span>
            )}
            {(noticia.totalComentarios ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {noticia.totalComentarios}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

