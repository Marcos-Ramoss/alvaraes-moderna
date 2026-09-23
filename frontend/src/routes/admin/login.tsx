import { createFileRoute } from "@tanstack/react-router";
import { LogIn, Compass, ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { adminApi, formatarErroApi } from "@/lib/admin-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Login do painel - Alvarães Moderna" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("admin@alvaraesmoderna.com.br");
  const [senha, setSenha] = useState("admin123456");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await adminApi.login(email, senha);
      window.location.href = "/admin";
    } catch (error) {
      setErro(formatarErroApi(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Painel Esquerdo (Branding) - Oculto no mobile, 50% no desktop */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#062f1f] p-12 text-white lg:flex">
        {/* Padrão de fundo sutil para ficar mais profissional */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#f4e5d7] backdrop-blur-md">
            <Compass className="h-4 w-4" />
            Portal da Cidade
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Alvarães <span className="italic text-[#d15a33]">Moderna</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            O painel de controle oficial da comunidade. Gerencie notícias, aprove comentários, atualize o guia comercial e organize eventos em um só lugar.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/50">
          &copy; {new Date().getFullYear()} Alvarães Moderna. Todos os direitos reservados.
        </div>
      </div>

      {/* Painel Direito (Formulário) - 100% no mobile, 50% no desktop */}
      <div className="flex w-full flex-1 items-center justify-center bg-white p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <img 
              src="/logo.png" 
              alt="Alvarães Moderna" 
              className="mb-8 h-12 w-auto object-contain lg:h-14" 
            />
            <h2 className="font-display text-2xl font-bold text-gray-900">Acesso Restrito</h2>
            <p className="mt-2 text-center text-sm text-gray-500 lg:text-left">
              Insira suas credenciais para acessar o painel de controle.
            </p>
          </div>

          <form onSubmit={entrar} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-gray-900">E-mail corporativo</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@alvaraesmoderna.com.br"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-senha" className="text-gray-900">Senha</Label>
              </div>
              <Input
                id="admin-senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="lembrar" defaultChecked />
              <label
                htmlFor="lembrar"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                Lembrar neste dispositivo
              </label>
            </div>

            {erro && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={enviando}
              className="h-11 w-full bg-[#062f1f] hover:bg-[#062f1f]/90 text-white group"
            >
              {enviando ? "Autenticando..." : "Entrar no painel"}
              {!enviando && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
