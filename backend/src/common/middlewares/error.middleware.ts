import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      erro: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      erro: "Dados invalidos.",
      detalhes: error.issues,
    });
  }

  console.error(error);

  return res.status(500).json({
    erro: "Erro interno do servidor.",
  });
};
