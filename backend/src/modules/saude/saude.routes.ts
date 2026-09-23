import { Router } from "express";
import { SaudeController } from "./saude.controller.js";

const saudeController = new SaudeController();

export const saudeRoutes = Router();

saudeRoutes.get("/health", saudeController.verificar);
