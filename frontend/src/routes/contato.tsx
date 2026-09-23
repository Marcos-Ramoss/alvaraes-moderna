import { createFileRoute } from "@tanstack/react-router";
import { ContatoView } from "@/modules/contatos";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e sugestoes - Alvarães Moderna" },
      {
        name: "description",
        content:
          "Envie sugestoes de pauta, divulgue eventos ou avise sobre informações incorretas no portal Alvarães Moderna.",
      },
      { property: "og:title", content: "Contato e sugestoes - Alvarães Moderna" },
      {
        property: "og:description",
        content: "Fale com a equipe do portal Alvarães Moderna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContatoView,
});
