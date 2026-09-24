import { Router } from "express";
import { uploadImagemMiddleware } from "../../common/middlewares/upload.middleware.js";
import { MidiasController } from "./midias.controller.js";

const controller = new MidiasController();

export const midiasRoutes = Router();

const uploadCampos = uploadImagemMiddleware.fields([
  { name: "arquivo", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "imagem", maxCount: 1 },
]);

midiasRoutes.post("/admin/upload", uploadCampos, controller.upload);
midiasRoutes.post("/midias/upload", uploadCampos, controller.upload);

