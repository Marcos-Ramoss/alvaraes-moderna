import { createFileRoute } from "@tanstack/react-router";
import { AnuncieView } from "@/modules/pedidos-anuncio";

export const Route = createFileRoute("/anuncie")({
  head: () => ({
    meta: [
      { title: "Anuncie no Alvarães Moderna - guia comercial de Alvarães" },
      {
        name: "description",
        content:
          "Solicite cadastro básico, página completa ou destaque patrocinado no guia comercial de Alvarães.",
      },
      { property: "og:title", content: "Anuncie no Alvarães Moderna" },
      {
        property: "og:description",
        content: "Apresente seu negócio a quem procura produtos e serviços em Alvarães.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnuncieView,
});
