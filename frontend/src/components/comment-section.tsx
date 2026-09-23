import { useState, useEffect } from "react";
import { Button } from "./ui/button";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333/api";

function formatarDataPtBr(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface CommentSectionProps {
  entidadeTipo: "NOTICIA" | "COMERCIO" | "EVENTO" | "CURSO";
  entidadeId: string;
}

interface Comentario {
  id: string;
  autorNome: string;
  conteudo: string;
  criadoEm: string;
}

export function CommentSection({ entidadeTipo, entidadeId }: CommentSectionProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const res = await fetch(`${API_URL}/comentarios/${entidadeTipo}/${entidadeId}`);
        if (res.ok) {
          const data = await res.json();
          setComentarios(data.items);
          setTotal(data.total);
        }
      } catch (err) {
        console.error("Erro ao buscar comentarios", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComentarios();
  }, [entidadeTipo, entidadeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErroForm("");
    setMensagemSucesso("");

    try {
      const res = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entidadeTipo,
          entidadeId,
          autorNome: nome,
          autorEmail: email,
          conteudo
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Falha ao enviar comentario");
      }

      setMensagemSucesso("Seu comentario foi enviado e esta aguardando aprovacao da moderacao.");
      setNome("");
      setEmail("");
      setConteudo("");
    } catch (err: any) {
      setErroForm(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-sm text-muted-foreground">Carregando comentarios...</div>;

  return (
    <div className="mt-12">
      <h3 className="font-display text-2xl font-semibold">Comentarios ({total})</h3>
      
      <div className="mt-8 space-y-6">
        {comentarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum comentario ainda. Seja o primeiro a comentar!</p>
        ) : (
          comentarios.map(c => (
            <div key={c.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{c.autorNome}</span>
                <span className="text-xs text-muted-foreground">{formatarDataPtBr(c.criadoEm)}</span>
              </div>
              <p className="mt-3 text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 rounded-lg border bg-muted/30 p-6">
        <h4 className="font-display text-lg font-semibold">Deixe seu comentario</h4>
        <p className="mt-1 text-sm text-muted-foreground">Os comentarios sao revisados antes de serem publicados.</p>
        
        {mensagemSucesso && (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            {mensagemSucesso}
          </div>
        )}
        
        {erroForm && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {erroForm}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className="mb-2 block text-sm font-semibold">Nome</label>
              <input
                id="nome"
                required
                minLength={2}
                maxLength={120}
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">E-mail (opcional)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Nao sera publicado"
              />
            </div>
          </div>
          <div>
            <label htmlFor="conteudo" className="mb-2 block text-sm font-semibold">Comentario</label>
            <textarea
              id="conteudo"
              required
              minLength={3}
              maxLength={1000}
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="O que voce achou?"
            />
          </div>
          <Button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar comentario"}
          </Button>
        </form>
      </div>
    </div>
  );
}

