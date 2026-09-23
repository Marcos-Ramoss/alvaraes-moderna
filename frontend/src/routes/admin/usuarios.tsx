import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuáriosPage,
});

function AdminUsuáriosPage() {
  const { usuario, carregando } = useAdminAuth();
  if (carregando) return <div className="min-h-screen bg-[#f4f1e9] p-8">Carregando painel...</div>;
  return (
    <AdminShell usuario={usuario}>
      <h1 className="font-display text-4xl font-semibold">Usuários</h1>
      <p className="mt-2 text-[#456054]">Gerenciamento de usuarios sera expandido depois do login inicial.</p>
    </AdminShell>
  );
}
