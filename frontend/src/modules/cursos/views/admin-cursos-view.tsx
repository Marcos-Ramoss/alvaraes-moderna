import {
  AdminCrudPage,
  booleano,
  formatarDataPtBr,
  imagensParaPayload,
  paraDatetimeLocal,
  paraIsoDatetime,
  textoObrigatorio,
  textoOpcional,
} from "@/components/admin/admin-crud-page";
import { adminApi } from "@/lib/admin-api";
import type { CursoAdmin, SalvarCursoPayload } from "../types/curso.types";
import { MediaLightbox } from "@/components/media-lightbox";

export function AdminCursosView() {
  return (
    <AdminCrudPage<CursoAdmin, SalvarCursoPayload>
      titulo="Cursos"
      subtitulo="Gerencie cursos, vagas, inscrições e oportunidades para a comunidade."
      etiqueta="Curso"
      entidadeParaMassa="CURSO"
      novoRotulo="Novo curso"
      formularioInicial={{
        titulo: "",
        organizador: "",
        modalidade: "PRESENCIAL",
        local: "",
        prazo: "",
        requisitos: "",
        custo: "Gratuito",
        linkInscrição: "",
        categoriaSlug: "cursos",
        imagens: [],
        videoUrl: "",
        videoTitulo: "",
        videoOrigem: "YOUTUBE",
        demonstracao: false,
        status: "RASCUNHO",
      }}
      listar={adminApi.listarCursos}
      criar={adminApi.criarCurso}
      atualizar={adminApi.atualizarCurso}
      publicar={adminApi.publicarCurso}
      excluir={adminApi.excluirCurso}
      obterId={(item) => item.id}
      obterTitulo={(item) => item.titulo}
      buscarTexto={(item) => `${item.titulo} ${item.organizador} ${item.modalidade}`}
      renderPreview={(form: any) => (
        <div className="rounded-lg border border-admin-border bg-gray-50/50 p-5 shadow-sm max-h-[55vh] sm:max-h-[500px] overflow-y-auto">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {form.categoriaSlug?.replace("-", " ") || "CURSOS"}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-primary">
              {form.titulo || "Título do Curso aparecerá aqui..."}
            </h1>
            <p className="mt-3 text-sm text-foreground/80 font-medium">
              Oferecido por: {form.organizador || "Organizador..."}
            </p>
          </div>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-admin-border bg-white p-4">
              <h3 className="font-semibold text-primary text-sm mb-2">Informações Gerais</h3>
              <p className="text-sm text-muted-foreground mb-1"><strong>Modalidade:</strong> {form.modalidade}</p>
              <p className="text-sm text-muted-foreground mb-1"><strong>Custo:</strong> {form.custo || "Gratuito"}</p>
              <p className="text-sm text-muted-foreground mb-1"><strong>Local:</strong> {form.local || "Não informado"}</p>
            </div>
            <div className="rounded-lg border border-admin-border bg-white p-4">
              <h3 className="font-semibold text-primary text-sm mb-2">Inscrição</h3>
              <p className="text-sm text-muted-foreground mb-2"><strong>Prazo:</strong> {form.prazo ? formatarDataPtBr(form.prazo) : "Não informado"}</p>
              {form.linkInscrição && <span className="text-xs text-blue-600 underline">Link configurado</span>}
            </div>
          </div>
          <div className="space-y-4 font-display text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {form.requisitos || "Os requisitos do curso aparecerão aqui..."}
          </div>
          {form.imagens && form.imagens.length > 0 && form.imagens[0]?.url && (
            <div className="mt-6">
              <MediaLightbox
                images={form.imagens.map((imagem: any, index: number) => ({
                  id: String(index),
                  url: imagem.url,
                  alt: imagem.textoAlternativo || form.titulo || `Imagem ${index + 1}`
                }))}
                title={form.titulo || "Imagens do Curso"}
              />
            </div>
          )}
        </div>
      )}
      colunas={[
        { label: "Titulo", valor: (item) => <strong>{item.titulo}</strong> },
        { label: "Organizador", valor: (item) => item.organizador },
        { label: "Modalidade", valor: (item) => item.modalidade },
        { label: "Prazo", valor: (item) => formatarDataPtBr(item.prazo) },
      ]}
      campos={[
        {
          chave: "titulo",
          label: "Nome do curso ou oportunidade",
          tipo: "text",
          obrigatorio: true,
          etapa: "Dados principais",
        },
        {
          chave: "organizador",
          label: "Instituicao ou organizador",
          tipo: "text",
          obrigatorio: true,
          etapa: "Dados principais",
        },
        {
          chave: "modalidade",
          label: "Modalidade",
          tipo: "select",
          obrigatorio: true,
          etapa: "Dados principais",
          opcoes: [
            { valor: "PRESENCIAL", label: "Presencial" },
            { valor: "ONLINE", label: "Online" },
            { valor: "HIBRIDO", label: "Hibrido" },
          ],
        },
        { chave: "local", label: "Local", tipo: "text", etapa: "Dados principais" },
        {
          chave: "prazo",
          label: "Prazo de inscrição",
          tipo: "datetime",
          obrigatorio: true,
          etapa: "Detalhes",
        },
        {
          chave: "requisitos",
          label: "Requisitos",
          tipo: "textarea",
          etapa: "Detalhes",
          largo: true,
        },
        { chave: "custo", label: "Custo", tipo: "text", etapa: "Detalhes" },
        { chave: "linkInscrição", label: "Link de inscrição", tipo: "url", etapa: "Detalhes" },
        {
          chave: "imagens",
          label: "Imagens",
          tipo: "imagens",
          etapa: "Midias",
          largo: true,
        },
        { chave: "videoUrl", label: "Link do video", tipo: "url", etapa: "Midias" },
        { chave: "videoTitulo", label: "Titulo do video", tipo: "text", etapa: "Midias" },
        { chave: "videoOrigem", label: "Origem do video", tipo: "text", etapa: "Midias" },
        {
          chave: "categoriaSlug",
          label: "Categoria",
          tipo: "select",
          etapa: "Publicação",
          opcoes: [
            { valor: "cursos", label: "Cursos" },
            { valor: "vagas", label: "Vagas" },
            { valor: "inscricoes", label: "Inscrições" },
          ],
        },
        {
          chave: "status",
          label: "Status",
          tipo: "select",
          etapa: "Publicação",
          opcoes: [
            { valor: "RASCUNHO", label: "Rascunho" },
            { valor: "PUBLICADO", label: "Publicado" },
            { valor: "ARQUIVADO", label: "Arquivado" },
          ],
        },
        {
          chave: "demonstracao",
          label: "Conteúdo de demonstracao",
          tipo: "checkbox",
          etapa: "Publicação",
        },
      ]}
      paraFormulario={(item) => ({
        titulo: item.titulo,
        organizador: item.organizador,
        modalidade: item.modalidade,
        local: item.local ?? "",
        prazo: paraDatetimeLocal(item.prazo),
        requisitos: item.requisitos ?? "",
        custo: item.custo ?? "",
        linkInscrição: item.linkInscricao ?? "",
        categoriaSlug: item.categoria?.slug ?? "cursos",
        imagens: (item.imagens ?? [])
          .filter((midia) => midia.tipoMidia === "IMAGEM")
          .sort((a, b) => a.ordem - b.ordem)
          .map((midia) => ({
            url: midia.url,
            textoAlternativo: midia.textoAlternativo ?? "",
            credito: midia.credito ?? "",
            origem: midia.origem ?? "UPLOAD_ADMIN",
            tamanhoBytes: midia.tamanhoBytes ? String(midia.tamanhoBytes) : "",
          })),
        videoUrl: item.video?.url ?? "",
        videoTitulo: item.video?.titulo ?? "",
        videoOrigem: item.video?.origem ?? "YOUTUBE",
        demonstracao: item.demonstracao,
        status: item.status,
      })}
      paraPayload={(form) => {
        const local = textoOpcional(form["local"]);
        const requisitos = textoOpcional(form["requisitos"]);
        const custo = textoOpcional(form["custo"]);
        const linkInscrição = textoOpcional(form["linkInscrição"]);
        const imagens = imagensParaPayload(form["imagens"]);
        const videoUrl = textoOpcional(form["videoUrl"]);
        const videoTitulo = textoOpcional(form["videoTitulo"]);
        const videoOrigem = textoOpcional(form["videoOrigem"]);
        const payload: SalvarCursoPayload = {
          titulo: textoObrigatorio(form, "titulo"),
          organizador: textoObrigatorio(form, "organizador"),
          modalidade: form["modalidade"] as SalvarCursoPayload["modalidade"],
          prazo: paraIsoDatetime(form["prazo"]),
          categoriaSlug: textoObrigatorio(form, "categoriaSlug"),
          demonstracao: booleano(form, "demonstracao"),
          status: form["status"] as SalvarCursoPayload["status"],
        };

        if (local) payload.local = local;
        if (requisitos) payload.requisitos = requisitos;
        if (custo) payload.custo = custo;
        if (linkInscrição) payload.linkInscricao = linkInscrição;
        if (imagens.length) payload.imagens = imagens;
        payload.video = videoUrl
          ? {
              url: videoUrl,
              ...(videoTitulo ? { titulo: videoTitulo } : {}),
              origem: videoOrigem ?? "LINK_EXTERNO",
            }
          : null;

        return payload;
      }}
    />
  );
}
