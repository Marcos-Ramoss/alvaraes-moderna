import { createFileRoute } from "@tanstack/react-router";
import { ComerciosListaView } from "@/modules/comercios";

export const Route = createFileRoute("/comercios/")({
  head: () => ({
    meta: [
      { title: "Guia comercial de Alvarães - Alvarães Moderna" },
      {
        name: "description",
        content:
          "Encontre comercios e serviços de Alvarães por categoria e veja como entrar em contato.",
      },
      { property: "og:title", content: "Guia comercial de Alvarães" },
      {
        property: "og:description",
        content: "Negocios locais de Alvarães organizados por categoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComerciosListaView,
});
