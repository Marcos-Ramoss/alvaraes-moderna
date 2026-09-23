import { Router } from "express";
import { openApiDocument } from "./openapi.js";
import { renderSwaggerPage } from "./swagger-page.js";

export const docsRoutes = Router();

docsRoutes.get("/docs.json", (_req, res) => {
  return res.json(openApiDocument);
});

docsRoutes.get("/docs", (_req, res) => {
  return res.type("html").send(renderSwaggerPage());
});
