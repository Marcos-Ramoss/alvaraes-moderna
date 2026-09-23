import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

declare global {
  namespace Express {
    interface Request {
      dadosValidados?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

type Schemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export function validarRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.dadosValidados = {
      ...(schemas.body ? { body: schemas.body.parse(req.body) } : {}),
      ...(schemas.params ? { params: schemas.params.parse(req.params) } : {}),
      ...(schemas.query ? { query: schemas.query.parse(req.query) } : {}),
    };

    next();
  };
}
