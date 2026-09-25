import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Store, Calendar, GraduationCap, Users, Mail, Building2, MessageSquareText, type LucideIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { DemoTag, EmptyState, PhotoPlaceholder, SectionHeader, Tag } from "@/components/ui-bits";
import {
  formatarDataPublica,
  noticiasApi,
  type NoticiaPublica,
} from "@/modules/noticias";
import { comerciosApi, type ComercioPublico } from "@/modules/comercios";
import { eventosApi, type EventoPublico } from "@/modules/eventos";
import { cursosApi, type OportunidadePublica } from "@/modules/cursos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alvarães Moderna - Alvarães perto de você" },
      {
        name: "description",
        content:
          "Notícias, comercios, serviços e oportunidades de Alvarães (AM). Acompanhe a cidade, os cursos, as festas e os festejos.",
      },
      { property: "og:title", content: "Alvarães Moderna - Alvarães perto de você" },
      {
        property: "og:description",
        content:
          "Notícias, comercios, serviços e oportunidades da nossa cidade, no coração do Amazonas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [noticias, setNoticias] = useState<NoticiaPublica[]>([]);
  const [comercios, setComercios] = useState<ComercioPublico[]>([]);
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [oportunidades, setOportunidades] = useState<OportunidadePublica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");

    Promise.allSettled([
      noticiasApi.listar(),
      comerciosApi.listar(),
      eventosApi.listar(),
      cursosApi.listarOportunidades(),
    ])
      .then(([noticiasResult, comerciosResult, eventosResult, oportunidadesResult]) => {
        if (noticiasResult.status === "fulfilled") setNoticias(noticiasResult.value.dados);
        if (comerciosResult.status === "fulfilled") setComercios(comerciosResult.value.dados);
        if (eventosResult.status === "fulfilled") setEventos(eventosResult.value);
        if (oportunidadesResult.status === "fulfilled") {
          setOportunidades(oportunidadesResult.value.dados);
        }

        const algumErro = [
          noticiasResult,
          comerciosResult,
          eventosResult,
          oportunidadesResult,
        ].some((result) => result.status === "rejected");

        if (algumErro) {
          setErro("Algumas informações não puderam ser carregadas agora.");
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  const featured = useMemo(
    () => noticias.find((noticia) => noticia.destaque) ?? noticias[0],
    [noticias],
  );
  const recent = useMemo(
    () => noticias.filter((noticia) => noticia.slug !== featured?.slug).slice(0, 4),
    [featured?.slug, noticias],
  );
  const noticiasCarrossel = useMemo(
    () => [featured, ...recent].filter((noticia): noticia is NoticiaPublica => Boolean(noticia)).slice(0, 3),
    [featured, recent],
  );
  const upcoming = useMemo(() => eventos.filter((evento) => !evento.encerrado).slice(0, 2), [eventos]);
  const culture = useMemo(
    () => noticias.filter((noticia) => noticia.categoria.slug === "cultura").slice(0, 2),
    [noticias],
  );
  const openOpportunities = useMemo(
    () => oportunidades.filter((oportunidade) => !oportunidade.encerrada).slice(0, 2),
    [oportunidades],
  );

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="relative isolate overflow-hidden rounded-none border-y border-border bg-secondary -mx-4 sm:mx-0 sm:rounded-[28px] sm:border">
        {featured?.imagemUrl && (
          <img
            src={featured.imagemUrl}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/25" />
        <div className="px-5 py-12 sm:px-10 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              Portal local de Alvarães
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-primary sm:text-7xl">
              Alvarães Moderna
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
              Notícias, comércio, serviços e oportunidades que conectam a cidade.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/noticias" search={{}} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Últimas noticias →
              </Link>
              <Link to="/comercios" className="rounded-full border border-primary/40 bg-background/70 px-5 py-3 text-sm font-semibold text-primary hover:bg-background">
                Encontrar comércio
              </Link>
              <Link to="/cursos" className="rounded-full border border-primary/40 bg-background/70 px-5 py-3 text-sm font-semibold text-primary hover:bg-background">
                Ver oportunidades
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-primary/20 pt-5 text-xs text-foreground/70">
              <span>◉ Informação confiável</span>
              <span>⌂ Comércio local</span>
              <span>▣ Eventos da cidade</span>
            </div>
          </div>
        </div>
      </section>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <section>
        <HomeSectionHeader title="O que acontece em Alvarães" text="As novidades da cidade e os assuntos que fazem parte do seu dia a dia. Acompanhe noticias, iniciativas e histórias da nossa comunidade." to="/noticias" cta="Ver todas as noticias →" />
        {carregando ? <BlocoNoticiasSkeleton /> : noticiasCarrossel.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-[1.55fr_0.95fr]">
            <Carousel className="relative overflow-hidden rounded-lg">
              <CarouselContent>
                {noticiasCarrossel.map((noticia) => (
                  <CarouselItem key={noticia.slug}>
                    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                      <Link to="/noticias/$slug" params={{ slug: noticia.slug }} className="block">
                        {noticia.imagemUrl ? <img src={noticia.imagemUrl} alt={noticia.imagemAlt ?? noticia.titulo} className="aspect-[16/8] w-full object-cover transition-transform duration-300 hover:scale-[1.02]" /> : <PhotoPlaceholder label="Espaço reservado - fotografia local" className="aspect-[16/8] rounded-none" />}
                      </Link>
                      <div className="p-5 sm:p-6">
                        <Tag>{noticia.categoria.nome}</Tag>
                        <h2 className="mt-3 font-display text-2xl leading-tight text-primary sm:text-3xl"><Link to="/noticias/$slug" params={{ slug: noticia.slug }} className="hover:text-primary/80">{noticia.titulo}</Link></h2>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/75">{noticia.resumo}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                          <span>▣ {formatarDataPublica(noticia.publicadoEm ?? noticia.criadoEm)}</span>
                          <Link to="/noticias/$slug" params={{ slug: noticia.slug }} className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground">Ler reportagem →</Link>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {noticiasCarrossel.length > 1 && <><CarouselPrevious className="left-3 top-[38%]" /><CarouselNext className="right-3 top-[38%]" /></>}
            </Carousel>
          </div>
        ) : <EmptyState>Nenhuma notícia publicada no momento.</EmptyState>}
      </section>

     

      <section className="rounded-[24px] bg-secondary/55 p-4 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div><h2 className="font-display text-2xl text-primary sm:text-3xl">Descubra Alvarães</h2><p className="mt-1 text-sm text-foreground/70">Tudo o que você precisa em um só lugar.</p></div>
          <span className="hidden text-sm font-semibold text-primary sm:block">Explore o que a cidade oferece →</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DiscoverCard icon={Store} title="Comércio local" text="Onde comprar, comer e contratar na sua cidade." to="/comercios" action="Explorar comércios →" />
          <DiscoverCard icon={Calendar} title="Agenda" text="Eventos, festas e programação local." to="/agenda" action="Ver agenda →" />
          <DiscoverCard icon={GraduationCap} title="Cursos e oportunidades" text="Vagas, cursos e inscrições para você." to="/cursos" action="Ver oportunidades →" />
          <DiscoverCard icon={Users} title="Nossa gente, Nossas histórias" text="Histórias, cultura e pessoas que fazem Alvarães." to="/sobre" action="Conheça as histórias →" />
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-5 rounded-lg bg-secondary p-6 sm:flex-row sm:items-center sm:p-8"><div><h2 className="font-display text-2xl text-primary">Política e vida pública</h2><p className="mt-1 max-w-2xl text-sm text-foreground/70">Acompanhe decisões, ações e debates que afetam o município, com fontes identificadas e explicações claras.</p></div><Link to="/noticias" search={{ categoria: "politica-e-vida-publica" }} className="shrink-0 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary">Ver publicações →</Link></section>

      <section className="grid gap-4 md:grid-cols-3">
        <HomeCta to="/boletim" icon={Mail} title="Receba o resumo da semana" text="Notícias, agenda e inscrições abertas em uma leitura curta." action="Quero receber o boletim →" />
        <HomeCta to="/anuncie" icon={Building2} title="Seu comércio faz parte da cidade" text="Apresente seu negócio a quem procura produtos e serviços." action="Quero incluir meu negócio →" />
        <HomeCta to="/contato" icon={MessageSquareText} title="O que acontece perto de você?" text="Envie uma pauta, evento, história ou sugestão ao portal." action="Enviar sugestão →" />
      </section>
    </div>
  );
}

function HomeSectionHeader({ title, text, to, cta }: { title: string; text?: string; to?: string; cta?: string }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-2xl text-primary sm:text-3xl">{title}</h2>{text && <p className="mt-1 max-w-2xl text-sm text-foreground/70">{text}</p>}</div>{to && cta && (to === "/noticias" ? <Link to="/noticias" search={{}} className="shrink-0 text-sm font-semibold text-primary">{cta}</Link> : <Link to={to} className="shrink-0 text-sm font-semibold text-primary">{cta}</Link>)}</div>;
}

function HomeCta({ to, icon: Icon, title, text, action }: { to: string; icon: LucideIcon; title: string; text: string; action: string }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-3 font-display text-lg text-primary">{title}</h2>
      <p className="mt-1 text-sm text-foreground/70">{text}</p>
      <Link to={to} className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
        {action}
      </Link>
    </article>
  );
}

function DiscoverCard({ icon: Icon, title, text, to, action }: { icon: LucideIcon; title: string; text: string; to: string; action: string }) {
  return (
    <Link to={to} className="rounded-xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-3 font-display text-base text-primary">{title}</h3>
      <p className="mt-1 min-h-10 text-xs leading-relaxed text-foreground/70">{text}</p>
      <span className="mt-3 block text-xs font-semibold text-primary">{action}</span>
    </Link>
  );
}


function BlocoNoticiasSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-3">
        <div className="aspect-[16/9] rounded-xl bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-7 w-4/5 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

function ListaCardsSkeleton({ colunas = "" }: { colunas?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${colunas}`}>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-36 rounded-xl bg-muted" />
      ))}
    </div>
  );
}

function formatarModalidade(modalidade: OportunidadePublica["modalidade"]) {
  const labels = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Hibrido",
  };

  return labels[modalidade];
}
