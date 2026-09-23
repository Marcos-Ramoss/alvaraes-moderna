import { createFileRoute } from "@tanstack/react-router";
import { AdminPedidosAnuncioView } from "@/modules/pedidos-anuncio";

export const Route = createFileRoute("/admin/pedidos-anuncio")({
  head: () => ({
    meta: [{ title: "Anúncios - Painel administrativo" }],
  }),
  component: AdminPedidosAnuncioView,
});
