import { prisma } from "../../database/prisma.js";
import type { Permissao } from "@prisma/client";
import {
  parseDataInicio,
  parseDataFim,
  formatarDataIsoAlvaraes,
  obterHojeAlvaraes,
  subtrairDiasAlvaraes,
} from "../../common/utils/data-fuso.js";

export type ParametrosBuscarResumo = {
  dataInicio?: string | undefined;
  dataFim?: string | undefined;
  permissoes?: Permissao[] | undefined;
  isMaster?: boolean | undefined;
};

export type MetricaCard = {
  total: number;
  periodo: number;
  anterior: number;
  variacao: number;
  direcao: "subindo" | "descendo" | "estavel";
  textoPeriodo: string;
  textoTendencia: string;
};

export type PontoEvolucao = {
  rotulo: string;
  dataCompleta: string;
  noticias: number;
  comercios: number;
  eventos: number;
  cursos: number;
  total: number;
};

export type ItemDistribuicao = {
  nome: string;
  chave: string;
  total: number;
  periodo: number;
  cor: string;
};

function calcularMetricaCard(
  total: number,
  periodo: number,
  anterior: number,
  diasPeriodo: number,
): MetricaCard {
  let variacao = 0;
  let direcao: "subindo" | "descendo" | "estavel" = "estavel";
  let textoTendencia = "Estável em relação ao período anterior";

  if (anterior === 0) {
    if (periodo === 0) {
      variacao = 0;
      direcao = "estavel";
      textoTendencia = "Sem movimentação recente";
    } else {
      variacao = 100;
      direcao = "subindo";
      textoTendencia = "↑ 100% em relação ao período anterior";
    }
  } else {
    const diff = periodo - anterior;
    variacao = Math.round((diff / anterior) * 100);
    if (variacao > 0) {
      direcao = "subindo";
      textoTendencia = `↑ ${variacao}% em relação ao período anterior`;
    } else if (variacao < 0) {
      direcao = "descendo";
      textoTendencia = `↓ ${Math.abs(variacao)}% em relação ao período anterior`;
    } else {
      direcao = "estavel";
      textoTendencia = "Estável em relação ao período anterior";
    }
  }

  const sufixoDias = diasPeriodo === 1 ? "hoje" : `nos últimos ${diasPeriodo} dias`;
  const textoPeriodo = periodo > 0 ? `+${periodo} ${sufixoDias}` : `0 ${sufixoDias}`;

  return {
    total,
    periodo,
    anterior,
    variacao,
    direcao,
    textoPeriodo,
    textoTendencia,
  };
}

