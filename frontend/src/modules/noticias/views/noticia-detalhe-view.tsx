import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MediaLightbox } from "@/components/media-lightbox";
import { DemoTag, PhotoPlaceholder, Tag } from "@/components/ui-bits";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { formatarDataPublica, noticiasApi } from "../api/noticias.api";

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
        parsedUrl.pathname.split("/").filter(Boolean).at(1) ??
        parsedUrl.pathname.split("/").filter(Boolean).at(0);

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname === "vimeo.com") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function NoticiaDetalheView({
  article,
  related,
}: {
  article: Awaited<ReturnType<typeof noticiasApi.buscarPorSlug>>;
  related: Awaited<ReturnType<typeof noticiasApi.listar>>['dados'];
}) {
  const [copied, setCopied] = useState(false);
  const videoEmbedUrl = getVídeoEmbedUrl(article.video?.url);
  const imagensDaNoticia = (
    article.imagens && article.imagens.length > 0
      ? [...article.imagens]
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((imagem) => ({
            id: imagem.id,
            url: imagem.url,
            ...(imagem.textoAlternativo ? { textoAlternativo: imagem.textoAlternativo } : {}),
            ordem: imagem.ordem,
          }))
      : article.imagemUrl
        ? [{ id: article.slug, url: article.imagemUrl, ordem: 0 }]
        : []
  ) as Array<{
    id: string;
    url: string;
    textoAlternativo?: string;
    ordem: number;
  }>;
  const imagemPrincipal = imagensDaNoticia[0];

  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`${article.titulo} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  const copy = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">⌂</Link><span>›</span>
        <Link to="/noticias" search={{}} className="hover:text-primary">Notícias</Link><span>›</span>
        <span>{article.categoria.nome}</span><span>›</span><span className="truncate">{article.titulo}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <article className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Tag>{article.categoria.nome}</Tag>
            {article.tipoConteúdo === "OPINIAO" && <Tag>Opinião</Tag>}
            {article.tipoConteúdo === "PATROCINADO" && <Tag>Conteúdo patrocinado</Tag>}
            {article.demonstracao && <DemoTag />}
          </div>

          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[0.98] text-primary sm:text-5xl lg:text-6xl">
            {article.titulo}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-snug text-foreground/75 sm:text-xl">
            {article.resumo}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-border pb-4 text-xs text-muted-foreground">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">AM</span>
            <span><strong className="text-foreground">Por {article.autorNome}</strong><br />{formatarDataPublica(article.publicadoEm ?? article.criadoEm)}</span>
            {article.alteradoEm && <span>· Atualizado em {formatarDataPublica(article.alteradoEm)}</span>}
            <span className="ml-auto">◉ 1,2 mil　▢ 12</span>
          </div>

          <div className="mt-5 space-y-3">
            {imagemPrincipal ? <MediaLightbox images={imagensDaNoticia.map((imagem) => ({ id: imagem.id, url: imagem.url, alt: imagem.textoAlternativo ?? article.imagemAlt ?? article.titulo }))} title={article.titulo} /> : <PhotoPlaceholder label={article.imagemAlt ?? "Espaço reservado - fotografia local"} />}
            {article.imagemCredito && <p className="text-[11px] text-muted-foreground">▧ {article.imagemCredito}</p>}
          </div>

          {article.video && <div className="mt-6 overflow-hidden rounded-lg border border-border bg-black/5">{videoEmbedUrl ? <iframe src={videoEmbedUrl} title={article.video.titulo ?? article.titulo} className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="p-4"><p className="text-sm font-medium">Vídeo da matéria</p><a href={article.video.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary underline">Abrir vídeo em uma nova aba</a></div>}</div>}

          <div className="mt-7 max-w-3xl space-y-5 font-display text-lg leading-relaxed text-foreground/90 sm:text-xl">
            {(article.corpo ?? []).map((paragrafo, index) => index === 0 ? <p key={paragrafo}><span className="float-left mr-2 text-6xl leading-[0.75] text-primary">{paragrafo.charAt(0)}</span>{paragrafo.slice(1)}</p> : <p key={paragrafo}>{paragrafo}</p>)}
          </div>

          {article.fontes && article.fontes.length > 0 && <section className="mt-8 rounded-lg bg-secondary p-4"><h2 className="font-display text-lg font-semibold text-primary">Fontes</h2><ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">{article.fontes.map((fonte) => <li key={fonte}>{fonte}</li>)}</ul></section>}

          <div className="mt-8 flex items-center justify-between border-y border-border py-4">
            <div>
              <p className="mb-3 text-sm font-semibold text-primary">Compartilhe esta noticia</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={share} className="rounded-full bg-[#20a85a] px-4 py-2 text-xs font-semibold text-white">WhatsApp</button>
                <button type="button" onClick={copy} className="rounded-full border border-border px-4 py-2 text-xs font-semibold">{copied ? "Link copiado" : "Copiar link"}</button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-primary text-right">Gostou?</p>
              <LikeButton entidadeTipo="NOTICIA" entidadeId={article.id} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-card p-4"><div><strong className="font-display text-base text-primary">Redacao Alvaraes Moderna</strong><p className="text-xs text-muted-foreground">Noticias que conectam a nossa cidade.</p></div><span className="flex size-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">AM</span></div>

          <CommentSection entidadeTipo="NOTICIA" entidadeId={article.id} />

          {related.length > 0 && <section className="mt-8"><h2 className="font-display text-2xl text-primary">Notícias relacionadas</h2><div className="mt-3 grid gap-4 sm:grid-cols-3">{related.map((noticia) => <Link key={noticia.slug} to="/noticias/$slug" params={{ slug: noticia.slug }} className="overflow-hidden rounded-lg border border-border bg-card hover:border-primary">{noticia.imagemUrl ? <img src={noticia.imagemUrl} alt={noticia.titulo} className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] bg-secondary" />}<div className="p-3"><Tag>{noticia.categoria.nome}</Tag><h3 className="mt-2 font-display text-base leading-tight text-primary">{noticia.titulo}</h3><p className="mt-2 text-[11px] text-muted-foreground">{formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}</p></div></Link>)}</div></section>}
        </article>

        <ArticleSidebar article={article} related={related} />
      </div>
    </div>
  );
}

function ArticleSidebar({ article, related }: { article: Awaited<ReturnType<typeof noticiasApi.buscarPorSlug>>; related: Awaited<ReturnType<typeof noticiasApi.listar>>['dados'] }) {
  const ranking = related.slice(0, 5);
  const adImage = related.find((noticia) => noticia.imagemUrl)?.imagemUrl;

  return <aside className="space-y-4 lg:sticky lg:top-24">
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="mb-2 flex items-center justify-between"><h2 className="font-display text-2xl text-primary">Mais lidas</h2><Link to="/noticias" search={{}} className="text-xs font-semibold text-primary">Ver todas →</Link></div><div className="divide-y divide-border">{ranking.map((noticia, index) => <Link key={noticia.slug} to="/noticias/$slug" params={{ slug: noticia.slug }} className="flex gap-3 py-3"><span className="font-display text-xl text-primary">{String(index + 1).padStart(2, "0")}</span>{noticia.imagemUrl && <img src={noticia.imagemUrl} alt="" className="size-12 shrink-0 rounded object-cover" />}<span className="min-w-0"><strong className="block font-display text-sm leading-tight text-primary">{noticia.titulo}</strong><small className="text-[10px] text-muted-foreground">{formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}</small></span></Link>)}</div></section>
    <section className="rounded-lg bg-secondary p-5"><p className="text-2xl">✉</p><h2 className="mt-2 font-display text-xl text-primary">Receba as principais noticias no seu e-mail</h2><p className="mt-2 text-sm text-foreground/70">Fique por dentro do que acontece em Alvarães.</p><Link to="/boletim" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Quero receber →</Link></section>
    {adImage && <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"><p className="p-3 pb-0 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Publicidade</p><img src={adImage} alt="" className="mt-2 aspect-[16/9] w-full object-cover" /><div className="p-4"><h2 className="font-display text-xl text-primary">Valorize o que é nosso.</h2><p className="mt-1 text-sm text-muted-foreground">Anuncie no Alvarães Moderna.</p><Link to="/anuncie" className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Anuncie agora →</Link></div></section>}
    <section className="rounded-lg border border-border bg-card p-4"><div className="flex items-center justify-between"><h2 className="font-display text-xl text-primary">Agenda de eventos</h2><Link to="/agenda" className="text-xs font-semibold text-primary">Ver agenda →</Link></div><div className="mt-3 space-y-2"><div className="rounded border border-border p-3 text-sm"><strong>12 SET</strong><span className="ml-3">Feira de produtores locais</span></div><div className="rounded border border-border p-3 text-sm"><strong>20 SET</strong><span className="ml-3">Festival cultural</span></div><div className="rounded border border-border p-3 text-sm"><strong>28 SET</strong><span className="ml-3">Campeonato municipal</span></div></div></section>
    <section className="rounded-lg bg-primary p-5 text-primary-foreground"><h2 className="font-display text-2xl">Alvarães Moderna</h2><p className="mt-2 text-sm text-primary-foreground/80">Histórias que conectam a nossa gente.</p><Link to="/sobre" className="mt-4 inline-flex rounded-full bg-background px-4 py-2 text-xs font-semibold text-primary">Conheça o portal →</Link></section>
  </aside>;
}
