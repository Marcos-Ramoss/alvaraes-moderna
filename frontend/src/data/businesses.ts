export type Business = {
  slug: string;
  name: string;
  category: string;
  area: string;
  description?: string;
  services?: string[];
  hours?: string[];
  address?: string;
  phone?: string;
  whatsapp?: string;
  social?: { label: string; url: string }[];
  externalUrl?: string;
  /** cadastro básico = sem página interna */
  hasPage: boolean;
  sponsored?: boolean;
  isDemo: boolean;
};

export const businessCategories = [
  "Alimentação",
  "Comércio",
  "Serviços",
  "Saúde",
  "Transporte",
];

export const businesses: Business[] = [
  {
    slug: "demonstracao-restaurante-beira-rio",
    name: "Demonstração — Restaurante Beira Rio",
    category: "Alimentação",
    area: "Centro",
    description:
      "Estabelecimento fictício usado apenas para demonstrar a página comercial completa dentro do portal.",
    services: ["Almoço", "Peixe assado", "Encomendas"],
    whatsapp: "",
    hasPage: true,
    sponsored: true,
    isDemo: true,
  },
  {
    slug: "demonstracao-mercadinho-do-bairro",
    name: "Demonstração — Mercadinho do Bairro",
    category: "Comércio",
    area: "Bairro São José",
    hasPage: false,
    isDemo: true,
  },
  {
    slug: "demonstracao-oficina-motor-lago",
    name: "Demonstração — Oficina Motor do Lago",
    category: "Serviços",
    area: "Orla",
    description:
      "Exemplo de cadastro com página interna, sem contatos reais preenchidos.",
    services: ["Manutenção de motores", "Peças"],
    hasPage: true,
    isDemo: true,
  },
  {
    slug: "demonstracao-farmacia-central",
    name: "Demonstração — Farmácia Central",
    category: "Saúde",
    area: "Centro",
    hasPage: false,
    isDemo: true,
  },
  {
    slug: "demonstracao-transporte-fluvial",
    name: "Demonstração — Transporte Fluvial Alvarães",
    category: "Transporte",
    area: "Porto",
    hasPage: false,
    isDemo: true,
  },
];

export function getBusiness(slug: string) {
  return businesses.find((b) => b.slug === slug);
}
