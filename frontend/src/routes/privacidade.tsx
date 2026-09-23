import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Alvarães Moderna" },
      {
        name: "description",
        content:
          "Como o portal Alvarães Moderna trata dados de quem navega pelo site nesta primeira versão.",
      },
      { property: "og:title", content: "Política de privacidade — Alvarães Moderna" },
      {
        property: "og:description",
        content: "Informações sobre dados e privacidade no portal Alvarães Moderna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-primary">
        Política de privacidade
      </h1>
      <p className="mt-4 text-foreground/80">
        Nesta primeira versão, o Alvarães Moderna não coleta cadastros, não utiliza login de
        visitantes, não possui comentários públicos e não executa ferramentas de análise de
        audiência ou publicidade de terceiros.
      </p>
      <p className="mt-4 text-foreground/80">
        As páginas carregam fontes tipográficas hospedadas pelo Google Fonts, o que implica
        uma requisição ao servidor desse serviço.
      </p>
      <p className="mt-4 text-foreground/80">
        Caso, no futuro, sejam adicionados formulários, newsletter ou medição de audiência,
        este texto será atualizado com a descrição dos dados coletados, a finalidade e a
        forma de contato para solicitações.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        Documento preliminar, sujeito a revisão antes da publicação pública do portal.
      </p>
    </div>
  );
}
