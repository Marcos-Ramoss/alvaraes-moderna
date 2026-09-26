import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { autorizar } from "../auth/auth.middleware.js";
import { listarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";
import { AuditoriaController } from "./auditoria.controller.js";

const auditoriaController = new AuditoriaController();

export const auditoriaRoutes = Router();

auditoriaRoutes.get(
  "/admin/auditoria",
  autorizar("AUDITORIA"),
  validarRequest({ query: listarAuditoriaQueryDto }),
  asyncHandler(auditoriaController.listar),
);
