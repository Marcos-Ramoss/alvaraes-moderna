import { useEffect } from "react";
import { noticiasApi } from "../api/noticias.api";

export function useRegistrarLeitura(slug: string) {
  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    let enviada = false;

    const registrar = async () => {
      if (enviada || document.visibilityState !== "visible") return;
      try {
        let clienteId = localStorage.getItem("cliente_id");
        if (!clienteId || !/^[a-zA-Z0-9_-]{16,128}$/.test(clienteId)) {
          clienteId = crypto.randomUUID();
          localStorage.setItem("cliente_id", clienteId);
        }
        enviada = true;
        await noticiasApi.registrarLeitura(slug, clienteId);
      } catch {
        // Falhas de armazenamento ou métricas não impedem a leitura da matéria.
      }
    };

    const agendar = () => {
      clearTimeout(temporizador);
      if (!enviada && document.visibilityState === "visible") {
        temporizador = setTimeout(() => void registrar(), 5000);
      }
    };

    agendar();
    document.addEventListener("visibilitychange", agendar);
    return () => {
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", agendar);
    };
  }, [slug]);
}
