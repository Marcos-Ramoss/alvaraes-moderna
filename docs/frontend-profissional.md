Você é responsável pela qualidade visual e experiência do usuário do frontend deste projeto.

O objetivo é construir uma interface com aparência profissional, moderna, organizada, responsiva e intuitiva, evitando qualquer aspecto de interface genérica ou excessivamente produzida por IA.

## OBJETIVO VISUAL

O frontend deve transmitir:

* organização;
* confiança;
* clareza;
* simplicidade;
* boa legibilidade;
* identidade de portal editorial/local;
* excelente experiência principalmente em dispositivos móveis.

A interface deve parecer desenvolvida por uma equipe profissional de UI/UX.

Não priorize efeitos visuais. Priorize hierarquia, proporção, alinhamento, espaçamento e usabilidade.

---

# 1. REGRA PRINCIPAL DE LAYOUT

Todo conteúdo principal deve utilizar um container centralizado.

Exemplo conceitual:

```css
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding-left: 24px;
    padding-right: 24px;
}
```

Em telas menores:

```css
padding-left: 16px;
padding-right: 16px;
```

Evitar conteúdos encostados nas bordas da tela.

Evitar também seções com larguras diferentes sem motivo.

O alinhamento vertical entre:

* header;
* banners;
* notícias;
* agenda;
* oportunidades;
* guia comercial;
* footer;

deve seguir preferencialmente o mesmo container.

---

# 2. SISTEMA DE ESPAÇAMENTO

Não utilizar margens aleatórias como:

```css
margin: 13px;
margin-top: 37px;
padding: 19px;
```

Trabalhar com uma escala consistente:

```text
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
```

Valores mais usados:

* 8px → separações pequenas;
* 12px → elementos internos;
* 16px → espaçamento padrão mobile;
* 24px → padding de cards;
* 32px → separação entre pequenos blocos;
* 48px → separação entre grupos;
* 64px → espaçamento entre seções;
* 80px → grandes separações desktop.

Manter simetria sempre que possível.

Se um card possui:

```css
padding: 24px;
```

os quatro lados devem começar com 24px, salvo necessidade visual explícita.

---

# 3. HIERARQUIA VISUAL

Cada tela deve deixar claro imediatamente:

1. onde o usuário está;
2. qual é o conteúdo principal;
3. quais informações são secundárias;
4. quais elementos são clicáveis.

Não deixar todos os textos com tamanho ou peso parecido.

Exemplo de hierarquia:

```text
Título principal
32px / 36px / semibold ou bold

Título de seção
24px / semibold

Título de card
18px / semibold

Texto
15px ou 16px / normal

Metadados
13px ou 14px

Labels
12px ou 13px / medium
```

Em mobile, reduzir proporcionalmente.

Evitar títulos gigantes.

Não utilizar títulos de 50px–70px em páginas comuns de conteúdo.

---

# 4. TIPOGRAFIA

Usar no máximo:

* 1 família tipográfica principal;
* ocasionalmente uma segunda fonte somente se houver justificativa forte.

Priorizar fontes modernas e legíveis.

Exemplos:

* Inter;
* Geist;
* Manrope;
* Source Sans 3.

Manter `line-height` confortável.

Textos longos não devem ocupar toda a largura disponível.

Para conteúdo editorial, limitar a largura de leitura quando necessário.

---

# 5. CORES

Utilizar uma paleta reduzida.

Deve existir:

* cor principal;
* cor secundária, se necessária;
* cor de destaque;
* fundo;
* superfícies;
* texto principal;
* texto secundário;
* bordas;
* estados de sucesso, alerta e erro.

Evitar:

* várias cores competindo;
* gradientes sem propósito;
* neon;
* excesso de transparência;
* glassmorphism em todos os componentes;
* sombras muito fortes.

O portal deve parecer institucional/editorial, e não uma landing page de startup de IA.

---

# 6. CARDS

Cards devem existir somente quando ajudarem a separar informações.

