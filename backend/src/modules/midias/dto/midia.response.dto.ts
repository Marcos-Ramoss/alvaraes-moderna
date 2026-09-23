export type MidiaResponseDto = {
  id: string;
  tipoMidia: "IMAGEM" | "VIDEO";
  url: string;
  titulo?: string | undefined;
  textoAlternativo?: string | undefined;
  credito?: string | undefined;
  origem?: string | undefined;
  tamanhoBytes?: number | undefined;
  duracaoSegundos?: number | undefined;
  ordem: number;
};
