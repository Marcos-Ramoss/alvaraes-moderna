import { Link } from "@tanstack/react-router";
import { MediaLightbox } from "@/components/media-lightbox";
import { DemoTag, PhotoPlaceholder, Tag } from "@/components/ui-bits";
import { comerciosApi } from "../api/comercios.api";

export function ComercioDetalheView({
  business: b,
}: {
  business: Awaited<ReturnType<typeof comerciosApi.buscarPorSlug>>;
}) {
  const semContato = !b.endereço && !b.telefone && !b.whatsapp && !b.redesSociais?.length && !b.siteExterno;
  const imagens = (b.imagens ?? [])
    .filter((midia) => midia.tipoMidia === "IMAGEM")
    .sort((a, c) => a.ordem - c.ordem);
  const imagemPrincipal = imagens[0];
  const videoEmbedUrl = getVídeoEmbedUrl(b.video?.url);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/comercios" className="text-sm text-primary underline-offset-4 hover:underline">
        Voltar para o guia comercial
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>{b.categoria.nome}</Tag>
        {b.patrocinado && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Destaque patrocinado
          </span>
        )}
        {b.demonstracao && <DemoTag />}
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold text-primary">{b.nome}</h1>
      {b.descrição && <p className="mt-3 text-lg text-foreground/80">{b.descrição}</p>}

      <div className="mt-6 space-y-3">
        {imagemPrincipal ? <MediaLightbox images={imagens.map((imagem) => ({ id: imagem.id, url: imagem.url, alt: imagem.textoAlternativo ?? b.nome }))} title={b.nome} /> : <PhotoPlaceholder label="Espaço reservado - fotografia do comércio ainda não fornecida" className="aspect-[16/9]" />}
      </div>

      {b.video && <div className="mt-6 overflow-hidden rounded-xl border border-border bg-black/5">{videoEmbedUrl ? <iframe src={videoEmbedUrl} title={b.video.titulo ?? `Vídeo de ${b.nome}`} className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="p-4"><p className="text-sm font-medium">Vídeo do comércio</p><a href={b.video.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary underline">Abrir vídeo em uma nova aba</a></div>}</div>}

      {b.serviços && b.serviços.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Produtos e serviços</h2>
          <ul className="mt-2 list-disc pl-5 text-foreground/80">
            {b.serviços.map((serviço) => (
              <li key={serviço}>{serviço}</li>
            ))}
          </ul>
        </section>
      )}

      {b.horários && b.horários.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Horários informados</h2>
          <ul className="mt-2 text-foreground/80">
            {b.horários.map((horario) => (
              <li key={horario}>{horario}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-xl bg-secondary p-5">
        <h2 className="font-display text-xl font-semibold">Contato e localização</h2>
        <ul className="mt-2 space-y-1 text-foreground/80">
          {b.endereço && <li>Endereço: {b.endereço}</li>}
          {b.telefone && <li>Telefone: {b.telefone}</li>}
          {b.whatsapp && (
            <li>
              <a
                className="text-primary underline"
                href={`https://wa.me/${b.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
          )}
          {b.redesSociais?.map((rede) => (
            <li key={rede.url}>
              <a
                className="text-primary underline"
                href={rede.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {rede.label}
              </a>
            </li>
          ))}
          {b.siteExterno && (
            <li>
              <a
                className="text-primary underline"
                href={b.siteExterno}
                target="_blank"
                rel="noopener noreferrer"
              >
                Site do estabelecimento
              </a>
            </li>
          )}
          {semContato && (
            <li className="text-sm text-muted-foreground">
              Nenhum contato informado até o momento.
            </li>
          )}
        </ul>
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
      const videoId = parsedUrl.searchParams.get("v") ?? parsedUrl.pathname.split("/").filter(Boolean).at(-1);
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

