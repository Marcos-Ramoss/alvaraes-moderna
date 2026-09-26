import type { Dispatch, SetStateAction } from "react";
import { Calendar } from "lucide-react";
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

export function AdminFiltroPeriodo({
  dataInicio,
  dataFim,
  aoMudarDataInicio,
  aoMudarDataFim,
  aoLimpar,
  totalRegistros,
  titulo = "Filtrar por Período",
  className = "",
}: {
  dataInicio: string;
  dataFim: string;
  aoMudarDataInicio: (valor: string) => void;
  aoMudarDataFim: (valor: string) => void;
  aoLimpar?: () => void;
  totalRegistros?: number;
  titulo?: string;
  className?: string;
}) {
  const temFiltroAtivo = Boolean(dataInicio || dataFim);

  return (
    <div className={`text-xs text-admin-muted space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-semibold text-admin-foreground">
          <Calendar className="h-3.5 w-3.5 text-admin-sidebar" />
          {titulo}
        </span>
        <div className="flex items-center gap-2">
          {temFiltroAtivo && aoLimpar && (
            <button
              type="button"
              onClick={aoLimpar}
              className="text-[11px] text-admin-muted hover:text-admin-foreground underline"
            >
              Limpar período
            </button>
          )}
          {totalRegistros !== undefined && (
            <span className="text-[11px] text-admin-muted">
              ({totalRegistros} {totalRegistros === 1 ? "registro encontrado" : "registros encontrados"})
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="flex items-center gap-2 rounded-md border border-admin-border bg-admin-background px-3 py-1.5 focus-within:ring-1 focus-within:ring-admin-border">
          <span className="text-xs text-admin-muted font-medium w-8 shrink-0">De:</span>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => aoMudarDataInicio(e.target.value)}
            className="w-full bg-transparent text-xs text-admin-foreground focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-admin-border bg-admin-background px-3 py-1.5 focus-within:ring-1 focus-within:ring-admin-border">
          <span className="text-xs text-admin-muted font-medium w-8 shrink-0">Até:</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => aoMudarDataFim(e.target.value)}
            className="w-full bg-transparent text-xs text-admin-foreground focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}
