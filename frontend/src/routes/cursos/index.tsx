import { createFileRoute } from "@tanstack/react-router";
import { CursosListaView } from "@/modules/cursos";

export const Route = createFileRoute("/cursos/")({
  head: () => ({
    meta: [
      { title: "Cursos e oportunidades em Alvarães - Alvarães Moderna" },
      {
        name: "description",
        content:
          "Cursos, vagas e inscrições abertas para quem vive em Alvarães, com prazos e orientações para participar.",
      },
      { property: "og:title", content: "Cursos e oportunidades em Alvarães" },
      {
        property: "og:description",
        content: "Novas possibilidades para aprender e trabalhar na cidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CursosListaView,
});
