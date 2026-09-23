import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, Mail, Newspaper, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { boletimApi, type PreviaBoletim } from "@/lib/boletim-api";
import { formatarDataPtBr } from "@/lib/admin-api";

export const Route = createFileRoute("/boletim")({
  head: () => ({
    meta: [
      { title: "Boletim semanal - Alvarães Moderna" },
      {
        name: "description",
        content:
          "Receba no e-mail um resumo semanal com notícias, agenda e inscrições abertas em Alvarães.",
      },
    ],
  }),
  component: BoletimPage,
});

function BoletimPage() {
  const [previa, setPrevia] = useState<PreviaBoletim | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    boletimApi.buscarPrevia().then(setPrevia).catch(() => undefined);
  }, []);

  async function enviarInscricao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setErro("");
    setMensagem("");

    try {
      const resposta = await boletimApi.inscrever({ nome, email });
      setMensagem(resposta.mensagem);
      setNome("");
      setEmail("");
      const previaAtualizada = await boletimApi.buscarPrevia();
      setPrevia(previaAtualizada);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível fazer a inscrição.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-14">
      <section>
        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
          Boletim semanal
        </span>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-primary md:text-5xl">
          O que rolou em Alvarães, toda semana, no seu e-mail
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/80">
          Um resumo curto, de leitura rápida, com as notícias da semana, a agenda dos próximos
          dias e as inscrições abertas. Sem spam, sem enrolação.
        </p>

        <form
          onSubmit={enviarInscricao}
          className="mt-8 grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            placeholder="Seu nome"
            className="h-12 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            maxLength={180}
            placeholder="Seu melhor e-mail"
            className="h-12 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            <Mail className="h-4 w-4" />
            {enviando ? "Enviando..." : "Quero receber"}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {previa?.contagemInscritos
            ? `${previa.contagemInscritos} pessoa(s) inscrita(s).`
            : "Seja a primeira pessoa a se inscrever."}
        </div>
        {mensagem && <p className="mt-3 text-sm font-semibold text-primary">{mensagem}</p>}
        {erro && <p className="mt-3 text-sm font-semibold text-destructive">{erro}</p>}
        <p className="mt-5 text-xs text-muted-foreground">
          Você pode sair da lista quando quiser. Seu e-mail não será compartilhado.
        </p>
      </section>

      <aside className="rounded-md border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-lg font-semibold text-primary">
            Alvarães <span className="italic">Moderna</span>
          </p>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase text-secondary-foreground">
            Prévia da edição
          </span>
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">
          {previa?.titulo ?? "Boa semana, Alvarães!"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-foreground/70">
          {previa?.saudacao ?? "Aqui vai o resumo do que aconteceu na cidade e o que vem por aí."}
        </p>

        <SecaoPrevia
          icon={Newspaper}
          titulo="Notícias da semana"
          vazio="Semana tranquila por aqui."
          itens={previa?.noticiasDaSemana.map((noticia) => noticia.titulo) ?? []}
        />
        <SecaoPrevia
          icon={CalendarDays}
          titulo="Agenda dos próximos dias"
          vazio="Nenhum evento confirmado."
          itens={
            previa?.agendaProximosDias.map(
              (evento) =>
                `${evento.titulo} - ${formatarDataPtBr(evento.data)}${
                  evento.horario ? `, ${evento.horario}` : ""
                }`,
            ) ?? []
          }
        />
        <SecaoPrevia
          icon={GraduationCap}
          titulo="Inscrições abertas"
          vazio="Sem inscrições abertas no momento."
          itens={
            previa?.inscricoesAbertas.map(
              (oportunidade) =>
                `${oportunidade.titulo} - prazo ${formatarDataPtBr(oportunidade.prazo)}`,
            ) ?? []
          }
        />

        <p className="mt-8 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          Esta é uma prévia montada automaticamente com o conteúdo publicado no portal. A edição
          final terá curadoria da redação.
        </p>
      </aside>
    </div>
  );
}

function SecaoPrevia({
  icon: Icon,
  titulo,
  vazio,
  itens,
}: {
  icon: typeof Newspaper;
  titulo: string;
  vazio: string;
  itens: string[];
}) {
  return (
    <section className="mt-7">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
        <Icon className="h-4 w-4" />
        {titulo}
      </h3>
      {itens.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/80">
          {itens.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-foreground/70">{vazio}</p>
      )}
    </section>
  );
}
