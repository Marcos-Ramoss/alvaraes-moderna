import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { atualizarEventoRequestDto } from "./dto/atualizar-evento.request.dto.js";
import { eventoIdParamsDto } from "./dto/evento-params.dto.js";
import { criarEventoRequestDto } from "./dto/criar-evento.request.dto.js";
import {
  listarEventosAdminQueryDto,
  listarEventosQueryDto,
} from "./dto/listar-eventos.query.dto.js";
import { EventosController } from "./eventos.controller.js";

const eventosController = new EventosController();

export const eventosRoutes = Router();

eventosRoutes.get(
  "/eventos/categorias",
  asyncHandler(eventosController.listarCategorias),
);

eventosRoutes.get(
  "/eventos",
  validarRequest({ query: listarEventosQueryDto }),
  asyncHandler(eventosController.listarPublicados),
);

eventosRoutes.get(
  "/eventos/:id",
  validarRequest({ params: eventoIdParamsDto }),
  asyncHandler(eventosController.buscarPublicadoPorId),
);

eventosRoutes.get(
  "/admin/eventos",
  validarRequest({ query: listarEventosAdminQueryDto }),
  asyncHandler(eventosController.listarAdministracao),
);

eventosRoutes.post(
  "/admin/eventos",
  validarRequest({ body: criarEventoRequestDto }),
  asyncHandler(eventosController.criarEvento),
);

eventosRoutes.put(
  "/admin/eventos/:id",
  validarRequest({ params: eventoIdParamsDto, body: atualizarEventoRequestDto }),
  asyncHandler(eventosController.atualizarEvento),
);

eventosRoutes.delete(
  "/admin/eventos/:id",
  validarRequest({ params: eventoIdParamsDto }),
  asyncHandler(eventosController.excluirEvento),
);

eventosRoutes.patch(
  "/admin/eventos/:id/publicar",
  validarRequest({ params: eventoIdParamsDto }),
  asyncHandler(eventosController.publicarEvento),
);
