import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { DemoTag, Tag } from "@/components/ui-bits";
import type { EventoPublico } from "../types/evento.types";

export function EventoCard({ evento, past }: { evento: EventoPublico; past?: boolean }) {
  const data = new Date(evento.data);
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(data).replace(".", "");
  const imagemPrincipal = [...(evento.imagens ?? [])].sort((a, b) => a.ordem - b.ordem)[0];

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="relative flex aspect-[16/9] items-end overflow-hidden bg-[radial-gradient(circle_at_75%_20%,oklch(0.68_0.11_75),transparent_35%),linear-gradient(135deg,oklch(0.28_0.08_158),oklch(0.62_0.1_175))] p-3">
        {imagemPrincipal && (
          <img
            src={imagemPrincipal.url}
            alt={imagemPrincipal.textoAlternativo ?? evento.titulo}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {imagemPrincipal && <div className="absolute inset-0 bg-black/35" />}
        <div className="relative flex size-12 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <span className="text-[10px] font-bold uppercase">{mes}</span>
          <strong className="font-display text-2xl leading-none">{data.getDate()}</strong>
        </div>
        {past && (
          <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-1 text-[10px] text-white">
            Encerrado
          </span>
        )}
        {evento.video && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
            Vídeo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-wrap gap-1.5">
          <Tag>{evento.categoria.nome}</Tag>
          {evento.demonstracao && <DemoTag />}
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-base leading-tight text-primary">
          {evento.titulo}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-foreground/70">{evento.descrição}</p>
        <dl className="mt-3 space-y-1 text-[11px] text-muted-foreground">
          <div>
            <dt className="inline font-semibold text-primary">Horário: </dt>
            <dd className="inline">{evento.horario ?? "A partir das 8h"}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-primary">Local: </dt>
            <dd className="inline">{evento.local}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-primary">Entrada: </dt>
            <dd className="inline">{evento.entrada}</dd>
          </div>
        </dl>
        <Link
          to="/agenda/$id"
          params={{ id: evento.id }}
          className="mt-auto rounded-full bg-secondary px-3 py-2 text-center text-xs font-semibold text-primary"
        >
          Ver detalhes -&gt;
        </Link>
      </div>
    </li>
  );
}

export function Calendar({
  events,
  selectedDate,
  onSelectDate,
}: {
  events: EventoPublico[];
  selectedDate?: Date | null;
  onSelectDate?: (date: Date | null) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventDays = new Set(
    events
      .map((e) => new Date(e.data))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getDate()),
  );

  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(currentDate);

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="mt-2">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2 text-[11px] font-semibold text-primary">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex size-6 items-center justify-center rounded bg-secondary transition-colors hover:bg-border"
          aria-label="Mês anterior"
        >
          &lt;
        </button>
        <span className="capitalize">
          {monthName} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="flex size-6 items-center justify-center rounded bg-secondary transition-colors hover:bg-border"
          aria-label="Próximo mês"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        <div className="col-span-7 grid grid-cols-7 pb-2 text-[9px] text-primary">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>
        {blanks.map((b) => (
          <span key={`blank-${b}`} className="size-6" />
        ))}
        {days.map((day) => {
          const hasEvent = eventDays.has(day);
          const dateOfEvent = new Date(year, month, day);
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === day;

          if (hasEvent) {
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectDate?.(null);
                  } else {
                    onSelectDate?.(dateOfEvent);
                  }
                }}
                className={`flex size-6 items-center justify-center rounded-full font-bold shadow-sm ring-2 ring-offset-1 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground ring-primary/50"
                    : "bg-primary text-primary-foreground ring-primary/20 hover:bg-primary/90"
                }`}
                title={isSelected ? "Remover filtro" : "Filtrar eventos deste dia"}
              >
                {day}
              </button>
            );
          }

          return (
            <span
              key={day}
              className="flex size-6 items-center justify-center rounded-full hover:bg-secondary"
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
