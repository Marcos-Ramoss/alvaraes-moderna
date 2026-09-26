import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { autorizar } from "../auth/auth.middleware.js";
import { atualizarUsuarioDto } from "./dto/atualizar-usuario.dto.js";
import { criarUsuarioDto } from "./dto/criar-usuario.dto.js";
import { listarUsuariosQueryDto } from "./dto/listar-usuarios.query.dto.js";
import { usuarioIdParamsDto } from "./dto/usuario-params.dto.js";
import { UsuariosController } from "./usuarios.controller.js";

const usuariosController = new UsuariosController();

export const usuariosRoutes = Router();

usuariosRoutes.get(
  "/admin/usuarios",
  autorizar("USUARIOS"),
  validarRequest({ query: listarUsuariosQueryDto }),
  asyncHandler(usuariosController.listar),
);

usuariosRoutes.get(
  "/admin/usuarios/:id",
  autorizar("USUARIOS"),
  validarRequest({ params: usuarioIdParamsDto }),
  asyncHandler(usuariosController.buscarPorId),
);

usuariosRoutes.post(
  "/admin/usuarios",
  autorizar("USUARIOS"),
  validarRequest({ body: criarUsuarioDto }),
  asyncHandler(usuariosController.criar),
);

usuariosRoutes.put(
  "/admin/usuarios/:id",
  autorizar("USUARIOS"),
  validarRequest({ params: usuarioIdParamsDto, body: atualizarUsuarioDto }),
  asyncHandler(usuariosController.atualizar),
);

usuariosRoutes.patch(
  "/admin/usuarios/:id/status",
  autorizar("USUARIOS"),
  validarRequest({ params: usuarioIdParamsDto }),
  asyncHandler(usuariosController.alterarStatus),
);

usuariosRoutes.delete(
  "/admin/usuarios/:id",
  autorizar("USUARIOS"),
  validarRequest({ params: usuarioIdParamsDto }),
  asyncHandler(usuariosController.excluir),
);
