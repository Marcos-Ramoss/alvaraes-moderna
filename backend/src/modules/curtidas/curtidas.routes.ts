import { Router } from "express";
import { curtidasController } from "./curtidas.controller.js";
import { asyncHandler } from "../../common/utils/async-handler.js";

export const curtidasRoutes = Router();

curtidasRoutes.post("/curtidas/toggle", asyncHandler(curtidasController.toggle.bind(curtidasController)));
curtidasRoutes.get("/curtidas/:tipo/:id", asyncHandler(curtidasController.getContagem.bind(curtidasController)));

