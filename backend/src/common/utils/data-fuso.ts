// Fuso oficial do município de Alvarães / Manaus (Amazonas: UTC-4)
export const FUSO_ALVARAES = "-04:00";

export function parseDataInicio(data: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return new Date(`${data}T00:00:00.000${FUSO_ALVARAES}`);
  }
  return new Date(data);
}

export function parseDataFim(data: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return new Date(`${data}T23:59:59.999${FUSO_ALVARAES}`);
  }
  return new Date(data);
}

export function formatarDataIsoAlvaraes(d: Date): string {
  const deslocamentoMs = 4 * 60 * 60 * 1000;
  const dataAlvaraes = new Date(d.getTime() - deslocamentoMs);
  return dataAlvaraes.toISOString().slice(0, 10);
}

export function obterHojeAlvaraes(): string {
  return formatarDataIsoAlvaraes(new Date());
}

export function subtrairDiasAlvaraes(dias: number, dataBase = new Date()): string {
  const deslocamentoMs = 4 * 60 * 60 * 1000 + dias * 24 * 60 * 60 * 1000;
  const dataAlvaraes = new Date(dataBase.getTime() - deslocamentoMs);
  return dataAlvaraes.toISOString().slice(0, 10);
}
