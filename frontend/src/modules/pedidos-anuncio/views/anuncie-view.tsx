import { FormEvent, useState } from "react";
import { publicFormsApi, type CriarPedidoAnuncioPayload } from "@/lib/public-forms-api";

const LIMITE_MENSAGEM = 3000;

const options = [
  {
    title: "Cadastro básico",
    text: "Nome do estabelecimento, categoria, localização resumida e uma forma de contato dentro do guia comercial.",
  },
  {
    title: "Página comercial completa",
    text: "Uma página dentro do portal com descrição, fotos, produtos ou serviços, horários informados, endereço, telefone, WhatsApp e redes sociais.",
  },
  {
    title: "Destaque patrocinado",
    text: "Posicao de maior visibilidade em listagens, sempre identificada com o rotulo de destaque patrocinado.",
  },
];

export function AnuncieView() {
  const [form, setForm] = useState<CriarPedidoAnuncioPayload>({
    tipo: "CADASTRO_BASICO",
    nomeResponsavel: "",
    contatoResponsavel: "",
    nomeComercio: "",
    categoriaPretendida: "",
    localizacaoResumida: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function enviarPedido(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setMensagem("");
    setErro("");

    try {
      const payload: CriarPedidoAnuncioPayload = {
        tipo: form.tipo,
        nomeResponsavel: form.nomeResponsavel.trim(),
        contatoResponsavel: form.contatoResponsavel.trim(),
        nomeComercio: form.nomeComercio.trim(),
        ...(form.categoriaPretendida?.trim()
          ? { categoriaPretendida: form.categoriaPretendida.trim() }
          : {}),
        ...(form.localizacaoResumida?.trim()
          ? { localizacaoResumida: form.localizacaoResumida.trim() }
          : {}),
        ...(form.mensagem?.trim() ? { mensagem: form.mensagem.trim() } : {}),
      };
      const resposta = await publicFormsApi.enviarPedidoAnuncio(payload);
      setMensagem(resposta.mensagem);
      setForm({
        tipo: "CADASTRO_BASICO",
        nomeResponsavel: "",
        contatoResponsavel: "",
        nomeComercio: "",
        categoriaPretendida: "",
        localizacaoResumida: "",
        mensagem: "",
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Seu comercio faz parte da cidade. Faca parte do guia.
        </h1>
        <p className="mt-3 text-lg text-foreground/80">
          Apresente seu negócio a quem procura produtos e serviços em Alvarães.
        </p>
        <p className="mt-3 text-foreground/80">
          Envie os dados iniciais do seu estabelecimento. A equipe do portal vai analisar o pedido
          e entrar em contato para combinar os próximos passos.
        </p>

        <ul className="mt-8 space-y-4">
          {options.map((opcao) => (
            <li key={opcao.title} className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-semibold">{opcao.title}</h2>
              <p className="mt-2 text-foreground/80">{opcao.text}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-xl bg-secondary p-5 text-sm text-muted-foreground">
          Valores, prazos e condições serão informados diretamente pela equipe do portal após o
          recebimento do pedido.
        </p>
      </section>

      <form onSubmit={enviarPedido} className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-primary">Solicitar anúncio</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Preencha os dados abaixo para registrar seu interesse.
        </p>

        {mensagem && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {mensagem}
          </p>
        )}
        {erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {erro}
          </p>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Tipo de anúncio</span>
            <select
              value={form.tipo}
              onChange={(event) =>
                setForm({ ...form, tipo: event.target.value as CriarPedidoAnuncioPayload["tipo"] })
              }
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            >
              <option value="CADASTRO_BASICO">Cadastro básico</option>
              <option value="PAGINA_COMPLETA">Página completa</option>
              <option value="DESTAQUE_PATROCINADO">Destaque patrocinado</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Nome do responsavel</span>
            <input
              value={form.nomeResponsavel}
              onChange={(event) => setForm({ ...form, nomeResponsavel: event.target.value })}
              required
              minLength={2}
              maxLength={120}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Contato do responsavel</span>
            <input
              value={form.contatoResponsavel}
              onChange={(event) => setForm({ ...form, contatoResponsavel: event.target.value })}
              required
              minLength={5}
              maxLength={180}
              placeholder="E-mail, telefone ou WhatsApp"
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Nome do comercio</span>
            <input
              value={form.nomeComercio}
              onChange={(event) => setForm({ ...form, nomeComercio: event.target.value })}
              required
              minLength={2}
              maxLength={160}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Categoria pretendida</span>
            <input
              value={form.categoriaPretendida}
              onChange={(event) => setForm({ ...form, categoriaPretendida: event.target.value })}
              maxLength={120}
              placeholder="Alimentacao, comercio, serviços..."
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Localizacao resumida</span>
            <input
              value={form.localizacaoResumida}
              onChange={(event) => setForm({ ...form, localizacaoResumida: event.target.value })}
              maxLength={160}
              placeholder="Centro, bairro, comunidade..."
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>Mensagem</span>
              <span className="text-xs text-muted-foreground">
                {(form.mensagem ?? "").length}/{LIMITE_MENSAGEM}
              </span>
            </span>
            <textarea
              value={form.mensagem}
              onChange={(event) => setForm({ ...form, mensagem: event.target.value })}
              maxLength={LIMITE_MENSAGEM}
              rows={4}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
        >
          {enviando ? "Enviando..." : "Enviar pedido"}
        </button>
      </form>
    </div>
  );
}
