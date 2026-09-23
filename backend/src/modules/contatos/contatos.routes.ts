import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { ContatosController } from "./contatos.controller.js";
import { atualizarStatusContatoRequestDto } from "./dto/atualizar-status-contato.request.dto.js";
import { contatoIdParamsDto } from "./dto/contato-params.dto.js";
import { criarContatoRequestDto } from "./dto/criar-contato.request.dto.js";

const contatosController = new ContatosController();

export const contatosRoutes = Router();

contatosRoutes.post(
  "/contatos",
  validarRequest({ body: criarContatoRequestDto }),
  asyncHandler(contatosController.criarContato),
);

contatosRoutes.get("/admin/contatos", asyncHandler(contatosController.listarContatos));

contatosRoutes.patch(
  "/admin/contatos/:id/status",
  validarRequest({ params: contatoIdParamsDto, body: atualizarStatusContatoRequestDto }),
  asyncHandler(contatosController.atualizarStatus),
);
