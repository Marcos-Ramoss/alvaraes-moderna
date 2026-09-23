# Cronograma de Evolução: Alvarães Moderna (Roadmap V2)

Este documento mapeia os próximos passos e funcionalidades sugeridas para transformar o portal em uma plataforma de uso diário, essencial para a população de Alvarães. As tarefas estão divididas em fases, priorizando o que traz mais valor rápido (Quick Wins) até as estruturas mais complexas.

---

## Fase 1: Utilidade Pública e Acesso (Quick Wins)
*Foco: Fazer o morador salvar o site nos favoritos e facilitar o acesso.*

- [ ] **1. Guia de Utilidade Pública & Plantões**
  - **Descrição:** Módulo simples na página inicial com informações fixas e vitais.
  - **Backend:** Criar tabela `UtilidadePublica` (Título, Descrição, Ícone, Categoria).
  - **Frontend:** Exibir blocos como "Farmácia de Plantão", "Emergências (Polícia/Hospital)", "Horários de Balsa/Barco".
  - **Admin:** CRUD simples para atualizar quem está de plantão na semana.

- [x] **2. Transformar o site em PWA (App Mobile)**
  - **Descrição:** Configurar o portal para ser "instalável" no celular.
  - **Frontend:** Adicionar `manifest.json`, configurar ícones (192x192, 512x512), e registrar um *Service Worker* básico para cache offline.
  - **Impacto:** O usuário ganha um ícone do "Alvarães Moderna" junto aos outros apps do celular, abrindo em tela cheia.

---

## Fase 2: Engajamento e Voz Ativa (Médio Prazo)
*Foco: Fazer o morador interagir com o site, em vez de apenas ler.*

- [ ] **3. Sistema de Enquetes da Cidade**
  - **Descrição:** Votações rápidas sobre temas da cidade (ex: "Qual melhor horário para a feira?").
  - **Backend:** Criar modelos `Enquete` e `OpcaoEnquete`. Lógica para bloquear duplo voto (por IP ou LocalStorage temporário).
  - **Frontend:** Componente interativo que revela a porcentagem após o voto.
  - **Admin:** Interface para criar perguntas, definir opções e ver resultados.

- [ ] **4. Avaliações e Estrelas nos Comércios**
  - **Descrição:** Sistema estilo "TripAdvisor" local.
  - **Backend:** Criar modelo `AvaliacaoComercio` (nota de 1 a 5, comentário, nome, aprovado).
  - **Frontend:** Exibir média de estrelas no card do comércio. Formulário para enviar review.
  - **Admin:** Aproveitar a lógica do componente genérico de aprovar/rejeitar (AdminCrudPage) para moderar as avaliações antes de irem ao ar.

---

## Fase 3: Geração de Valor Econômico (Longo Prazo)
*Foco: Tornar a plataforma indispensável para a economia local e gestão.*

- [ ] **5. Painel de Vagas de Emprego**
  - **Descrição:** Central de oportunidades de trabalho na cidade.
  - **Backend:** Criar modelo `VagaEmprego` (relacionado opcionalmente a um `Comercio`), com campos como cargo, salário, requisitos e status (aberta/fechada).
  - **Frontend:** Página dedicada "/vagas" com filtros. Formulário para o cidadão enviar currículo ou chamar direto no WhatsApp da empresa.
  - **Admin:** Gerenciamento das vagas ativas.

- [ ] **6. Dashboard Avançado com Gráficos**
  - **Descrição:** Melhorar a página "Visão Geral" do painel de administração.
  - **Backend:** Criar endpoints analíticos (agrupamento de cadastros por mês, comércios mais acessados).
  - **Frontend:** Instalar e configurar biblioteca de gráficos (como *Recharts* ou *Chart.js*). Mostrar linha de crescimento de usuários do Boletim, visualizações, etc.
  - **Impacto:** Essencial para mostrar dados a futuros anunciantes e provar o engajamento da plataforma.

---

## Como usar este documento
- Marque com um `x` entre os colchetes `[x]` conforme formos finalizando cada etapa.
- Novas ideias podem ser adicionadas diretamente nas respectivas fases ou em uma "Fase 4".


