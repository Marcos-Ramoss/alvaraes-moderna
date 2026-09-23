import { createFileRoute } from "@tanstack/react-router";
import { NoticiasListaView, type NewsSearch } from "@/modules/noticias";

export const Route = createFileRoute("/noticias/")({
  validateSearch: (search: Record<string, unknown>): NewsSearch => {
    const categoria = search["categoria"];
    return typeof categoria === "string" ? { categoria } : {};
  },
  head: () => ({
    meta: [
      { title: "Notícias de Alvarães — Alvarães Moderna" },
      {
        name: "description",
        content:
          "Novidades, política e vida pública, cultura e comunidade: acompanhe as publicações do portal Alvarães Moderna.",
      },
      { property: "og:title", content: "Notícias de Alvarães — Alvarães Moderna" },
      {
        property: "og:description",
        content: "Publicações sobre a cidade de Alvarães, no Amazonas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: function NewsListPage() {
    const { categoria } = Route.useSearch();
    return <NoticiasListaView categoriaBusca={categoria} />;
  },
});
