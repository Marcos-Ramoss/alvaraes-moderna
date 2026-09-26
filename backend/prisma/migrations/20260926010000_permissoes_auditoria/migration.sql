-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('MASTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Permissao" AS ENUM ('NOTICIAS', 'COMERCIOS', 'EVENTOS', 'CURSOS', 'COMENTARIOS', 'BOLETIM', 'CONTATOS', 'ANUNCIOS', 'USUARIOS', 'AUDITORIA');

-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('CRIAR', 'ATUALIZAR', 'EXCLUIR', 'PUBLICAR', 'STATUS', 'LOGIN');

-- CreateEnum
CREATE TYPE "RecursoAuditoria" AS ENUM ('NOTICIA', 'COMERCIO', 'EVENTO', 'CURSO', 'COMENTARIO', 'CONTATO', 'PEDIDO_ANUNCIO', 'USUARIO', 'SISTEMA');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "role" "RoleUsuario" NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "usuario_permissoes" (
    "usuario_id" TEXT NOT NULL,
    "permissao" "Permissao" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_permissoes_pkey" PRIMARY KEY ("usuario_id","permissao")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "usuario_nome" VARCHAR(120) NOT NULL,
    "usuario_email" VARCHAR(180) NOT NULL,
    "acao" "AcaoAuditoria" NOT NULL,
    "recurso" "RecursoAuditoria" NOT NULL,
    "recurso_id" VARCHAR(180),
    "titulo_recurso" VARCHAR(250),
    "descricao" TEXT NOT NULL,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "ip" VARCHAR(60),
    "user_agent" VARCHAR(255),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_auditoria_usuario_id_criado_em_idx" ON "logs_auditoria"("usuario_id", "criado_em");

-- CreateIndex
CREATE INDEX "logs_auditoria_recurso_criado_em_idx" ON "logs_auditoria"("recurso", "criado_em");

-- CreateIndex
CREATE INDEX "logs_auditoria_acao_criado_em_idx" ON "logs_auditoria"("acao", "criado_em");

-- CreateIndex
CREATE INDEX "logs_auditoria_criado_em_idx" ON "logs_auditoria"("criado_em");

-- AddForeignKey
ALTER TABLE "usuario_permissoes" ADD CONSTRAINT "usuario_permissoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Set existing admin user to MASTER
UPDATE "usuarios" SET "role" = 'MASTER' WHERE "email" = 'admin@alvaraesmoderna.com.br';
