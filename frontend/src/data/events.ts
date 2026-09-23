export type CityEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  time?: string;
  place: string;
  organizer: string;
  description: string;
  entry: string;
  contact?: string;
  isDemo: boolean;
};

export const events: CityEvent[] = [
  {
    id: "demo-festejo",
    title: "Demonstração — Festejo da comunidade",
    category: "Festejo",
    date: "2026-10-12",
    time: "19h",
    place: "Praça central (exemplo)",
    organizer: "Organizador fictício",
    description:
      "Evento fictício criado para avaliar o layout da agenda. Nenhuma data ou organização real está sendo divulgada.",
    entry: "Entrada não informada",
    contact: "Contato ainda não fornecido",
    isDemo: true,
  },
  {
    id: "demo-feira",
    title: "Demonstração — Feira de produtores",
    category: "Feira",
    date: "2026-11-08",
    time: "07h às 12h",
    place: "Espaço de exemplo",
    organizer: "Organizador fictício",
    description: "Conteúdo fictício de demonstração.",
    entry: "Entrada gratuita (exemplo)",
    isDemo: true,
  },
  {
    id: "demo-encontro",
    title: "Demonstração — Encontro cultural encerrado",
    category: "Cultura",
    date: "2026-07-20",
    place: "Espaço de exemplo",
    organizer: "Organizador fictício",
    description: "Conteúdo fictício de demonstração, já com data passada.",
    entry: "Entrada não informada",
    isDemo: true,
  },
];
