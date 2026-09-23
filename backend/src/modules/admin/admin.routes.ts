import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { AdminController } from "./admin.controller.js";

const adminController = new AdminController();

export const adminRoutes = Router();

adminRoutes.get("/admin/resumo", asyncHandler(adminController.buscarResumo));

// Ações em massa
adminRoutes.delete("/admin/massa", asyncHandler(adminController.acaoMassaDelete));
adminRoutes.patch("/admin/massa", asyncHandler(adminController.acaoMassaUpdate));