Não transformar tudo em card.

Evitar:

```text
card dentro de card dentro de card
```

Um card deve normalmente possuir:

```css
border-radius: 8px a 12px;
padding: 16px a 24px;
border: 1px solid;
```

Sombras devem ser discretas.

Evitar grandes sombras flutuantes.

Manter mesma linguagem visual entre cards semelhantes.

---

# 7. BORDAS E BORDER-RADIUS

Não utilizar diferentes border-radius arbitrariamente.

Criar escala, por exemplo:

```text
6px  → elementos pequenos
8px  → inputs e botões
12px → cards
16px → componentes maiores
```

Evitar:

```text
7px
13px
17px
23px
```

sem justificativa.

---

# 8. BOTÕES

Criar estilos consistentes:

* Primary
* Secondary
* Ghost
* Danger, quando necessário

Todos devem possuir:

* mesma altura;
* mesma lógica de padding;
* mesmo border-radius;
* estados hover;
* focus;
* disabled;
* loading.

Exemplo:

```text
altura: 40–44px
padding horizontal: 16–20px
```

Não criar um estilo diferente para cada botão.

Evitar vários CTAs principais concorrendo na mesma seção.

---

# 9. ÍCONES

Usar apenas uma biblioteca de ícones em todo projeto.

Exemplos:

* Lucide;
* Material Icons;
* Heroicons.

Não misturar diferentes estilos.

Ícones devem complementar texto, não substituir informação importante sem necessidade.

Evitar ícones decorativos espalhados apenas para preencher espaço.

---

# 10. RESPONSIVIDADE

O desenvolvimento deve ser mobile-first.

Testar obrigatoriamente:

```text
360px
390px
430px
768px
1024px
1280px+
```

Nenhum componente pode depender somente de desktop.

Garantir que:

* textos não estourem;
* imagens não deformem;
* cards reorganizem corretamente;
* menus funcionem em telas pequenas;
* grids reduzam colunas progressivamente;
* tabelas tenham estratégia mobile;
* botões tenham área de toque confortável;
* elementos não fiquem colados.

Um grid desktop como:

```text
4 colunas
```

pode evoluir para:

```text
desktop → 4
tablet → 2
mobile → 1
```

quando fizer sentido.

Não aplicar breakpoints apenas porque existem. O layout deve mudar quando o conteúdo precisar.

---

# 11. HEADER

O header deve ser simples e organizado.

Evitar colocar informação demais nele.

A navegação deve deixar claramente visíveis as principais áreas do portal.

No mobile:

* utilizar menu apropriado;
* evitar dezenas de links expostos;
* garantir fácil fechamento;
* preservar acesso às funções principais.

O header não deve ocupar uma parte exagerada da tela.

---

# 12. HOME PAGE

Evitar uma home composta apenas por blocos idênticos.

Criar hierarquia editorial.

Exemplo:

```text
Notícia principal

Notícias secundárias

Últimas notícias

Agenda da cidade

Cursos e oportunidades

Cultura

Guia comercial

Conteúdo de utilidade pública
```

Nem todas essas áreas precisam ter o mesmo peso visual.

A notícia principal deve claramente possuir mais destaque que uma notícia comum.

---

# 13. IMAGENS

Imagens devem utilizar proporções previsíveis.

Exemplo:

```css
aspect-ratio: 16 / 9;
object-fit: cover;
```

Nunca deixar imagens deformadas.

Utilizar tamanhos consistentes entre conteúdos da mesma categoria.

Evitar imagens gigantes sem necessidade.

---

# 14. ESTADOS DA INTERFACE

Componentes que dependem de dados devem considerar:

* loading;
* empty state;
* erro;
* sucesso;
* conteúdo carregado.

Não deixar áreas simplesmente vazias.

Loading deve utilizar skeleton quando fizer sentido.

---

# 15. FORMULÁRIOS

Inputs devem possuir:

