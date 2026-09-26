import { createFileRoute } from "@tanstack/react-router";
import { AdminUsuariosView } from "@/modules/usuarios";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuários Administrativos - Alvarães Moderna" }],
  }),
  component: AdminUsuariosView,
});
