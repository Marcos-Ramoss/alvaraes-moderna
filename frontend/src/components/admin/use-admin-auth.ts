import { useEffect, useState } from "react";
import { adminApi, removerTokenAdmin, type UsuarioAdmin } from "../../lib/admin-api";

let usuarioCache: UsuarioAdmin | null = null;

export function limparCacheUsuarioAdmin() {
  usuarioCache = null;
}

export function useAdminAuth() {
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(usuarioCache);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    adminApi
      .me()
      .then((resposta) => {
        if (!ativo) return;
        usuarioCache = resposta.usuario;
        setUsuario(resposta.usuario);
      })
      .catch(() => {
        usuarioCache = null;
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
