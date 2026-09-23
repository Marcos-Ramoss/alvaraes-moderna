import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { atualizarStatusPedidoAnuncioRequestDto } from "./dto/atualizar-status-pedido-anuncio.request.dto.js";
import { criarPedidoAnuncioRequestDto } from "./dto/criar-pedido-anuncio.request.dto.js";
import { pedidoAnuncioIdParamsDto } from "./dto/pedido-anuncio-params.dto.js";
import { PedidosAnuncioController } from "./pedidos-anuncio.controller.js";

const pedidosController = new PedidosAnuncioController();

export const pedidosAnuncioRoutes = Router();

pedidosAnuncioRoutes.post(
  "/pedidos-anuncio",
  validarRequest({ body: criarPedidoAnuncioRequestDto }),
  asyncHandler(pedidosController.criarPedido),
);

pedidosAnuncioRoutes.get(
  "/admin/pedidos-anuncio",
  asyncHandler(pedidosController.listarPedidos),
);

pedidosAnuncioRoutes.patch(
  "/admin/pedidos-anuncio/:id/status",
  validarRequest({ params: pedidoAnuncioIdParamsDto, body: atualizarStatusPedidoAnuncioRequestDto }),
  asyncHandler(pedidosController.atualizarStatus),
);
