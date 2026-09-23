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
import type { EventoAdmin, SalvarEventoPayload } from "../types/evento.types";
import { MediaLightbox } from "@/components/media-lightbox";

export function AdminEventosView() {
  return (
    <AdminCrudPage<EventoAdmin, SalvarEventoPayload>
      titulo="Agenda"
      subtitulo="Cadastre eventos, datas importantes e atividades da cidade."
      etiqueta="Evento"
      entidadeParaMassa="EVENTO"
      novoRotulo="Novo evento"
      formularioInicial={{
        titulo: "",
        categoriaSlug: "festejo",
        data: "",
        horario: "",
        local: "",
        organizador: "",
        descrição: "",
        entrada: "Entrada gratuita",
        contato: "",
        fonte: "",
        imagens: [],
        videoUrl: "",
        videoTitulo: "",
        videoOrigem: "YOUTUBE",
        demonstracao: false,
        status: "RASCUNHO",
      }}
      listar={adminApi.listarEventos}
      criar={adminApi.criarEvento}
      atualizar={adminApi.atualizarEvento}
      publicar={adminApi.publicarEvento}
      excluir={adminApi.excluirEvento}
      obterId={(item) => item.id}
      obterTitulo={(item) => item.titulo}
      buscarTexto={(item) => `${item.titulo} ${item.local} ${item.categoria.nome}`}
      renderPreview={(form: any) => (
        <div className="rounded-lg border border-admin-border bg-gray-50/50 p-5 shadow-sm max-h-[55vh] sm:max-h-[500px] overflow-y-auto">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {form.categoriaSlug?.replace("-", " ") || "EVENTO"}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-primary">
              {form.titulo || "Nome do evento aparecerá aqui..."}
            </h1>
            <p className="mt-3 text-sm text-foreground/80 font-medium">
              Data: {form.data ? formatarDataPtBr(form.data) : "Não informada"} {form.horario && `• ${form.horario}`}
            </p>
          </div>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-admin-border bg-white p-4">
              <h3 className="font-semibold text-primary text-sm mb-2">Onde e Quem</h3>
              <p className="text-sm text-muted-foreground mb-1"><strong>Local:</strong> {form.local || "Não informado"}</p>
              <p className="text-sm text-muted-foreground mb-1"><strong>Organizador:</strong> {form.organizador || "Não informado"}</p>
              {form.contato && <p className="text-sm text-muted-foreground mb-1"><strong>Contato:</strong> {form.contato}</p>}
            </div>
            <div className="rounded-lg border border-admin-border bg-white p-4">
              <h3 className="font-semibold text-primary text-sm mb-2">Entrada</h3>
              <p className="text-sm text-muted-foreground mb-2">{form.entrada || "Entrada não informada"}</p>
            </div>
          </div>
          <div className="space-y-4 font-display text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {form.descrição || form.descriǜo || "A descrição do evento aparecerá aqui..."}
          </div>
          {form.imagens && form.imagens.length > 0 && form.imagens[0]?.url && (
            <div className="mt-6">
              <MediaLightbox
                images={form.imagens.map((imagem: any, index: number) => ({
                  id: String(index),
                  url: imagem.url,
                  alt: imagem.textoAlternativo || form.titulo || `Imagem ${index + 1}`
                }))}
                title={form.titulo || "Imagens do Evento"}
              />
            </div>
          )}
        </div>
      )}
      colunas={[
        { label: "Titulo", valor: (item) => <strong>{item.titulo}</strong> },
        { label: "Categoria", valor: (item) => item.categoria.nome },
        { label: "Data", valor: (item) => formatarDataPtBr(item.data) },
        { label: "Status", valor: (item) => item.status },
      ]}
      campos={[
        {
          chave: "titulo",
          label: "Nome do evento",
          tipo: "text",
          obrigatorio: true,
          etapa: "Dados principais",
        },
        {
          chave: "categoriaSlug",
          label: "Categoria",
          tipo: "select",
          obrigatorio: true,
          etapa: "Dados principais",
          opcoes: [
            { valor: "festejo", label: "Festejo" },
            { valor: "feira", label: "Feira" },
            { valor: "cultura", label: "Cultura" },
          ],
        },
        {
          chave: "data",
          label: "Data e hora",
          tipo: "datetime",
          obrigatorio: true,
          etapa: "Dados principais",
        },
        { chave: "horario", label: "Horário exibido", tipo: "text", etapa: "Dados principais" },
        { chave: "local", label: "Local", tipo: "text", obrigatorio: true, etapa: "Detalhes" },
        {
          chave: "organizador",
          label: "Organizador",
          tipo: "text",
          obrigatorio: true,
          etapa: "Detalhes",
        },
        {
          chave: "descrição",
          label: "Descrição",
          tipo: "textarea",
          obrigatorio: true,
          etapa: "Detalhes",
          largo: true,
        },
        { chave: "entrada", label: "Entrada", tipo: "text", obrigatorio: true, etapa: "Detalhes" },
        { chave: "contato", label: "Contato", tipo: "text", etapa: "Contato e fonte" },
        { chave: "fonte", label: "Fonte", tipo: "text", etapa: "Contato e fonte" },
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
        categoriaSlug: item.categoria.slug,
        data: paraDatetimeLocal(item.data),
        horario: item.horario ?? "",
        local: item.local,
        organizador: item.organizador,
        descrição: item.descrição,
        entrada: item.entrada,
        contato: item.contato ?? "",
        fonte: item.fonte ?? "",
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
        const horario = textoOpcional(form["horario"]);
        const contato = textoOpcional(form["contato"]);
        const fonte = textoOpcional(form["fonte"]);
        const imagens = imagensParaPayload(form["imagens"]);
        const videoUrl = textoOpcional(form["videoUrl"]);
        const videoTitulo = textoOpcional(form["videoTitulo"]);
        const videoOrigem = textoOpcional(form["videoOrigem"]);
        const payload: SalvarEventoPayload = {
          titulo: textoObrigatorio(form, "titulo"),
          categoriaSlug: textoObrigatorio(form, "categoriaSlug"),
          data: paraIsoDatetime(form["data"]),
          local: textoObrigatorio(form, "local"),
          organizador: textoObrigatorio(form, "organizador"),
          descrição: textoObrigatorio(form, "descrição"),
          entrada: textoObrigatorio(form, "entrada"),
          demonstracao: booleano(form, "demonstracao"),
          status: form["status"] as SalvarEventoPayload["status"],
        };

        if (horario) payload.horario = horario;
        if (contato) payload.contato = contato;
        if (fonte) payload.fonte = fonte;
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