function agruparEvolucao(
  inicio: Date,
  fim: Date,
  noticias: { criadoEm: Date }[],
  comercios: { criadoEm: Date }[],
  eventos: { criadoEm: Date }[],
  cursos: { criadoEm: Date }[],
): PontoEvolucao[] {
  const duracaoMs = fim.getTime() - inicio.getTime();
  const dias = Math.max(1, Math.round(duracaoMs / (24 * 60 * 60 * 1000)));

  const mapaNoticias = new Map<string, number>();
  const mapaComercios = new Map<string, number>();
  const mapaEventos = new Map<string, number>();
  const mapaCursos = new Map<string, number>();

  for (const item of noticias) {
    const k = formatarDataIsoAlvaraes(item.criadoEm);
    mapaNoticias.set(k, (mapaNoticias.get(k) ?? 0) + 1);
  }
  for (const item of comercios) {
    const k = formatarDataIsoAlvaraes(item.criadoEm);
    mapaComercios.set(k, (mapaComercios.get(k) ?? 0) + 1);
  }
  for (const item of eventos) {
    const k = formatarDataIsoAlvaraes(item.criadoEm);
    mapaEventos.set(k, (mapaEventos.get(k) ?? 0) + 1);
  }
  for (const item of cursos) {
    const k = formatarDataIsoAlvaraes(item.criadoEm);
    mapaCursos.set(k, (mapaCursos.get(k) ?? 0) + 1);
  }

  // Até 31 dias: granularidade por dia
  if (dias <= 31) {
    const pontos: PontoEvolucao[] = [];
    const inicioMs = inicio.getTime();
    for (let i = 0; i <= dias; i++) {
      const dataCursor = new Date(inicioMs + i * 24 * 60 * 60 * 1000);
      const chaveIso = formatarDataIsoAlvaraes(dataCursor);
      if (pontos.length > 0 && dataCursor > fim && chaveIso !== formatarDataIsoAlvaraes(fim)) {
        break;
      }
      if (pontos.some((p) => p.dataCompleta === chaveIso)) continue;

      const partes = chaveIso.split("-");
      const dia = partes[2] ?? "01";
      const mes = partes[1] ?? "01";
      const rotulo = `${dia}/${mes}`;

      const qtdNoticias = mapaNoticias.get(chaveIso) ?? 0;
      const qtdComercios = mapaComercios.get(chaveIso) ?? 0;
      const qtdEventos = mapaEventos.get(chaveIso) ?? 0;
      const qtdCursos = mapaCursos.get(chaveIso) ?? 0;
      const total = qtdNoticias + qtdComercios + qtdEventos + qtdCursos;

      pontos.push({
        rotulo,
        dataCompleta: chaveIso,
        noticias: qtdNoticias,
        comercios: qtdComercios,
        eventos: qtdEventos,
        cursos: qtdCursos,
        total,
      });
    }
    return pontos;
  }

  // De 32 a 90 dias: agrupar por semana (7 dias)
  if (dias <= 90) {
    const pontos: PontoEvolucao[] = [];
    let cursorMs = inicio.getTime();
    let indice = 1;

    while (cursorMs <= fim.getTime()) {
      const inicioSemana = new Date(cursorMs);
      const fimSemana = new Date(Math.min(cursorMs + 6 * 24 * 60 * 60 * 1000, fim.getTime()));
      const chaveInicio = formatarDataIsoAlvaraes(inicioSemana);
      const partes = chaveInicio.split("-");
      const dia = partes[2] ?? "01";
      const mes = partes[1] ?? "01";
      const rotulo = `Sem ${indice} (${dia}/${mes})`;

      let qtdNoticias = 0;
      let qtdComercios = 0;
      let qtdEventos = 0;
      let qtdCursos = 0;

      for (let cur = inicioSemana.getTime(); cur <= fimSemana.getTime(); cur += 24 * 60 * 60 * 1000) {
        const k = formatarDataIsoAlvaraes(new Date(cur));
        qtdNoticias += mapaNoticias.get(k) ?? 0;
        qtdComercios += mapaComercios.get(k) ?? 0;
        qtdEventos += mapaEventos.get(k) ?? 0;
        qtdCursos += mapaCursos.get(k) ?? 0;
      }

      pontos.push({
        rotulo,
        dataCompleta: chaveInicio,
        noticias: qtdNoticias,
        comercios: qtdComercios,
        eventos: qtdEventos,
        cursos: qtdCursos,
        total: qtdNoticias + qtdComercios + qtdEventos + qtdCursos,
      });

      cursorMs += 7 * 24 * 60 * 60 * 1000;
      indice++;
    }
    return pontos;
  }

  // Maior que 90 dias: agrupar por mês
  const pontos: PontoEvolucao[] = [];
  const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const mapaMeses = new Map<string, { noticias: number; comercios: number; eventos: number; cursos: number }>();

  for (const item of noticias) {
    const k = formatarDataIsoAlvaraes(item.criadoEm).slice(0, 7);
    const dados = mapaMeses.get(k) ?? { noticias: 0, comercios: 0, eventos: 0, cursos: 0 };
    dados.noticias++;
    mapaMeses.set(k, dados);
  }
  for (const item of comercios) {
    const k = formatarDataIsoAlvaraes(item.criadoEm).slice(0, 7);
    const dados = mapaMeses.get(k) ?? { noticias: 0, comercios: 0, eventos: 0, cursos: 0 };
    dados.comercios++;
    mapaMeses.set(k, dados);
  }
  for (const item of eventos) {
    const k = formatarDataIsoAlvaraes(item.criadoEm).slice(0, 7);
    const dados = mapaMeses.get(k) ?? { noticias: 0, comercios: 0, eventos: 0, cursos: 0 };
    dados.eventos++;
    mapaMeses.set(k, dados);
  }
  for (const item of cursos) {
    const k = formatarDataIsoAlvaraes(item.criadoEm).slice(0, 7);
    const dados = mapaMeses.get(k) ?? { noticias: 0, comercios: 0, eventos: 0, cursos: 0 };
    dados.cursos++;
    mapaMeses.set(k, dados);
  }

  let curAno = inicio.getUTCFullYear();
  let curMes = inicio.getUTCMonth();
  const fimAno = fim.getUTCFullYear();
  const fimMes = fim.getUTCMonth();

  while (curAno < fimAno || (curAno === fimAno && curMes <= fimMes)) {
    const chaveMes = `${curAno}-${String(curMes + 1).padStart(2, "0")}`;
    const abrev = MESES_ABREV[curMes] ?? String(curMes + 1);
    const rotulo = `${abrev}/${String(curAno).slice(-2)}`;
    const dados = mapaMeses.get(chaveMes) ?? { noticias: 0, comercios: 0, eventos: 0, cursos: 0 };

    pontos.push({
      rotulo,
      dataCompleta: chaveMes,
      noticias: dados.noticias,
      comercios: dados.comercios,
      eventos: dados.eventos,
      cursos: dados.cursos,
      total: dados.noticias + dados.comercios + dados.eventos + dados.cursos,
    });

    curMes++;
    if (curMes > 11) {
      curMes = 0;
      curAno++;
    }
  }

  return pontos;
}

