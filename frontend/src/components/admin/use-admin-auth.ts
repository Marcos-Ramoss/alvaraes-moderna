import { useEffect, useState } from "react";
import { adminApi, removerTokenAdmin, type UsuarioAdmin } from "../../lib/admin-api";

export function useAdminAuth() {
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    adminApi
      .me()
      .then((resposta) => {
        if (!ativo) return;
        setUsuario(resposta.usuario);
      })
      .catch(() => {
        removerTokenAdmin();
        window.location.href = "/admin/login";
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { usuario, carregando };
}
