import { createFileRoute } from "@tanstack/react-router";
import { AdminContatosView } from "@/modules/contatos";

export const Route = createFileRoute("/admin/contatos")({
  head: () => ({
    meta: [{ title: "Contatos - Painel administrativo" }],
  }),
  component: AdminContatosView,
});
