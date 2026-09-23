import { createFileRoute } from "@tanstack/react-router";
import { EventosListaView } from "@/modules/eventos";

export const Route = createFileRoute("/agenda/")({
  head: () => ({
    meta: [
      { title: "Agenda de Alvarães - festas, festejos e eventos" },
      {
        name: "description",
        content:
          "Programe-se em Alvarães: datas, locais e detalhes dos próximos eventos e da programação cultural.",
      },
      { property: "og:title", content: "Agenda de Alvarães" },
      {
        property: "og:description",
        content: "Festas, festejos, encontros e programação cultural da cidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventosListaView,
});
