import { CheckSquare, Trash2, CheckCircle, XCircle, Settings2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { adminApi, formatarErroApi } from "@/lib/admin-api";
import { toast } from "sonner";

interface AdminMassActionsProps {
  entidade: "NOTICIA" | "COMERCIO" | "EVENTO" | "CURSO" | "COMENTARIO" | "CONTATO" | "PEDIDO_ANUNCIO";
  selecionados: string[];
  onClearSelection: () => void;
  onSuccess: () => void;
  opcoesStatus?: { value: string; label: string; icon?: React.ReactNode }[];
}

export function AdminMassActions({
  entidade,
  selecionados,
  onClearSelection,
  onSuccess,
  opcoesStatus,
}: AdminMassActionsProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (selecionados.length === 0) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await adminApi.massaDelete(entidade, selecionados);
      toast.success(`${selecionados.length} itens excluidos com sucesso.`);
      onClearSelection();
      onSuccess();
    } catch (err) {
      toast.error(formatarErroApi(err));
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setLoading(true);
      await adminApi.massaUpdateStatus(entidade, selecionados, status);
      toast.success(`${selecionados.length} itens atualizados com sucesso.`);
      onClearSelection();
      onSuccess();
    } catch (err) {
      toast.error(formatarErroApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-border bg-card p-3 pr-4 shadow-xl animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-2 pl-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckSquare className="size-4" />
          </div>
          <span className="text-sm font-medium">
            {selecionados.length} selecionado{selecionados.length > 1 && "s"}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          {opcoesStatus && opcoesStatus.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2" disabled={loading}>
                  <Settings2 className="size-4" />
                  <span className="hidden sm:inline">Mudar status</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {opcoesStatus.map((opt) => (
                  <DropdownMenuItem key={opt.value} onClick={() => handleUpdateStatus(opt.value)}>
                    {opt.icon && <span className="mr-2">{opt.icon}</span>}
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-2"
            disabled={loading}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>

          <Button variant="ghost" size="sm" className="h-8" onClick={onClearSelection} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir itens selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Voce esta prestes a excluir {selecionados.length} itens. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
