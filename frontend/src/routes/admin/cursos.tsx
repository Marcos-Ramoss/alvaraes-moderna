import { createFileRoute } from "@tanstack/react-router";
import { AdminCursosView } from "@/modules/cursos";

export const Route = createFileRoute("/admin/cursos")({
  component: AdminCursosView,
});