export class AdminRepository {
  async buscarResumo(params: ParametrosBuscarResumo = {}) {
    const { dataInicio, dataFim, permissoes = [], isMaster = true } = params;

    // Se datas não forem fornecidas, padrão é os últimos 30 dias
    const hojeIso = obterHojeAlvaraes();
    const dataFimStr = dataFim || hojeIso;
    const dataInicioStr = dataInicio || subtrairDiasAlvaraes(29);

    const inicioAtual = parseDataInicio(dataInicioStr);
    const fimAtual = parseDataFim(dataFimStr);

    const duracaoMs = Math.max(24 * 60 * 60 * 1000, fimAtual.getTime() - inicioAtual.getTime());
    const fimAnterior = new Date(inicioAtual.getTime() - 1);
    const inicioAnterior = new Date(inicioAtual.getTime() - duracaoMs);
    const diasPeriodo = Math.max(1, Math.round(duracaoMs / (24 * 60 * 60 * 1000)));

    const podeVerNoticias = isMaster || permissoes.includes("NOTICIAS");
    const podeVerComercios = isMaster || permissoes.includes("COMERCIOS");
    const podeVerEventos = isMaster || permissoes.includes("EVENTOS");
    const podeVerCursos = isMaster || permissoes.includes("CURSOS");
    const podeVerAnuncios = isMaster || permissoes.includes("ANUNCIOS");
    const podeVerContatos = isMaster || permissoes.includes("CONTATOS");
    const podeVerBoletim = isMaster || permissoes.includes("BOLETIM");
    const podeVerUsuarios = isMaster || permissoes.includes("USUARIOS");
    const podeVerAuditoria = isMaster || permissoes.includes("AUDITORIA");

    const [
      // Notícias
      totalNoticias,
      periodoNoticias,
      anteriorNoticias,
      noticiasDemo,
      // Comércios
      totalComercios,
      periodoComercios,
      anteriorComercios,
      comerciosDemo,
      // Eventos
      totalEventos,
      periodoEventos,
      anteriorEventos,
      eventosDemo,
      // Cursos (Oportunidades)
      totalCursos,
      periodoCursos,
      anteriorCursos,
      cursosDemo,
      // Anúncios
      totalAnuncios,
      periodoAnuncios,
      anteriorAnuncios,
      // Contatos
      totalContatos,
      periodoContatos,
      anteriorContatos,
      // Boletim
      totalBoletim,
      periodoBoletim,
      anteriorBoletim,
      // Usuários
      totalUsuarios,
      periodoUsuarios,
      anteriorUsuarios,
      // Listagens
      noticiasRecentes,
      atividadesRecentes,
      // Datas para gráfico de evolução
      noticiasDatas,
      comerciosDatas,
      eventosDatas,
      cursosDatas,
    ] = await Promise.all([
      podeVerNoticias ? prisma.noticia.count() : 0,
      podeVerNoticias ? prisma.noticia.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerNoticias ? prisma.noticia.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,
      podeVerNoticias ? prisma.noticia.count({ where: { demonstracao: true } }) : 0,

      podeVerComercios ? prisma.comercio.count() : 0,
      podeVerComercios ? prisma.comercio.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerComercios ? prisma.comercio.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,
      podeVerComercios ? prisma.comercio.count({ where: { demonstracao: true } }) : 0,

      podeVerEventos ? prisma.evento.count() : 0,
      podeVerEventos ? prisma.evento.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerEventos ? prisma.evento.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,
      podeVerEventos ? prisma.evento.count({ where: { demonstracao: true } }) : 0,

      podeVerCursos ? prisma.oportunidade.count() : 0,
      podeVerCursos ? prisma.oportunidade.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerCursos ? prisma.oportunidade.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,
      podeVerCursos ? prisma.oportunidade.count({ where: { demonstracao: true } }) : 0,

      podeVerAnuncios ? prisma.pedidoAnuncio.count() : 0,
      podeVerAnuncios ? prisma.pedidoAnuncio.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerAnuncios ? prisma.pedidoAnuncio.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,

      podeVerContatos ? prisma.contato.count() : 0,
      podeVerContatos ? prisma.contato.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerContatos ? prisma.contato.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,

      podeVerBoletim ? prisma.inscritoBoletim.count({ where: { ativo: true } }) : 0,
      podeVerBoletim ? prisma.inscritoBoletim.count({ where: { ativo: true, criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerBoletim ? prisma.inscritoBoletim.count({ where: { ativo: true, criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,

      podeVerUsuarios ? prisma.usuario.count() : 0,
      podeVerUsuarios ? prisma.usuario.count({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } } }) : 0,
      podeVerUsuarios ? prisma.usuario.count({ where: { criadoEm: { gte: inicioAnterior, lte: fimAnterior } } }) : 0,

      podeVerNoticias
        ? prisma.noticia.findMany({
            orderBy: [{ criadoEm: "desc" }],
            take: 5,
            select: { id: true, slug: true, titulo: true, publicadoEm: true, criadoEm: true, status: true },
          })
        : [],

      podeVerAuditoria
        ? prisma.logAuditoria.findMany({
            orderBy: { criadoEm: "desc" },
            take: 5,
            select: {
              id: true,
              usuarioNome: true,
              usuarioEmail: true,
              acao: true,
              recurso: true,
              recursoId: true,
              tituloRecurso: true,
              descricao: true,
              criadoEm: true,
            },
          })
        : [],

      podeVerNoticias
        ? prisma.noticia.findMany({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } }, select: { criadoEm: true } })
        : [],
      podeVerComercios
        ? prisma.comercio.findMany({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } }, select: { criadoEm: true } })
        : [],
      podeVerEventos
        ? prisma.evento.findMany({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } }, select: { criadoEm: true } })
        : [],
      podeVerCursos
        ? prisma.oportunidade.findMany({ where: { criadoEm: { gte: inicioAtual, lte: fimAtual } }, select: { criadoEm: true } })
        : [],
    ]);

    const evolucao = agruparEvolucao(
      inicioAtual,
      fimAtual,
      noticiasDatas,
      comerciosDatas,
      eventosDatas,
      cursosDatas,
    );

    const distribuicao: ItemDistribuicao[] = [
      ...(podeVerNoticias ? [{ nome: "Notícias", chave: "noticias", total: totalNoticias, periodo: periodoNoticias, cor: "#062f1f" }] : []),
      ...(podeVerEventos ? [{ nome: "Eventos", chave: "eventos", total: totalEventos, periodo: periodoEventos, cor: "#c9502c" }] : []),
      ...(podeVerCursos ? [{ nome: "Cursos", chave: "cursos", total: totalCursos, periodo: periodoCursos, cor: "#d97706" }] : []),
      ...(podeVerComercios ? [{ nome: "Comércios", chave: "comercios", total: totalComercios, periodo: periodoComercios, cor: "#0284c7" }] : []),
    ];

    const cards = {
      noticias: calcularMetricaCard(totalNoticias, periodoNoticias, anteriorNoticias, diasPeriodo),
      comercios: calcularMetricaCard(totalComercios, periodoComercios, anteriorComercios, diasPeriodo),
      eventos: calcularMetricaCard(totalEventos, periodoEventos, anteriorEventos, diasPeriodo),
      cursos: calcularMetricaCard(totalCursos, periodoCursos, anteriorCursos, diasPeriodo),
      anuncios: calcularMetricaCard(totalAnuncios, periodoAnuncios, anteriorAnuncios, diasPeriodo),
      contatos: calcularMetricaCard(totalContatos, periodoContatos, anteriorContatos, diasPeriodo),
      inscritosBoletim: calcularMetricaCard(totalBoletim, periodoBoletim, anteriorBoletim, diasPeriodo),
      usuarios: calcularMetricaCard(totalUsuarios, periodoUsuarios, anteriorUsuarios, diasPeriodo),
    };

    return {
      contagens: {
        noticias: totalNoticias,
        comercios: totalComercios,
        eventos: totalEventos,
        cursos: totalCursos,
        inscritosBoletim: totalBoletim,
        usuarios: totalUsuarios,
        contatos: totalContatos,
        anuncios: totalAnuncios,
      },
      cards,
      evolucao,
      distribuicao,
      periodo: {
        dataInicio: formatarDataIsoAlvaraes(inicioAtual),
        dataFim: formatarDataIsoAlvaraes(fimAtual),
        dias: diasPeriodo,
      },
      demo: {
        noticias: noticiasDemo,
        comercios: comerciosDemo,
        eventos: eventosDemo,
        cursos: cursosDemo,
        total: noticiasDemo + comerciosDemo + eventosDemo + cursosDemo,
      },
      noticiasRecentes,
      atividadesRecentes: atividadesRecentes.map((log) => ({
        id: log.id,
        usuarioNome: log.usuarioNome,
        usuarioEmail: log.usuarioEmail,
        acao: log.acao,
        recurso: log.recurso,
        recursoId: log.recursoId,
        tituloRecurso: log.tituloRecurso,
        descricao: log.descricao,
        criadoEm: log.criadoEm.toISOString(),
      })),
    };
  }
}

