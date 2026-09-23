export type Opportunity = {
  id: string;
  title: string;
  provider: string;
  mode: "Presencial" | "Online" | "Híbrido";
  place?: string;
  deadline: string;
  requirements?: string;
  cost?: string;
  applyUrl?: string;
  isDemo: boolean;
};

export const opportunities: Opportunity[] = [
  {
    id: "demo-curso-informatica",
    title: "Demonstração — Curso básico de informática",
    provider: "Instituição fictícia",
    mode: "Presencial",
    place: "Local de exemplo",
    deadline: "2026-10-30",
    requirements: "Requisitos de exemplo",
    cost: "Custo não informado",
    isDemo: true,
  },
  {
    id: "demo-vaga-atendimento",
    title: "Demonstração — Vaga de atendimento",
    provider: "Empregador fictício",
    mode: "Presencial",
    place: "Centro (exemplo)",
    deadline: "2026-09-25",
    requirements: "Requisitos de exemplo",
    isDemo: true,
  },
  {
    id: "demo-curso-online",
    title: "Demonstração — Curso online encerrado",
    provider: "Instituição fictícia",
    mode: "Online",
    deadline: "2026-06-01",
    cost: "Gratuito (exemplo)",
    isDemo: true,
  },
];
