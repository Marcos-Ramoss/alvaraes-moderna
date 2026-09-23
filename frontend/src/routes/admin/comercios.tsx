import { createFileRoute } from "@tanstack/react-router";
import { AdminComerciosView } from "@/modules/comercios";

export const Route = createFileRoute("/admin/comercios")({
  head: () => ({
    meta: [{ title: "Guia comercial - Painel administrativo" }],
  }),
  component: AdminComerciosView,
});
