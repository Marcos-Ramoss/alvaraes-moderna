import { createFileRoute } from "@tanstack/react-router";
import { CursoDetalheView, cursosApi } from "@/modules/cursos";
import { useEffect, useState } from "react";
import type { OportunidadePublica } from "@/modules/cursos";

export const Route = createFileRoute("/cursos/$id")({
  component: CursoRoute,
});

function CursoRoute() {
  const { id } = Route.useParams();
  const [curso, setCurso] = useState<OportunidadePublica | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");
    cursosApi
      .buscarPorId(id)
      .then(setCurso)
      .catch((err) => {
        setErro(err instanceof Error ? err.message : "Não foi possível carregar o curso.");
      })
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return <div className="p-8 text-center text-muted-foreground">Carregando detalhes do curso/oportunidade...</div>;
  }

  if (erro || !curso) {
    return (
      <div className="p-8 text-center text-red-700">
        <p>{erro || "Curso/Oportunidade não encontrada."}</p>
      </div>
    );
  }

  return <CursoDetalheView curso={curso} />;
}

