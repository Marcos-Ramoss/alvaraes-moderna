import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Alvarães Moderna — portal local de Alvarães (AM)" },
      {
        name: "description",
        content:
          "O Alvarães Moderna reúne noticias, cultura, serviços e oportunidades da cidade de Alvarães, no Amazonas.",
      },
      { property: "og:title", content: "Sobre o Alvarães Moderna" },
      {
        property: "og:description",
        content: "Portal independente de noticias e serviços de Alvarães (AM).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-primary">
        Sobre o Alvarães Moderna
      </h1>
      <p className="mt-4 text-lg text-foreground/80">
        O Alvarães Moderna nasceu para ampliar a presença da nossa cidade na internet,
        facilitar o acesso à informação e dar visibilidade aos negócios locais.
      </p>
      <p className="mt-4 text-lg text-foreground/80">
        Reunimos noticias, cultura, serviços e oportunidades em um espaço feito para
        moradores, visitantes e pessoas que mantêm sua ligação com Alvarães, onde quer que
        estejam.
      </p>

      <section className="mt-8 rounded-xl bg-secondary p-5">
        <h2 className="font-display text-xl font-semibold">Transparência</h2>
        <p className="mt-2 text-foreground/80">
          Portal independente, sem vínculo institucional com a Prefeitura de Alvarães.
          Publicidade e conteúdo patrocinado são identificados.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta é a primeira versão do portal. As publicações marcadas como “Demonstração —
          conteúdo fictício” existem apenas para avaliar o layout e serão removidas antes da
          publicação pública.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/contato"
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Falar com a equipe
        </Link>
        <Link
          to="/anuncie"
          className="rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary"
        >
          Anuncie
        </Link>
      </div>
    </div>
  );
}
