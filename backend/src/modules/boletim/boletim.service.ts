import { BoletimMapper } from "./boletim.mapper.js";
import { BoletimRepository } from "./boletim.repository.js";
import { BoletimRules } from "./boletim.rules.js";
import type { InscreverBoletimRequestDto } from "./dto/inscrever-boletim.request.dto.js";

export class BoletimService {
  constructor(
    private readonly boletimRepository = new BoletimRepository(),
    private readonly boletimMapper = new BoletimMapper(),
    private readonly boletimRules = new BoletimRules(),
  ) {}

  async inscrever(dto: InscreverBoletimRequestDto) {
    const inscritoExistente = await this.boletimRepository.buscarInscritoPorEmail(dto.email);
    this.boletimRules.validarNovoInscrito(inscritoExistente);

    const inscrito = inscritoExistente
      ? await this.boletimRepository.reativarInscrito(inscritoExistente.id, {
          nome: dto.nome,
          origem: "site",
        })
      : await this.boletimRepository.criarInscrito({
          nome: dto.nome,
          email: dto.email,
          origem: "site",
        });

    return {
      mensagem: "Inscricao realizada com sucesso.",
      dados: this.boletimMapper.paraInscrito(inscrito),
    };
  }

  async listarInscritos() {
    const inscritos = await this.boletimRepository.listarInscritos();
    return inscritos.map((inscrito) => this.boletimMapper.paraInscrito(inscrito));
  }

  async removerInscrito(id: string) {
    const inscrito = await this.boletimRepository.buscarInscritoPorId(id);
    this.boletimRules.validarInscritoEncontrado(inscrito);
    await this.boletimRepository.removerInscrito(id);
    return { mensagem: "Inscrito removido do boletim." };
  }

  async montarPreviaSemanal() {
    const agora = new Date();
    const periodoSemana = this.boletimRules.calcularPeriodoDaSemana(agora);
    const periodoProximosDias = this.boletimRules.calcularPeriodoProximosDias(agora);

    const [contagemInscritos, noticiasDaSemana, agendaProximosDias, inscricoesAbertas] =
      await Promise.all([
        this.boletimRepository.contarInscritos(),
        this.boletimRepository.listarNoticiasDaSemana(periodoSemana.inicio, periodoSemana.fim),
        this.boletimRepository.listarEventosProximosDias(
          periodoProximosDias.inicio,
          periodoProximosDias.fim,
        ),
        this.boletimRepository.listarInscricoesAbertas(agora),
      ]);

    return this.boletimMapper.paraPrevia({
      periodo: periodoSemana,
      contagemInscritos,
      noticiasDaSemana,
      agendaProximosDias,
      inscricoesAbertas,
    });
  }
}
