import { createFileRoute } from "@tanstack/react-router";
import { AdminNoticiasView } from "@/modules/noticias";

export const Route = createFileRoute("/admin/noticias")({
  head: () => ({
    meta: [{ title: "Notícias - Painel administrativo" }],
  }),
  component: AdminNoticiasView,
});
