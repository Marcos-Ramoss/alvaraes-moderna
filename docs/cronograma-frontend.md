# Cronograma de Ajustes do Frontend

Objetivo: transformar o frontend em uma aplicacao com aparencia profissional, responsiva, consistente e conectada aos endpoints reais do backend.

Este cronograma segue as diretrizes de `docs/frontend-profissional.md`.

## Etapa 1 - Padrao Visual e Componentes Base

Status: concluida na primeira rodada para tokens/classes base do painel admin.

- Revisar tokens visuais em `frontend/src/styles.css`.
- Padronizar botoes, inputs, textareas, selects, badges e estados de foco.
- Usar componentes existentes em `frontend/src/components/ui/` antes de criar novos.
- Evitar estilos duplicados espalhados pelas rotas.
- Garantir container centralizado e consistente nas telas publicas.
- Manter paleta editorial/local, sem excesso de gradientes, sombras ou efeitos.

## Etapa 2 - Painel Admin: Estrutura Geral

- Revisar `AdminShell`.
- Melhorar responsividade do menu lateral em mobile.
- Padronizar cabecalhos das telas administrativas.
- Revisar dashboard `/admin`.
- Garantir estados de loading, erro e vazio.
- Melhorar atalhos do dashboard para abrir cadastro correto.
- Revisar textos para ficarem claros e naturais.

## Etapa 3 - Painel Admin: CRUDs

Status: concluida na primeira rodada.

- Manter telas abrindo em modo listagem.
- Botao "Novo" deve abrir formulario de cadastro.
- Botao "Editar" deve abrir formulario preenchido.
- Botao "Cancelar" deve fechar formulario e limpar estado.
- Evitar formulario aberto sem contexto.
- Revisar tabelas em desktop e mobile.
- Criar estrategia mobile para listas grandes.
- Substituir `window.confirm` por modal profissional de confirmacao.
- Usar feedback visual consistente para sucesso e erro.
- Evitar acoes duplicadas ou botoes sem funcao real.

## Etapa 4 - Painel Admin: Formularios Grandes

Status: concluida na primeira rodada, com possibilidade de evoluir depois para `react-hook-form` + `zod`.

- Separar formularios longos em etapas/abas.
- Aplicar etapas como:
  - Dados principais
  - Detalhes
  - Contato
  - Publicacao
- Avaliar uso de `react-hook-form` com `zod`.
- Validar campos obrigatorios antes do envio.
- Exibir mensagens de erro claras.
- Padronizar labels, placeholders e textos auxiliares.
- Garantir area de toque adequada no mobile.

## Etapa 5 - Noticias

Status: concluida na primeira rodada.

- Revisar tela publica de listagem de noticias.
- Revisar tela publica de detalhe da noticia.
- Trocar mocks por endpoints reais:
  - `GET /api/noticias`
  - `GET /api/noticias/:slug`
- Revisar formulario admin de cadastro/edicao.
- Separar formulario em etapas.
- Melhorar campos de corpo, resumo, fontes, categoria e publicacao.
- Garantir empty state quando nao houver noticias.

## Etapa 6 - Comercios

Status: concluida na primeira rodada.

- Revisar listagem publica do guia comercial.
- Revisar detalhe de comercio.
- Trocar mocks por endpoints reais:
  - `GET /api/comercios`
  - `GET /api/comercios/:slug`
- Revisar formulario admin com etapas.
- Melhorar campos de servicos, horarios, contatos e pagina completa.
- Garantir que informacoes comerciais fiquem faceis de escanear.

## Etapa 7 - Agenda/Eventos

Status: concluida na primeira rodada.

- Revisar tela publica de agenda.
- Trocar mocks por endpoint real:
  - `GET /api/eventos`
- Garantir separacao entre eventos futuros e encerrados.
- Revisar formulario admin de eventos.
- Melhorar campos de data, horario, local, organizador, entrada e fonte.
- Garantir boa experiencia mobile.

## Etapa 8 - Cursos e Oportunidades

Status: concluida na primeira rodada.

- Revisar tela publica de cursos e oportunidades.
- Trocar mocks por endpoints reais:
  - `GET /api/oportunidades`
  - alias publico `GET /api/cursos`
- Separar oportunidades abertas e encerradas.
- Revisar formulario admin.
- Melhorar campos de modalidade, prazo, requisitos, custo e link de inscricao.
- Garantir destaque claro para prazo e chamada de inscricao.

## Etapa 9 - Boletim

- Revisar pagina publica `/boletim`.
- Consumir endpoints reais:
  - `GET /api/boletim/previa`
  - `POST /api/boletim/inscrever`
- Melhorar estados de loading, erro, sucesso e inscrito duplicado.
- Revisar formulario de inscricao com labels reais.
- Revisar painel admin `/admin/boletim`.
- Melhorar listagem de inscritos.
- Avaliar exportacao futura de inscritos.

## Etapa 10 - Usuarios

- Definir escopo inicial da tela `/admin/usuarios`.
- Listar usuarios administrativos quando endpoint existir.
- Revisar estado placeholder enquanto backend nao estiver completo.
- Garantir que a tela nao pareca quebrada ou abandonada.

## Etapa 11 - Home Page

Status: concluida na primeira rodada.

- Revisar hierarquia editorial da home.
- Trocar mocks por endpoints reais quando possivel.
- Destacar noticia principal.
- Organizar noticias secundarias.
- Incluir blocos de agenda, cursos/oportunidades, comercio e boletim.
- Evitar blocos repetidos com o mesmo peso visual.
- Garantir excelente experiencia mobile.

## Etapa 12 - Qualidade Final

- Rodar validacao TypeScript:

```bash
npx tsc -p frontend/tsconfig.json --noEmit
```

- Revisar visualmente em larguras:
  - 360px
  - 390px
  - 430px
  - 768px
  - 1024px
  - 1280px
- Verificar textos quebrando.
- Verificar overflow horizontal.
- Verificar contraste e foco.
- Verificar estados vazios.
- Verificar formularios grandes.
- Verificar navegacao por teclado nos modais.
- Nao rodar build frontend sem autorizacao.

## Prioridade Imediata

1. Finalizar padrao profissional do painel admin.
2. Conectar telas publicas aos endpoints reais.
3. Revisar home page com hierarquia editorial.
4. Fazer revisao responsiva geral.
5. Preparar checklist final antes de deploy.
