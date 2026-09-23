import type { Dispatch, SetStateAction } from "react";
import { AppPagination } from "@/components/app-pagination";

export type AdminOrdenacaoValor = "RECENTES" | "ANTIGOS" | "AZ";

export const ADMIN_OPCOES_POR_PAGINA = [10, 25, 50];

export function AdminOrdenacao({
  value,
  onChange,
  selectId,
}: {
  value: AdminOrdenacaoValor;
  onChange: (value: AdminOrdenacaoValor) => void;
  selectId: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={selectId} className="text-sm text-admin-muted">
        Ordenar por
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as AdminOrdenacaoValor)}
        className="h-10 rounded-md border border-admin-border bg-admin-surface px-3 text-sm font-semibold outline-none focus:border-admin-sidebar"
      >
        <option value="RECENTES">Mais recentes</option>
        <option value="ANTIGOS">Mais antigos</option>
        <option value="AZ">Nome A-Z</option>
      </select>
    </div>
  );
}

export function AdminStatusSelect<TStatus extends string>({
  value,
  options,
  dotClassName,
  disabled,
  onChange,
}: {
  value: TStatus;
  options: Array<{ valor: TStatus; label: string }>;
  dotClassName: string;
  disabled: boolean;
  onChange: (value: TStatus) => void;
}) {
  return (
    <div className="relative w-44">
      <span
        className={`pointer-events-none absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${dotClassName}`}
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TStatus)}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-admin-border bg-admin-soft pl-9 pr-3 text-sm font-semibold text-admin-foreground outline-none focus:border-admin-sidebar disabled:opacity-60"
      >
        {options.map((status) => (
          <option key={status.valor} value={status.valor}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AdminPaginacao({
  paginaAtual,
  totalPaginas,
  totalItens,
  porPagina,
  setPagina,
  setPorPagina,
  selectId,
}: {
  paginaAtual: number;
  totalPaginas: number;
  totalItens?: number;
  porPagina: number;
  setPagina: Dispatch<SetStateAction<number>>;
  setPorPagina: Dispatch<SetStateAction<number>>;
  selectId: string;
}) {
  return (
    <AppPagination
      totalItems={totalItens ?? totalPaginas * porPagina}
      page={paginaAtual}
      itemsPerPage={porPagina}
      itemsPerPageOptions={ADMIN_OPCOES_POR_PAGINA}
      onPageChange={setPagina}
      onItemsPerPageChange={setPorPagina}
      selectId={selectId}
    />
  );
}
