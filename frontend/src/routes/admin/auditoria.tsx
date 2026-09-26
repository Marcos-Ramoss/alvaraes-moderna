import { createFileRoute } from "@tanstack/react-router";
import { AdminAuditoriaView } from "@/modules/auditoria";

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({
    meta: [{ title: "Logs de Auditoria - Alvarães Moderna" }],
  }),
  component: AdminAuditoriaView,
});
