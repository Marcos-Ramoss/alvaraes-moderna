ALTER TABLE "noticias" ADD COLUMN "total_leituras" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "leituras_noticias" (
    "noticia_id" TEXT NOT NULL,
    "cliente_hash" CHAR(64) NOT NULL,
    "dia" DATE NOT NULL,
    CONSTRAINT "leituras_noticias_pkey" PRIMARY KEY ("noticia_id", "cliente_hash", "dia"),
    CONSTRAINT "leituras_noticias_noticia_id_fkey" FOREIGN KEY ("noticia_id") REFERENCES "noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "noticias_status_total_leituras_publicado_em_idx" ON "noticias"("status", "total_leituras", "publicado_em");
