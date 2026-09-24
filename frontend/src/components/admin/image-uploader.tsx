import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

interface ImageUploaderProps {
  url: string;
  onChange: (url: string) => void;
  pasta?: string;
  label?: string;
  ajuda?: string;
}

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

export function ImageUploader({
  url,
  onChange,
  pasta = "geral",
  label = "Imagem",
  ajuda = "PNG, JPG, WebP ou GIF de até 5 MB",
}: ImageUploaderProps) {
  const [enviando, setEnviando] = useState(false);
  const [modoUrlManual, setModoUrlManual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function lidarComArquivo(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      toast.error("O arquivo excede o tamanho máximo permitido de 5 MB.");
      return;
    }

    try {
      setEnviando(true);
      const resultado = await adminApi.uploadImagem(arquivo, pasta);
      onChange(resultado.url);
      toast.success("Imagem enviada com sucesso para o Supabase!");
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao enviar imagem.";
      toast.error(mensagem);
    } finally {
      setEnviando(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-admin-muted">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setModoUrlManual(!modoUrlManual)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" />
          {modoUrlManual ? "Fazer upload de arquivo" : "Colar URL manual"}
        </button>
      </div>

      {modoUrlManual ? (
        <input
          type="url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.webp"
          className="admin-input text-sm"
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={lidarComArquivo}
            disabled={enviando}
          />

          {url.trim() ? (
            <div className="relative group overflow-hidden rounded-lg border border-border bg-secondary/30 p-2">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  <img
                    src={url}
                    alt="Prévia da imagem"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{url}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Imagem carregada</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={enviando}
                  >
                    {enviando ? <Loader2 className="h-3 w-3 animate-spin" /> : "Trocar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => onChange("")}
                    disabled={enviando}
                    title="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !enviando && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                enviando ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <div className="rounded-full bg-secondary p-3 text-primary">
                {enviando ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {enviando ? "Enviando para o Supabase..." : "Clique para escolher a imagem"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{ajuda}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

