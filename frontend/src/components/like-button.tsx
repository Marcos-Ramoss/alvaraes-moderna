import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  entidadeTipo: "NOTICIA" | "COMERCIO" | "EVENTO" | "CURSO";
  entidadeId: string;
}

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

function getClienteId() {
  let id = localStorage.getItem("cliente_id");
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("cliente_id", id);
  }
  return id;
}

export function LikeButton({ entidadeTipo, entidadeId }: LikeButtonProps) {
  const [curtido, setCurtido] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurtidas = async () => {
      try {
        const clienteId = getClienteId();
        const res = await fetch(`${API_URL}/curtidas/${entidadeTipo}/${entidadeId}?clienteId=${clienteId}`);
        if (res.ok) {
          const data = await res.json();
          setTotal(data.total);
          setCurtido(data.curtido);
        }
      } catch (err) {
        console.error("Erro ao buscar curtidas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurtidas();
  }, [entidadeTipo, entidadeId]);

  const handleToggle = async () => {
    if (loading) return;

    // Optimistic UI update
    setCurtido((prev) => !prev);
    setTotal((prev) => (curtido ? prev - 1 : prev + 1));

    try {
      const clienteId = getClienteId();
      await fetch(`${API_URL}/curtidas/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entidadeTipo, entidadeId, clienteId }),
      });
    } catch (err) {
      console.error("Erro ao alternar curtida", err);
      // Revert in case of error
      setCurtido((prev) => !prev);
      setTotal((prev) => (!curtido ? prev - 1 : prev + 1));
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2", curtido && "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40")}
      onClick={handleToggle}
      disabled={loading}
    >
      <Heart className={cn("size-4", curtido && "fill-current")} />
      <span>{total}</span>
    </Button>
  );
}