* label clara;
* placeholder quando útil;
* mensagem de validação;
* estado de erro;
* focus visível;
* tamanho adequado para toque.

Não utilizar apenas placeholder como identificação do campo.

Manter espaçamento consistente entre campos.

---

# 16. ACESSIBILIDADE

Garantir:

* contraste adequado;
* HTML semântico;
* navegação por teclado;
* estados `focus`;
* `aria-label` quando necessário;
* `alt` nas imagens;
* botões reais para ações;
* links reais para navegação.

Não transformar `<div>` em botão sem necessidade.

---

# 17. CONSISTÊNCIA

Antes de criar um componente novo, verificar se já existe um componente equivalente.

Reutilizar:

* Button;
* Card;
* Badge;
* Input;
* Select;
* Modal;
* SectionTitle;
* NewsCard;
* EmptyState;
* Skeleton;
* Pagination.

Não duplicar estilos em dezenas de arquivos.

Criar componentes reutilizáveis quando houver repetição real.

---

# 18. EVITAR APARÊNCIA DE INTERFACE GERADA POR IA

Evitar especificamente:

* excesso de gradientes;
* cards em absolutamente tudo;
* textos gigantes;
* dezenas de badges;
* excesso de ícones;
* sombras muito fortes;
* border-radius exagerado;
* glassmorphism;
* elementos flutuantes sem função;
* animações em tudo;
* muitas cores;
* seções artificialmente grandes;
* frases promocionais genéricas;
* layouts excessivamente centralizados;
* botões enormes;
* cards com informações desnecessárias;
* excesso de espaços vazios sem motivo.

A aparência deve ser natural, editorial e funcional.

---

# 19. ANIMAÇÕES

Utilizar animações somente quando melhorarem a experiência.

Preferir:

```text
150ms–250ms
```

para hover, abertura e transições simples.

Evitar:

* bounce;
* elementos entrando de todos os lados;
* animações contínuas;
* cards flutuando;
* efeitos excessivos no scroll.

---

# 20. CSS / DESIGN TOKENS

Sempre que possível, centralizar tokens.

Exemplo:

```css
:root {
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;
    --space-3xl: 64px;

    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;

    --container-width: 1200px;
}
```

Não repetir números arbitrários por todo o projeto.

---

# 21. REGRA PARA ALTERAÇÕES

Ao implementar ou modificar uma tela:

1. analisar os componentes existentes;
2. preservar a identidade visual existente quando estiver correta;
3. identificar inconsistências;
4. reutilizar componentes;
5. aplicar o sistema de espaçamento;
6. revisar responsividade;
7. revisar alinhamento;
8. revisar hierarquia tipográfica;
9. revisar estados;
10. revisar acessibilidade.

Não modificar regras de negócio apenas para melhorar o frontend.

Não alterar APIs ou contratos backend sem necessidade.

---

# 22. CHECKLIST ANTES DE CONSIDERAR UMA TELA FINALIZADA

Pergunte:

* Os elementos estão alinhados?
* Os espaçamentos seguem uma escala?
* Existe simetria visual?
* A hierarquia está clara?
* Existe espaço suficiente entre seções?
* Existe espaço demais?
* Funciona bem em 360px?
* Funciona bem em desktop?
* Algum texto quebra de forma estranha?
* Alguma imagem deforma?
* Os botões são consistentes?
* Os cards são realmente necessários?
* As cores estão coerentes?
* O usuário sabe facilmente onde clicar?
* Existe alguma decoração sem função?
* Parece um produto profissional?

Se alguma dessas respostas for negativa, ajuste antes de finalizar.

---

# RESULTADO ESPERADO

O portal deve apresentar uma experiência visual semelhante a produtos digitais profissionais, com forte preocupação em:

```text
alinhamento
+ espaçamento
+ hierarquia
+ responsividade
+ legibilidade
+ consistência
+ simplicidade
```

Sempre prefira:

```text
simples e bem executado
```

em vez de:

```text
complexo e visualmente chamativo.
```
