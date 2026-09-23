import type { Request, Response } from "express";

export class SaudeController {
  verificar(_req: Request, res: Response) {
    return res.json({
      status: "ok",
      servico: "alvaraes-moderna-backend",
      horario: new Date().toISOString(),
    });
  }
}
