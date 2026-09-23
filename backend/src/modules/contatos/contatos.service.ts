import type { StatusContato } from "@prisma/client";
import type { AtualizarStatusContatoRequestDto } from "./dto/atualizar-status-contato.request.dto.js";
import type { CriarContatoRequestDto } from "./dto/criar-contato.request.dto.js";
import { ContatosMapper } from "./contatos.mapper.js";
import { ContatosRepository } from "./contatos.repository.js";
import { ContatosRules } from "./contatos.rules.js";

export class ContatosService {
  constructor(
    private readonly contatosRepository = new ContatosRepository(),
    private readonly contatosMapper = new ContatosMapper(),
    private readonly contatosRules = new ContatosRules(),
  ) {}

  async criarContato(dto: CriarContatoRequestDto) {
    const contato = await this.contatosRepository.criar({
      tipo: dto.tipo,
      nome: dto.nome,
      contatoResposta: dto.contatoResposta,
      mensagem: dto.mensagem,
      ...(dto.assunto ? { assunto: dto.assunto } : {}),
    });

    return {
      mensagem: "Mensagem recebida com sucesso.",
      dados: this.contatosMapper.paraResponse(contato),
    };
  }

  async listarContatos() {
    const contatos = await this.contatosRepository.listar();
    return contatos.map((contato) => this.contatosMapper.paraResponse(contato));
  }

  async atualizarStatus(id: string, dto: AtualizarStatusContatoRequestDto) {
    const contatoAtual = await this.contatosRepository.buscarPorId(id);
    this.contatosRules.validarEncontrado(contatoAtual);

    const contato = await this.contatosRepository.atualizarStatus(
      id,
      dto.status as StatusContato,
    );

    return this.contatosMapper.paraResponse(contato);
  }
}
