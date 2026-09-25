import { Link } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, Mail, Newspaper, Users } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { boletimApi, type PreviaBoletim } from "@/lib/boletim-api";
import { formatarDataPtBr } from "@/lib/admin-api";

export function BoletimView() {
  const [previa, setPrevia] = useState<PreviaBoletim | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [erroPrevia, setErroPrevia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregandoPrevia, setCarregandoPrevia] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregandoPrevia(true);
    setErroPrevia("");

    boletimApi
      .buscarPrevia()
      .then((dados) => {
        if (ativo) setPrevia(dados);
      })
      .catch(() => {
        if (ativo) setErroPrevia("Não foi possível carregar a prévia do boletim.");
      })
      .finally(() => {
        if (ativo) setCarregandoPrevia(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const totalInscritos = previa?.contagemInscritos ?? 0;
  const textoInscritos = useMemo(() => {
    if (carregandoPrevia) return "Carregando inscritos...";
    if (totalInscritos <= 0) return "Seja a primeira pessoa a se inscrever.";
    return `${totalInscritos} ${totalInscritos === 1 ? "pessoa inscrita" : "pessoas inscritas"}.`;
  }, [carregandoPrevia, totalInscritos]);

  async function enviarInscricao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setErro("");
    setMensagem("");

    try {
      const resposta = await boletimApi.inscrever({ nome, email });
      setMensagem(resposta.mensagem);
      setNome("");
      setEmail("");
      setTentativa((valor) => valor + 1);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível fazer a inscrição.");
    } finally {
      setEnviando(false);
    }
  }

  const noticias = previa?.noticiasDaSemana ?? [];
  const eventos = previa?.agendaProximosDias ?? [];
  const inscricoes = previa?.inscricoesAbertas ?? [];

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
          Um resumo curto, de leitura rápida, com as notícias da semana, a agenda dos próximos dias
          e as inscrições abertas. Sem spam, sem enrolação.
        </p>

        <form
          onSubmit={enviarInscricao}
          className="mt-8 grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <input
            id="boletim-nome"
            name="nome"
            type="text"
            autoComplete="name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            placeholder="Seu nome"
            aria-label="Seu nome"
            className="h-12 min-w-0 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <input
            id="boletim-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={180}
            placeholder="Seu melhor e-mail"
            aria-label="Seu melhor e-mail"
            className="h-12 min-w-0 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {enviando ? "Enviando..." : "Quero receber"}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Users className="h-4 w-4" aria-hidden="true" />
          {textoInscritos}
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

        {erroPrevia ? (
          <div className="mt-6 rounded-md border border-border bg-background p-4">
            <p className="text-sm text-foreground/80">{erroPrevia}</p>
            <button
              type="button"
              onClick={() => setTentativa((valor) => valor + 1)}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <h2 className="mt-6 font-display text-2xl font-semibold">
              {previa?.titulo ?? "Boa semana, Alvarães!"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              {carregandoPrevia
                ? "Carregando a prévia do boletim..."
                : previa?.saudacao ?? "Aqui vai o resumo do que aconteceu na cidade e o que vem por aí."}
            </p>
            {previa?.periodo && (
              <p className="mt-2 text-xs text-muted-foreground">
                {formatarDataPtBr(previa.periodo.inicio)} a {formatarDataPtBr(previa.periodo.fim)}
              </p>
            )}

            <SecaoPrevia
              icon={Newspaper}
              titulo="Notícias da semana"
              vazio="Semana tranquila por aqui."
              itens={noticias.map((noticia) => (
                <Link key={noticia.id} to="/noticias/$slug" params={{ slug: noticia.slug }} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {noticia.titulo}
                </Link>
              ))}
            />
            <SecaoPrevia
              icon={CalendarDays}
              titulo="Agenda dos próximos dias"
              vazio="Nenhum evento confirmado."
              itens={eventos.map((evento) => (
                <Link key={evento.id} to="/agenda/$id" params={{ id: evento.id }} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {evento.titulo} - {formatarDataPtBr(evento.data)}{evento.horario ? `, ${evento.horario}` : ""}
                </Link>
              ))}
            />
            <SecaoPrevia
              icon={GraduationCap}
              titulo="Inscrições abertas"
              vazio="Sem inscrições abertas no momento."
              itens={inscricoes.map((oportunidade) => (
                <Link key={oportunidade.id} to="/cursos/$id" params={{ id: oportunidade.id }} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {oportunidade.titulo} - prazo {formatarDataPtBr(oportunidade.prazo)}
                </Link>
              ))}
            />
          </>
        )}

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
  itens: ReactNode[];
}) {
  return (
    <section className="mt-7">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {titulo}
      </h3>
      {itens.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/80">
          {itens.map((item, indice) => (
            <li key={indice}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-foreground/70">{vazio}</p>
      )}
    </section>
  );
}
