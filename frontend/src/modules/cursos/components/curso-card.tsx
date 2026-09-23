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

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {imagemPrincipal && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
          <img
            src={imagemPrincipal.url}
            alt={imagemPrincipal.textoAlternativo ?? oportunidade.titulo}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {oportunidade.video && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
              Vídeo
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-wrap gap-1.5">
          <Tag>{formatarModalidade(oportunidade.modalidade)}</Tag>
          {isClosed && <Tag>Inscrições encerradas</Tag>}
          {oportunidade.demonstracao && <DemoTag />}
          {!imagemPrincipal && oportunidade.video && <Tag>Vídeo</Tag>}
        </div>
        <h2 className="mt-2 line-clamp-2 font-display text-base font-semibold leading-tight text-primary">
          {oportunidade.titulo}
        </h2>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {oportunidade.organizador}
        </p>
        <dl className="mt-3 space-y-1 text-xs text-foreground/80">
          {oportunidade.local && (
            <div>
              <dt className="inline font-semibold">Local: </dt>
              <dd className="inline">{oportunidade.local}</dd>
            </div>
          )}
          <div>
            <dt className="inline font-semibold">Prazo: </dt>
            <dd className="inline">{formatarDataPublica(oportunidade.prazo)}</dd>
          </div>
          {oportunidade.requisitos && (
            <div>
              <dt className="inline font-semibold">Requisitos: </dt>
              <dd className="line-clamp-2 inline">{oportunidade.requisitos}</dd>
            </div>
          )}
          {oportunidade.custo && (
            <div>
              <dt className="inline font-semibold">Custo: </dt>
              <dd className="inline">{oportunidade.custo}</dd>
            </div>
          )}
        </dl>
        <Link
          to="/cursos/$id"
          params={{ id: oportunidade.id }}
          className="mt-auto inline-flex w-fit rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Ver detalhes -&gt;
        </Link>
      </div>
    </li>
  );
}
