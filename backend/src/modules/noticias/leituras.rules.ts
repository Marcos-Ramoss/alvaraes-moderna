import { createHmac } from "node:crypto";

export class LeiturasRules {
  identificarCliente(clienteId: string, segredo: string) {
    return createHmac("sha256", segredo).update(clienteId).digest("hex");
  }

  obterDiaLocal(agora = new Date()) {
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Manaus", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(agora);
    const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)!.value;
    return new Date(`${valor("year")}-${valor("month")}-${valor("day")}T00:00:00.000Z`);
  }
}
