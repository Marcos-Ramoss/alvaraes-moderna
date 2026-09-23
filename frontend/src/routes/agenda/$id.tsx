import { createFileRoute } from "@tanstack/react-router";
import { EventoDetalheView, eventosApi } from "@/modules/eventos";
import { useEffect, useState } from "react";
import type { EventoPublico } from "@/modules/eventos";

export const Route = createFileRoute("/agenda/$id")({
  component: EventoRoute,
});

function EventoRoute() {
  const { id } = Route.useParams();
  const [evento, setEvento] = useState<EventoPublico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");
    eventosApi
      .buscarPorId(id)
      .then(setEvento)
      .catch((err) => {
        setErro(err instanceof Error ? err.message : "Não foi possível carregar o evento.");
      })
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return <div className="p-8 text-center text-muted-foreground">Carregando detalhes do evento...</div>;
  }

  if (erro || !evento) {
    return (
      <div className="p-8 text-center text-red-700">
        <p>{erro || "Evento não encontrado."}</p>
      </div>
    );
  }

  return <EventoDetalheView evento={evento} />;
}

