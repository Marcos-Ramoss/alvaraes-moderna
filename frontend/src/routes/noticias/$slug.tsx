import { createFileRoute, notFound } from "@tanstack/react-router";
import { NoticiaDetalheView, noticiasApi } from "@/modules/noticias";

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ params }) => {
    try {
      const [article, noticias] = await Promise.all([
        noticiasApi.buscarPorSlug(params.slug),
        noticiasApi.listar(),
      ]);
      const related = noticias.dados
        .filter((noticia) => noticia.slug !== article.slug)
        .sort((a, b) => (a.categoria.slug === article.categoria.slug ? -1 : 1))
        .slice(0, 3);

      return { article, related };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Publicação não encontrada - Alvarães Moderna" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.titulo} - Alvarães Moderna` },
        { name: "description", content: article.resumo },
        { property: "og:title", content: article.titulo },
        { property: "og:description", content: article.resumo },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: function ArticlePage() {
    const { article, related } = Route.useLoaderData();
    return <NoticiaDetalheView article={article} related={related} />;
  },
});
