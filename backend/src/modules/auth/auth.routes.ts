import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { autenticarUsuario } from "./auth.middleware.js";
import { loginRequestDto } from "./dto/login.request.dto.js";
import { AuthController } from "./auth.controller.js";

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post(
  "/auth/login",
  validarRequest({ body: loginRequestDto }),
  asyncHandler(authController.login),
);

authRoutes.get("/auth/me", autenticarUsuario, asyncHandler(authController.me));
