import { Link } from "@tanstack/react-router";
import { DemoTag, Tag } from "@/components/ui-bits";
import { formatarDataPublica } from "@/modules/noticias";
import type { OportunidadePublica } from "../types/curso.types";

export function formatarModalidade(modalidade: OportunidadePublica["modalidade"]) {
  const labels = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Hibrido",
  };

  return labels[modalidade];
}

export function CursoCard({
  oportunidade,
  isClosed,
}: {
  oportunidade: OportunidadePublica;
  isClosed?: boolean;
}) {
  const imagemPrincipal = [...(oportunidade.imagens ?? [])].sort((a, b) => a.ordem - b.ordem)[0];
  const fechada = isClosed || oportunidade.encerrada;
  const isGratuito =
    oportunidade.custo &&
    (oportunidade.custo.toLowerCase().includes("gratuito") ||
      oportunidade.custo.toLowerCase().includes("gratis") ||
      oportunidade.custo.toLowerCase().includes("grátis") ||
      oportunidade.custo.toLowerCase().includes("0"));

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {imagemPrincipal && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
          <img
            src={imagemPrincipal.url}
            alt={imagemPrincipal.textoAlternativo ?? oportunidade.titulo}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
          {oportunidade.video && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
              Vídeo
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {fechada ? (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              Inscrições encerradas
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
              ✓ Inscrições abertas
            </span>
          )}
          <Tag>{formatarModalidade(oportunidade.modalidade)}</Tag>
          {isGratuito ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              Gratuito
            </span>
          ) : oportunidade.custo ? (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {oportunidade.custo}
            </span>
          ) : null}
          {oportunidade.demonstracao && <DemoTag />}
          {!imagemPrincipal && oportunidade.video && <Tag>Vídeo</Tag>}
        </div>
        <h2 className="mt-2.5 line-clamp-2 font-display text-base font-semibold leading-tight text-primary">
          {oportunidade.titulo}
        </h2>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {oportunidade.organizador}
        </p>
        <dl className="mt-3 space-y-1 text-xs text-foreground/80">
          {oportunidade.local && (
            <div>
              <dt className="inline font-semibold text-primary">Local: </dt>
              <dd className="inline">{oportunidade.local}</dd>
            </div>
          )}
          <div>
            <dt className="inline font-semibold text-primary">Prazo: </dt>
            <dd className="inline font-medium">{formatarDataPublica(oportunidade.prazo)}</dd>
          </div>
          {oportunidade.requisitos && (
            <div>
              <dt className="inline font-semibold text-primary">Requisitos: </dt>
              <dd className="line-clamp-2 inline text-muted-foreground">{oportunidade.requisitos}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto pt-4">
          <Link
            to="/cursos/$id"
            params={{ id: oportunidade.id }}
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver detalhes →
          </Link>
        </div>
      </div>
    </li>
  );
}

export function CursoCardSkeleton() {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm animate-pulse list-none">
      <div className="aspect-[16/9] w-full bg-muted" />
      <div className="flex flex-1 flex-col p-3.5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-24 rounded-full bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="space-y-1.5 pt-2">
          <div className="h-3 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="mt-auto pt-4">
          <div className="h-8 w-28 rounded-full bg-muted" />
        </div>
      </div>
    </li>
  );
}
