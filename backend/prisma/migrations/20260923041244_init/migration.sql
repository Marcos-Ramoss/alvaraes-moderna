-- CreateEnum
CREATE TYPE "StatusPublicacao" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "TipoConteudoNoticia" AS ENUM ('NOTICIA', 'OPINIAO', 'PATROCINADO');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('NOTICIA', 'COMERCIO', 'EVENTO', 'OPORTUNIDADE');

-- CreateEnum
CREATE TYPE "ModalidadeOportunidade" AS ENUM ('PRESENCIAL', 'ONLINE', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "TipoContato" AS ENUM ('SUGESTAO_PAUTA', 'CORRECAO', 'MENSAGEM_GERAL');

-- CreateEnum
CREATE TYPE "StatusContato" AS ENUM ('NOVO', 'EM_ANALISE', 'RESPONDIDO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "TipoPedidoAnuncio" AS ENUM ('CADASTRO_BASICO', 'PAGINA_COMPLETA', 'DESTAQUE_PATROCINADO');

-- CreateEnum
CREATE TYPE "StatusPedidoAnuncio" AS ENUM ('NOVO', 'EM_CONTATO', 'CONVERTIDO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "TipoVinculoMidia" AS ENUM ('NOTICIA', 'COMERCIO', 'EVENTO', 'OPORTUNIDADE', 'SITE');

-- CreateEnum
CREATE TYPE "TipoMidia" AS ENUM ('IMAGEM', 'VIDEO');

-- CreateEnum
CREATE TYPE "TipoEntidade" AS ENUM ('NOTICIA', 'COMERCIO', 'EVENTO', 'CURSO');

-- CreateEnum
CREATE TYPE "StatusComentario" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "tipo" "TipoCategoria" NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noticias" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "resumo" VARCHAR(300) NOT NULL,
    "corpo" JSONB NOT NULL,
    "fontes" JSONB,
    "autor_nome" VARCHAR(120) NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "tipo_conteudo" "TipoConteudoNoticia" NOT NULL DEFAULT 'NOTICIA',
    "status" "StatusPublicacao" NOT NULL DEFAULT 'RASCUNHO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "demonstracao" BOOLEAN NOT NULL DEFAULT false,
    "imagem_url" VARCHAR(500),
    "imagem_alt" VARCHAR(250),
    "imagem_credito" VARCHAR(250),
    "publicado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,
    "autor_id" TEXT,

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comercios" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "nome" VARCHAR(160) NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "area" VARCHAR(120) NOT NULL,
    "descricao" TEXT,
    "servicos" JSONB,
    "horarios" JSONB,
    "endereco" VARCHAR(250),
    "telefone" VARCHAR(40),
    "whatsapp" VARCHAR(40),
    "redes_sociais" JSONB,
    "site_externo" VARCHAR(500),
    "possui_pagina" BOOLEAN NOT NULL DEFAULT false,
    "patrocinado" BOOLEAN NOT NULL DEFAULT false,
    "demonstracao" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusPublicacao" NOT NULL DEFAULT 'RASCUNHO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comercios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" VARCHAR(80),
    "local" VARCHAR(180) NOT NULL,
    "organizador" VARCHAR(180) NOT NULL,
    "descricao" TEXT NOT NULL,
    "entrada" VARCHAR(180) NOT NULL,
    "contato" VARCHAR(180),
    "fonte" VARCHAR(250),
    "demonstracao" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusPublicacao" NOT NULL DEFAULT 'RASCUNHO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oportunidades" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "organizador" VARCHAR(180) NOT NULL,
    "modalidade" "ModalidadeOportunidade" NOT NULL,
    "local" VARCHAR(180),
    "prazo" TIMESTAMP(3) NOT NULL,
    "requisitos" TEXT,
    "custo" VARCHAR(120),
    "link_inscricao" VARCHAR(500),
    "categoria_id" TEXT,
    "demonstracao" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusPublicacao" NOT NULL DEFAULT 'RASCUNHO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oportunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "midias" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "tipo_midia" "TipoMidia" NOT NULL DEFAULT 'IMAGEM',
    "titulo" VARCHAR(180),
    "texto_alternativo" VARCHAR(250),
    "credito" VARCHAR(250),
    "origem" VARCHAR(250),
    "tamanho_bytes" INTEGER,
    "duracao_segundos" INTEGER,
    "tipo_vinculo" "TipoVinculoMidia" NOT NULL,
    "registro_id" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contatos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoContato" NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "contato_resposta" VARCHAR(180) NOT NULL,
    "assunto" VARCHAR(160),
    "mensagem" TEXT NOT NULL,
    "status" "StatusContato" NOT NULL DEFAULT 'NOVO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscritos_boletim" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "origem" VARCHAR(80) NOT NULL DEFAULT 'site',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscritos_boletim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_anuncio" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPedidoAnuncio" NOT NULL,
    "nome_responsavel" VARCHAR(120) NOT NULL,
    "contato_responsavel" VARCHAR(180) NOT NULL,
    "nome_comercio" VARCHAR(160) NOT NULL,
    "categoria_pretendida" VARCHAR(120),
    "localizacao_resumida" VARCHAR(160),
    "mensagem" TEXT,
    "status" "StatusPedidoAnuncio" NOT NULL DEFAULT 'NOVO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_site" (
    "id" TEXT NOT NULL,
    "nome_portal" VARCHAR(120) NOT NULL DEFAULT 'Alvaraes Moderna',
    "dominio" VARCHAR(180) NOT NULL DEFAULT 'alvaraesmoderna.com.br',
    "slogan" VARCHAR(180) NOT NULL DEFAULT 'Alvaraes perto de voce.',
    "texto_independencia_editorial" TEXT NOT NULL,
    "email_oficial" VARCHAR(180),
    "whatsapp_oficial" VARCHAR(40),
    "redes_sociais" JSONB,
    "formulario_contato_ativo" BOOLEAN NOT NULL DEFAULT false,
    "exibir_demonstracao_em_producao" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curtidas" (
    "id" TEXT NOT NULL,
    "entidade_tipo" "TipoEntidade" NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curtidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" TEXT NOT NULL,
    "entidade_tipo" "TipoEntidade" NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "autor_nome" VARCHAR(120) NOT NULL,
    "autor_email" VARCHAR(180),
    "conteudo" TEXT NOT NULL,
    "status" "StatusComentario" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_tipo_key" ON "categorias"("slug", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "noticias_slug_key" ON "noticias"("slug");

-- CreateIndex
CREATE INDEX "noticias_status_publicado_em_idx" ON "noticias"("status", "publicado_em");

-- CreateIndex
CREATE INDEX "noticias_categoria_id_idx" ON "noticias"("categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "comercios_slug_key" ON "comercios"("slug");

-- CreateIndex
CREATE INDEX "comercios_status_idx" ON "comercios"("status");

-- CreateIndex
CREATE INDEX "comercios_categoria_id_idx" ON "comercios"("categoria_id");

-- CreateIndex
CREATE INDEX "eventos_status_data_idx" ON "eventos"("status", "data");

-- CreateIndex
CREATE INDEX "eventos_categoria_id_idx" ON "eventos"("categoria_id");

-- CreateIndex
CREATE INDEX "oportunidades_status_prazo_idx" ON "oportunidades"("status", "prazo");

-- CreateIndex
CREATE INDEX "oportunidades_categoria_id_idx" ON "oportunidades"("categoria_id");

-- CreateIndex
CREATE INDEX "midias_tipo_vinculo_registro_id_idx" ON "midias"("tipo_vinculo", "registro_id");

-- CreateIndex
CREATE INDEX "contatos_status_criado_em_idx" ON "contatos"("status", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "inscritos_boletim_email_key" ON "inscritos_boletim"("email");

-- CreateIndex
CREATE INDEX "inscritos_boletim_ativo_criado_em_idx" ON "inscritos_boletim"("ativo", "criado_em");

-- CreateIndex
CREATE INDEX "pedidos_anuncio_status_criado_em_idx" ON "pedidos_anuncio"("status", "criado_em");

-- CreateIndex
CREATE INDEX "curtidas_entidade_tipo_entidade_id_idx" ON "curtidas"("entidade_tipo", "entidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "curtidas_entidade_tipo_entidade_id_cliente_id_key" ON "curtidas"("entidade_tipo", "entidade_id", "cliente_id");

-- CreateIndex
CREATE INDEX "comentarios_entidade_tipo_entidade_id_status_idx" ON "comentarios"("entidade_tipo", "entidade_id", "status");

-- AddForeignKey
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comercios" ADD CONSTRAINT "comercios_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
