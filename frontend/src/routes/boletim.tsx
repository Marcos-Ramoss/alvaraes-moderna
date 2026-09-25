import { createFileRoute } from "@tanstack/react-router";
import { BoletimView } from "@/modules/boletim";

export const Route = createFileRoute("/boletim")({
  head: () => ({
    meta: [
      { title: "Boletim semanal - Alvarães Moderna" },
      {
        name: "description",
        content:
          "Receba no e-mail um resumo semanal com notícias, agenda e inscrições abertas em Alvarães.",
      },
    ],
  }),
  component: BoletimView,
});
