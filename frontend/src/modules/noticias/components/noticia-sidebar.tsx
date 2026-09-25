import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Mail, Megaphone } from "lucide-react";
import { DemoTag } from "@/components/ui-bits";
import { eventosApi } from "@/modules/eventos/api/eventos.api";
import type { EventoPublico } from "@/modules/eventos/types/evento.types";
import { formatarDataPublica, noticiasApi } from "../api/noticias.api";

type Noticias = Awaited<ReturnType<typeof noticiasApi.listar>>["dados"];

export function NoticiaSidebar() {
  const [ranking, setRanking] = useState<Noticias>([]);
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroRanking, setErroRanking] = useState(false);
  const [erroEventos, setErroEventos] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErroRanking(false);
    setErroEventos(false);
    void Promise.allSettled([
      noticiasApi.listar({ ordenacao: "MAIS_LIDAS", limite: 5 }),
      eventosApi.listar({ situacao: "FUTURO", limite: 3 }),
    ]).then(([noticias, agenda]) => {
      if (!ativo) return;
      if (noticias.status === "fulfilled") setRanking(noticias.value.dados);
      else setErroRanking(true);
      if (agenda.status === "fulfilled") setEventos(agenda.value);
      else setErroEventos(true);
      setCarregando(false);
    });
    return () => { ativo = false; };
  }, [tentativa]);

  const tentarNovamente = <button type="button" onClick={() => setTentativa((valor) => valor + 1)} className="min-h-11 text-sm text-primary underline">Tentar novamente</button>;

  return (
    <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
      <section className="border-b border-border pb-5">
        <h2 className="font-display text-2xl text-primary">Mais lidas</h2>
        {carregando ? <p role="status" className="mt-3 text-sm">Carregando notícias...</p> : erroRanking ? <div><p className="mt-3 text-sm">Não foi possível carregar as mais lidas.</p>{tentarNovamente}</div> : ranking.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Ainda não há leituras registradas.</p> : (
          <ol className="mt-2 divide-y divide-border">
            {ranking.map((noticia, indice) => <li key={noticia.id}><Link to="/noticias/$slug" params={{ slug: noticia.slug }} className="flex min-h-11 gap-3 py-3"><span className="font-display text-xl text-primary">{indice + 1}</span><span className="min-w-0 break-words"><strong className="font-display text-base leading-tight text-primary">{noticia.titulo}</strong><span className="mt-1 block text-xs text-muted-foreground">{formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}</span></span></Link></li>)}
          </ol>
        )}
      </section>
      <section className="border-b border-border pb-5">
        <CalendarDays className="mb-2 size-5 text-primary" aria-hidden="true" />
        <h2 className="font-display text-xl text-primary">Agenda de eventos</h2>
        {carregando ? <p role="status" className="mt-3 text-sm">Carregando agenda...</p> : erroEventos ? <div><p className="mt-3 text-sm">Não foi possível carregar a agenda.</p>{tentarNovamente}</div> : eventos.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum evento previsto na agenda.</p> : (
          <ul className="mt-2 divide-y divide-border">{eventos.map((evento) => <li key={evento.id}><Link to="/agenda/$id" params={{ id: evento.id }} className="block min-h-11 break-words py-3"><span className="block text-xs text-muted-foreground">{formatarDataPublica(evento.data)}{evento.horario ? ` · ${evento.horario}` : ""}</span><strong className="mt-1 block text-sm text-primary">{evento.titulo}</strong>{evento.demonstracao && <DemoTag />}</Link></li>)}</ul>
        )}
        <Link to="/agenda" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">Ver agenda</Link>
      </section>
      <section className="border-b border-border pb-5">
        <Mail className="mb-2 size-5 text-primary" aria-hidden="true" />
        <h2 className="font-display text-xl text-primary">Resumo da semana</h2>
        <p className="mt-2 text-sm text-muted-foreground">Fique por dentro do que acontece em Alvarães.</p>
        <Link to="/boletim" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">Ver boletim</Link>
      </section>
      <section>
        <Megaphone className="mb-2 size-5 text-primary" aria-hidden="true" />
        <h2 className="font-display text-xl text-primary">Seu comércio no portal</h2>
        <Link to="/anuncie" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">Consultar opções de anúncio</Link>
      </section>
    </aside>
  );
}
