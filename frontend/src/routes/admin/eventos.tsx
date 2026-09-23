import { createFileRoute } from "@tanstack/react-router";
import { AdminEventosView } from "@/modules/eventos";

export const Route = createFileRoute("/admin/eventos")({
  component: AdminEventosView,
});
