import { Link } from "@tanstack/react-router";
import { MediaLightbox } from "@/components/media-lightbox";
import { DemoTag, PhotoPlaceholder, Tag } from "@/components/ui-bits";
import { formatarDataPublica } from "@/modules/noticias";
import { formatarModalidade } from "../components/curso-card";
import type { OportunidadePublica } from "../types/curso.types";

export function CursoDetalheView({
  curso,
}: {
  curso: OportunidadePublica;
}) {
  const imagens = (curso.imagens ?? [])
    .filter((midia) => midia.tipoMidia === "IMAGEM")
    .sort((a, c) => a.ordem - c.ordem);
  const imagemPrincipal = imagens[0];
  const videoEmbedUrl = getVídeoEmbedUrl(curso.video?.url);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/cursos" className="text-sm text-primary underline-offset-4 hover:underline">
        Voltar para oportunidades
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>{formatarModalidade(curso.modalidade)}</Tag>
        {curso.encerrada && <Tag>Inscrições encerradas</Tag>}
        {curso.demonstracao && <DemoTag />}
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold text-primary">{curso.titulo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Oferecido por {curso.organizador}
      </p>

      <div className="mt-6 space-y-3">
        {imagemPrincipal ? (
          <MediaLightbox
            images={imagens.map((imagem) => ({
              id: imagem.id,
              url: imagem.url,
              alt: imagem.textoAlternativo ?? curso.titulo,
            }))}
            title={curso.titulo}
          />
        ) : (
          <PhotoPlaceholder
            label="Espaço reservado - imagem do curso/oportunidade ainda não fornecida"
            className="aspect-[16/9]"
          />
        )}
      </div>

      {curso.video && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-black/5">
          {videoEmbedUrl ? (
            <iframe
              src={videoEmbedUrl}
              title={curso.video.titulo ?? `Vídeo de ${curso.titulo}`}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="p-4">
              <p className="text-sm font-medium">Vídeo de apresentação</p>
              <a
                href={curso.video.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-primary underline"
              >
                Abrir vídeo em uma nova aba
              </a>
            </div>
          )}
        </div>
      )}

      <section className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-primary">Informações importantes</h2>
        <dl className="mt-4 space-y-3 text-foreground/80">
          <div>
            <dt className="inline font-semibold">Prazo de inscrição: </dt>
            <dd className="inline">{formatarDataPublica(curso.prazo)}</dd>
          </div>
          {curso.local && (
            <div>
              <dt className="inline font-semibold">Local: </dt>
              <dd className="inline">{curso.local}</dd>
            </div>
          )}
          {curso.requisitos && (
            <div>
              <dt className="inline font-semibold">Requisitos: </dt>
              <dd className="inline">{curso.requisitos}</dd>
            </div>
          )}
          {curso.custo && (
            <div>
              <dt className="inline font-semibold">Custo/Investimento: </dt>
              <dd className="inline">{curso.custo}</dd>
            </div>
          )}
        </dl>
        
        {curso.linkInscrição && !curso.encerrada && (
          <div className="mt-6 border-t border-border pt-6 text-center">
            <a
              href={curso.linkInscrição}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Acessar site de inscrição
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function getVídeoEmbedUrl(url?: string) {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "").toLowerCase();
    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId =
        parsedUrl.searchParams.get("v") ??
        parsedUrl.pathname.split("/").filter(Boolean).at(-1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (hostname === "vimeo.com") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

