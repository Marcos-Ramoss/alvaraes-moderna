import { createFileRoute, notFound } from "@tanstack/react-router";
import { ComercioDetalheView, comerciosApi } from "@/modules/comercios";

export const Route = createFileRoute("/comercios/$slug")({
  loader: async ({ params }) => {
    try {
      const { slug } = params;
      const [comercioRes, comercios] = await Promise.all([
        comerciosApi.buscarPorSlug(slug),
        comerciosApi.listar({ limite: 10 }), // Pega alguns para sugerir relacionados
      ]);

      if (!comercioRes.possuiPagina) throw notFound();

      const related = comercios.dados
        .filter(
          (c) =>
            c.slug !== comercioRes.slug &&
            c.categoria.id === comercioRes.categoria.id,
        )
        .slice(0, 3);

      return { business: comercioRes, related };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Estabelecimento não encontrado - Alvarães Moderna" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const { business } = loaderData;
    const desc =
      business.descricao ??
      `${business.nome} - ${business.categoria.nome} em Alvarães, Amazonas.`;

    return {
      meta: [
        { title: `${business.nome} - Guia comercial | Alvarães Moderna` },
        { name: "description", content: desc },
        { property: "og:title", content: business.nome },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: function BusinessPage() {
    const { business } = Route.useLoaderData();
    return <ComercioDetalheView business={business} />;
  },
});
