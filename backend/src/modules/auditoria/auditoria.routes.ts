import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { autorizar } from "../auth/auth.middleware.js";
import { listarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";
import {
  contarAuditoriaAntigosQueryDto,
  expurgarAuditoriaBodyDto,
  logAuditoriaIdParamsDto,
} from "./dto/expurgar-auditoria.dto.js";
import { AuditoriaController } from "./auditoria.controller.js";

const auditoriaController = new AuditoriaController();

export const auditoriaRoutes = Router();

auditoriaRoutes.get(
  "/admin/auditoria",
  autorizar("AUDITORIA"),
  validarRequest({ query: listarAuditoriaQueryDto }),
  asyncHandler(auditoriaController.listar),
);

auditoriaRoutes.get(
  "/admin/auditoria/antigos/contar",
  autorizar("AUDITORIA"),
  validarRequest({ query: contarAuditoriaAntigosQueryDto }),
  asyncHandler(auditoriaController.contarAntigos),
);

auditoriaRoutes.delete(
  "/admin/auditoria/antigos",
  autorizar("AUDITORIA"),
  validarRequest({ body: expurgarAuditoriaBodyDto }),
  asyncHandler(auditoriaController.excluirAntigos),
);

auditoriaRoutes.delete(
  "/admin/auditoria/:id",
  autorizar("AUDITORIA"),
  validarRequest({ params: logAuditoriaIdParamsDto }),
  asyncHandler(auditoriaController.excluir),
);
