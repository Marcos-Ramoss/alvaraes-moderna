import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from "./config/cors.js";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import { docsRoutes } from "./docs/docs.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { autenticarUsuario } from "./modules/auth/auth.middleware.js";
import { boletimRoutes } from "./modules/boletim/boletim.routes.js";
import { comerciosRoutes } from "./modules/comercios/comercios.routes.js";
import { contatosRoutes } from "./modules/contatos/contatos.routes.js";
import { eventosRoutes } from "./modules/eventos/eventos.routes.js";
import { noticiasRoutes } from "./modules/noticias/noticias.routes.js";
import { oportunidadesRoutes } from "./modules/oportunidades/oportunidades.routes.js";
import { pedidosAnuncioRoutes } from "./modules/pedidos-anuncio/pedidos-anuncio.routes.js";
import { saudeRoutes } from "./modules/saude/saude.routes.js";
import { curtidasRoutes } from "./modules/curtidas/curtidas.routes.js";
import { comentariosRoutes } from "./modules/comentarios/comentarios.routes.js";
import { midiasRoutes } from "./modules/midias/midias.routes.js";
import { auditoriaRoutes } from "./modules/auditoria/auditoria.routes.js";
import { usuariosRoutes } from "./modules/usuarios/usuarios.routes.js";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/api", docsRoutes);
app.use("/api", saudeRoutes);
app.use("/api", authRoutes);
app.use("/api/admin", autenticarUsuario);
app.use("/api", adminRoutes);
app.use("/api", boletimRoutes);
app.use("/api", contatosRoutes);
app.use("/api", pedidosAnuncioRoutes);
app.use("/api", noticiasRoutes);
app.use("/api", comerciosRoutes);
app.use("/api", eventosRoutes);
app.use("/api", oportunidadesRoutes);
app.use("/api", curtidasRoutes);
app.use("/api", comentariosRoutes);
app.use("/api", midiasRoutes);
app.use("/api", auditoriaRoutes);
app.use("/api", usuariosRoutes);

app.use(errorMiddleware);
