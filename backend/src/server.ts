import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`API Alvaraes Moderna rodando na porta ${env.PORT}`);
});
