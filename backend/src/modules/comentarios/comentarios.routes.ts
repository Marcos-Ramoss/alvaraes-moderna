import { Router } from "express";
import { comentariosController } from "./comentarios.controller.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { autorizar } from "../auth/auth.middleware.js";

export const comentariosRoutes = Router();

// Public routes
comentariosRoutes.post("/comentarios", asyncHandler(comentariosController.criar.bind(comentariosController)));
comentariosRoutes.get("/comentarios/:tipo/:id", asyncHandler(comentariosController.listarPublico.bind(comentariosController)));

// Admin routes (Will be protected by /api/admin in app.ts)
comentariosRoutes.get("/admin/comentarios", autorizar("COMENTARIOS"), asyncHandler(comentariosController.listarAdmin.bind(comentariosController)));
comentariosRoutes.patch("/admin/comentarios/:id/status", autorizar("COMENTARIOS"), asyncHandler(comentariosController.atualizarStatus.bind(comentariosController)));
comentariosRoutes.delete("/admin/comentarios/:id", autorizar("COMENTARIOS"), asyncHandler(comentariosController.remover.bind(comentariosController)));

