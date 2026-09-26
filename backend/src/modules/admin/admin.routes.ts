import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { dashboardResumoQueryDto } from "./dto/dashboard-resumo.query.dto.js";
import { AdminController } from "./admin.controller.js";

const adminController = new AdminController();

export const adminRoutes = Router();

adminRoutes.get(
  "/admin/resumo",
  validarRequest({ query: dashboardResumoQueryDto }),
  asyncHandler(adminController.buscarResumo),
);

// Ações em massa
adminRoutes.delete("/admin/massa", asyncHandler(adminController.acaoMassaDelete));
adminRoutes.patch("/admin/massa", asyncHandler(adminController.acaoMassaUpdate));
