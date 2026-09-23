import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase ${className}`}
    >
      Demonstração — conteúdo fictício
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function PhotoPlaceholder({
  label = "Espaço reservado — fotografia local ainda não fornecida",
  className = "aspect-[16/9]",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center rounded-xl border border-dashed border-primary/30 bg-muted p-4 text-center text-xs text-muted-foreground ${className}`}
    >
      {label}
    </div>
  );
}

export function SectionHeader({
  title,
  text,
  to,
  cta,
}: {
  title: string;
  text: string;
  to?: string;
  cta?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-base text-foreground/80">{text}</p>
      {to && cta && (
        <Link
          to={to}
          className="mt-4 inline-flex rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
