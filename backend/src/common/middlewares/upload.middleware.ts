import multer from "multer";
import { LIMITE_PADRAO_IMAGEM_BYTES, TIPOS_IMAGEM_PERMITIDOS } from "../../modules/midias/use-cases/upload-imagem.use-case.js";
import { TipoArquivoInvalidoError } from "../../modules/midias/errors/midia.errors.js";

const armazenamentoMemoria = multer.memoryStorage();

export const uploadImagemMiddleware = multer({
  storage: armazenamentoMemoria,
  limits: {
    fileSize: LIMITE_PADRAO_IMAGEM_BYTES,
  },
  fileFilter: (_req, file, callback) => {
    if (TIPOS_IMAGEM_PERMITIDOS.includes(file.mimetype.toLowerCase() as any)) {
      callback(null, true);
    } else {
      callback(new TipoArquivoInvalidoError(file.mimetype));
    }
  },
});

