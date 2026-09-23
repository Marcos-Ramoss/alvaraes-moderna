import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { BoletimController } from "./boletim.controller.js";
import { inscritoBoletimIdParamsDto } from "./dto/inscrito-boletim-params.dto.js";
import { inscreverBoletimRequestDto } from "./dto/inscrever-boletim.request.dto.js";

const boletimController = new BoletimController();

export const boletimRoutes = Router();

boletimRoutes.get("/boletim/previa", asyncHandler(boletimController.montarPreviaSemanal));

boletimRoutes.post(
  "/boletim/inscrever",
  validarRequest({ body: inscreverBoletimRequestDto }),
  asyncHandler(boletimController.inscrever),
);

boletimRoutes.get("/admin/boletim/inscritos", asyncHandler(boletimController.listarInscritos));

boletimRoutes.delete(
  "/admin/boletim/inscritos/:id",
  validarRequest({ params: inscritoBoletimIdParamsDto }),
  asyncHandler(boletimController.removerInscrito),
);
