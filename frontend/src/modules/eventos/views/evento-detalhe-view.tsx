import { Link } from "@tanstack/react-router";
import { MediaLightbox } from "@/components/media-lightbox";
import { DemoTag, PhotoPlaceholder, Tag } from "@/components/ui-bits";
import { eventosApi } from "../api/eventos.api";
import { formatarDataPublica } from "@/modules/noticias";

export function EventoDetalheView({
  evento,
}: {
  evento: Awaited<ReturnType<typeof eventosApi.buscarPorId>>;
}) {
  const imagens = (evento.imagens ?? [])
    .filter((midia) => midia.tipoMidia === "IMAGEM")
    .sort((a, c) => a.ordem - c.ordem);
  const imagemPrincipal = imagens[0];
  const videoEmbedUrl = getVídeoEmbedUrl(evento.video?.url);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/agenda" className="text-sm text-primary underline-offset-4 hover:underline">
        Voltar para a agenda
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>{evento.categoria.nome}</Tag>
        {evento.encerrado && <Tag>Encerrado</Tag>}
        {evento.demonstracao && <DemoTag />}
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold text-primary">{evento.titulo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Organizado por {evento.organizador}
      </p>

      {evento.descrição && <p className="mt-4 text-lg text-foreground/80">{evento.descrição}</p>}

      <div className="mt-6 space-y-3">
        {imagemPrincipal ? (
          <MediaLightbox
            images={imagens.map((imagem) => ({
              id: imagem.id,
              url: imagem.url,
              alt: imagem.textoAlternativo ?? evento.titulo,
            }))}
            title={evento.titulo}
          />
        ) : (
          <PhotoPlaceholder
            label="Espaço reservado - imagem do evento ainda não fornecida"
            className="aspect-[16/9]"
          />
        )}
      </div>

      {evento.video && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-black/5">
          {videoEmbedUrl ? (
            <iframe
              src={videoEmbedUrl}
              title={evento.video.titulo ?? `Vídeo de ${evento.titulo}`}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="p-4">
              <p className="text-sm font-medium">Vídeo do evento</p>
              <a
                href={evento.video.url}
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
        <h2 className="font-display text-xl font-semibold text-primary">Detalhes</h2>
        <dl className="mt-4 space-y-3 text-foreground/80">
          <div>
            <dt className="inline font-semibold">Data: </dt>
            <dd className="inline">{formatarDataPublica(evento.data)}</dd>
          </div>
          {evento.horario && (
            <div>
              <dt className="inline font-semibold">Horário: </dt>
              <dd className="inline">{evento.horario}</dd>
            </div>
          )}
          <div>
            <dt className="inline font-semibold">Local: </dt>
            <dd className="inline">{evento.local}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Entrada: </dt>
            <dd className="inline">{evento.entrada}</dd>
          </div>
          {evento.contato && (
            <div>
              <dt className="inline font-semibold">Contato: </dt>
              <dd className="inline">{evento.contato}</dd>
            </div>
          )}
          {evento.fonte && (
            <div>
              <dt className="inline font-semibold">Fonte/Referência: </dt>
              <dd className="inline break-words">
                <a
                  href={evento.fonte}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {evento.fonte}
                </a>
              </dd>
            </div>
          )}
        </dl>
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

