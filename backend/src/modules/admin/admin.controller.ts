import type { Request, Response } from "express";
import { AuthService } from "../auth/auth.service.js";
import { AdminService } from "./admin.service.js";
import { MassDeleteUseCase } from "./use-cases/mass-delete.use-case.js";
import { MassUpdateUseCase } from "./use-cases/mass-update.use-case.js";
import { MassDeleteSchema, MassUpdateSchema } from "./dto/mass-action.dto.js";

const massDeleteUseCase = new MassDeleteUseCase();
const massUpdateUseCase = new MassUpdateUseCase();

export class AdminController {
  constructor(
    private readonly adminService = new AdminService(),
    private readonly authService = new AuthService(),
  ) {}

  buscarResumo = async (req: Request, res: Response) => {
    const usuarioId = req.usuarioAutenticado?.id;
    const [resumo, usuario] = await Promise.all([
      this.adminService.buscarResumo(),
      usuarioId ? this.authService.buscarUsuarioAutenticado(usuarioId) : Promise.resolve(undefined),
    ]);

    return res.json({ ...resumo, usuario });
  };

  acaoMassaDelete = async (req: Request, res: Response) => {
    try {
      const { entidade, ids } = MassDeleteSchema.parse(req.body);
      const resultado = await massDeleteUseCase.execute(entidade, ids);
      return res.json({ success: true, count: resultado.count });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  acaoMassaUpdate = async (req: Request, res: Response) => {
    try {
      const { entidade, ids, status } = MassUpdateSchema.parse(req.body);
      const resultado = await massUpdateUseCase.execute(entidade, ids, status);
      return res.json({ success: true, count: resultado.count });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
