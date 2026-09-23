import { FormEvent, useState } from "react";
import { publicFormsApi, type CriarContatoPayload } from "@/lib/public-forms-api";

const LIMITE_MENSAGEM = 3000;

export function ContatoView() {
  const [form, setForm] = useState<CriarContatoPayload>({
    tipo: "SUGESTAO_PAUTA",
    nome: "",
    contatoResposta: "",
    assunto: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function enviarContato(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setMensagem("");
    setErro("");

    try {
      const payload: CriarContatoPayload = {
        tipo: form.tipo,
        nome: form.nome.trim(),
        contatoResposta: form.contatoResposta.trim(),
        mensagem: form.mensagem.trim(),
        ...(form.assunto?.trim() ? { assunto: form.assunto.trim() } : {}),
      };
      const resposta = await publicFormsApi.enviarContato(payload);
      setMensagem(resposta.mensagem);
      setForm({
        tipo: "SUGESTAO_PAUTA",
        nome: "",
        contatoResposta: "",
        assunto: "",
        mensagem: "",
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível enviar sua mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-primary">
        O que acontece perto de você pode virar pauta
      </h1>
      <p className="mt-3 text-lg text-foreground/80">
        Tem um evento para divulgar, uma historia para contar ou uma oportunidade para
        compartilhar? Envie sua sugestao a equipe do portal.
      </p>
      <p className="mt-3 text-foreground/80">
        Encontrou alguma informacao incorreta? Avise para que possamos conferir e corrigir.
      </p>

      <div className="mt-8 rounded-xl border border-primary/20 bg-muted p-5">
        <h2 className="font-display text-xl font-semibold">Envio disponivel</h2>
        <p className="mt-2 text-foreground/80">
          Sua mensagem será registrada no painel administrativo para conferência da equipe.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe um e-mail, telefone ou WhatsApp no campo de resposta para que a redação possa
          retornar, se necessario.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={enviarContato}>
        {mensagem && (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {mensagem}
          </p>
        )}
        {erro && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {erro}
          </p>
        )}

        <label className="block">
          <span className="text-sm font-medium">Tipo de mensagem</span>
          <select
            value={form.tipo}
            onChange={(event) =>
              setForm({ ...form, tipo: event.target.value as CriarContatoPayload["tipo"] })
            }
            className="mt-1 w-full rounded-lg border border-input bg-card px-4 py-3"
          >
            <option value="SUGESTAO_PAUTA">Sugestao de pauta</option>
            <option value="CORRECAO">Correcao de informacao</option>
            <option value="MENSAGEM_GERAL">Mensagem geral</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Seu nome</span>
          <input
            value={form.nome}
            onChange={(event) => setForm({ ...form, nome: event.target.value })}
            required
            minLength={2}
            maxLength={120}
            className="mt-1 w-full rounded-lg border border-input bg-card px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Como podemos responder</span>
          <input
            value={form.contatoResposta}
            onChange={(event) => setForm({ ...form, contatoResposta: event.target.value })}
            required
            minLength={5}
            maxLength={180}
            placeholder="E-mail, telefone ou WhatsApp"
            className="mt-1 w-full rounded-lg border border-input bg-card px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Assunto</span>
          <input
            value={form.assunto}
            onChange={(event) => setForm({ ...form, assunto: event.target.value })}
            maxLength={160}
            className="mt-1 w-full rounded-lg border border-input bg-card px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="flex items-center justify-between gap-3 text-sm font-medium">
            <span>Sua sugestao ou correcao</span>
            <span className="text-xs text-muted-foreground">
              {form.mensagem.length}/{LIMITE_MENSAGEM}
            </span>
          </span>
          <textarea
            value={form.mensagem}
            onChange={(event) => setForm({ ...form, mensagem: event.target.value })}
            required
            minLength={10}
            maxLength={LIMITE_MENSAGEM}
            rows={5}
            className="mt-1 w-full rounded-lg border border-input bg-card px-4 py-3"
          />
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
        >
          {enviando ? "Enviando..." : "Enviar sugestao ou correcao"}
        </button>
      </form>
    </div>
  );
}
