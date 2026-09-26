import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Shield,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/use-admin-auth";
import {
  adminApi,
  temPermissao,
  formatarDataPtBr,
  formatarErroApi,
  type UsuarioAdmin,
  type Permissao,
  type RoleUsuario,
} from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TODAS_PERMISSOES: {
  id: Permissao;
  label: string;
  descricao: string;
}[] = [
  { id: "NOTICIAS", label: "Gerenciar Notícias", descricao: "Criar, editar, publicar e excluir notícias e categorias" },
  { id: "COMERCIOS", label: "Gerenciar Comércios", descricao: "Cadastrar, editar e gerenciar estabelecimentos locais" },
  { id: "EVENTOS", label: "Gerenciar Eventos / Agenda", descricao: "Publicar e manter festejos e eventos municipais" },
  { id: "CURSOS", label: "Gerenciar Cursos e Oportunidades", descricao: "Cadastrar vagas, cursos e oportunidades" },
  { id: "COMENTARIOS", label: "Moderar Comentários", descricao: "Aprovar, rejeitar e remover comentários públicos" },
  { id: "BOLETIM", label: "Gerenciar Boletim", descricao: "Visualizar inscritos e gerar prévias do boletim" },
  { id: "CONTATOS", label: "Mensagens de Contato", descricao: "Gerenciar e responder mensagens do Fale Conosco" },
  { id: "ANUNCIOS", label: "Pedidos de Anúncio", descricao: "Gerenciar propostas e solicitações comerciais" },
  { id: "USUARIOS", label: "Gerenciar Usuários", descricao: "Cadastrar contas e gerenciar permissões administrativas" },
  { id: "AUDITORIA", label: "Visualizar Logs de Auditoria", descricao: "Consultar histórico de ações e diffs de segurança" },
];

export function AdminUsuariosView() {
  const { usuario: usuarioLogado, carregando: carregandoAuth } = useAdminAuth();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | "ATIVO" | "INATIVO">("TODOS");
  const [filtroRole, setFiltroRole] = useState<"TODOS" | "MASTER" | "ADMIN">("TODOS");

  // Modal formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAdmin | null>(null);
  const [nomeForm, setNomeForm] = useState("");
  const [emailForm, setEmailForm] = useState("");
  const [senhaForm, setSenhaForm] = useState("");
  const [roleForm, setRoleForm] = useState<RoleUsuario>("ADMIN");
  const [ativoForm, setAtivoForm] = useState(true);
  const [permissoesForm, setPermissoesForm] = useState<Permissao[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Modal exclusão
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<UsuarioAdmin | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Status toggle rápido
  const [alterandoStatusId, setAlterandoStatusId] = useState<string | null>(null);

  const autorizado = useMemo(() => {
    return temPermissao(usuarioLogado, "USUARIOS");
  }, [usuarioLogado]);

  const carregarUsuarios = async () => {
    try {
      setCarregandoLista(true);
      const res = await adminApi.listarUsuarios({ limite: 100 });
      setUsuarios(res.dados);
    } catch (err) {
      toast.error("Erro ao carregar lista de usuários", {
        description: formatarErroApi(err),
      });
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    if (!carregandoAuth && autorizado) {
      carregarUsuarios();
    }
  }, [carregandoAuth, autorizado]);

  const abrirCriacao = () => {
    setUsuarioEditando(null);
    setNomeForm("");
    setEmailForm("");
    setSenhaForm("");
    setRoleForm("ADMIN");
    setAtivoForm(true);
    setPermissoesForm(["NOTICIAS", "COMERCIOS", "EVENTOS"]);
    setModalAberto(true);
  };

  const abrirEdicao = (u: UsuarioAdmin) => {
    setUsuarioEditando(u);
    setNomeForm(u.nome);
    setEmailForm(u.email);
    setSenhaForm("");
    setRoleForm(u.role);
    setAtivoForm(u.ativo);
    setPermissoesForm(u.permissoes ?? []);
    setModalAberto(true);
  };

  const alternarPermissao = (perm: Permissao) => {
    if (roleForm === "MASTER") return;
    setPermissoesForm((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const marcarTodas = () => {
    if (roleForm === "MASTER") return;
    setPermissoesForm(TODAS_PERMISSOES.map((p) => p.id));
  };

  const desmarcarTodas = () => {
    if (roleForm === "MASTER") return;
    setPermissoesForm([]);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeForm.trim()) {
      toast.error("Informe o nome do usuário.");
      return;
    }
    if (!emailForm.trim()) {
      toast.error("Informe o e-mail do usuário.");
      return;
    }
    if (!usuarioEditando && (!senhaForm || senhaForm.length < 6)) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      setSalvando(true);
      if (usuarioEditando) {
        await adminApi.atualizarUsuario(usuarioEditando.id, {
          nome: nomeForm.trim(),
          email: emailForm.trim(),
          ...(senhaForm ? { senha: senhaForm } : {}),
          role: roleForm,
          ativo: ativoForm,
          permissoes: roleForm === "MASTER" ? [] : permissoesForm,
        });
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await adminApi.criarUsuario({
          nome: nomeForm.trim(),
          email: emailForm.trim(),
          senha: senhaForm,
          role: roleForm,
          ativo: ativoForm,
          permissoes: roleForm === "MASTER" ? [] : permissoesForm,
        });
        toast.success("Usuário cadastrado com sucesso!");
      }
      setModalAberto(false);
      carregarUsuarios();
    } catch (err) {
      toast.error("Falha ao salvar usuário", {
        description: formatarErroApi(err),
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarStatus = async (u: UsuarioAdmin) => {
    try {
      setAlterandoStatusId(u.id);
      await adminApi.alterarStatusUsuario(u.id, !u.ativo);
      toast.success(
        !u.ativo
          ? `Usuário '${u.nome}' foi ativado.`
          : `Usuário '${u.nome}' foi desativado.`
      );
      setUsuarios((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, ativo: !item.ativo } : item))
      );
    } catch (err) {
      toast.error("Não foi possível alterar o status", {
        description: formatarErroApi(err),
      });
    } finally {
      setAlterandoStatusId(null);
    }
  };

  const handleExcluir = async () => {
    if (!usuarioParaExcluir) return;
    try {
      setExcluindo(true);
      await adminApi.excluirUsuario(usuarioParaExcluir.id);
      toast.success(`Usuário '${usuarioParaExcluir.nome}' excluído.`);
      setUsuarios((prev) => prev.filter((item) => item.id !== usuarioParaExcluir.id));
      setUsuarioParaExcluir(null);
    } catch (err) {
      toast.error("Erro ao excluir usuário", {
        description: formatarErroApi(err),
      });
    } finally {
      setExcluindo(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (busca) {
        const termo = busca.toLowerCase();
        const matchNome = u.nome.toLowerCase().includes(termo);
        const matchEmail = u.email.toLowerCase().includes(termo);
        if (!matchNome && !matchEmail) return false;
      }
      if (filtroStatus === "ATIVO" && !u.ativo) return false;
      if (filtroStatus === "INATIVO" && u.ativo) return false;
      if (filtroRole !== "TODOS" && u.role !== filtroRole) return false;
      return true;
    });
  }, [usuarios, busca, filtroStatus, filtroRole]);

  if (carregandoAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-background">
        <p className="text-admin-muted">Carregando painel...</p>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <AdminShell usuario={usuarioLogado} wide>
        <div className="mx-auto max-w-xl py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-admin-foreground">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-sm text-admin-muted">
            Você não possui permissão para gerenciar os usuários administrativos.
            Solicite autorização ao Administrador Master para ter acesso a esta seção.
          </p>
          <div className="mt-6">
            <Link
              to="/admin"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-admin-sidebar px-4 text-sm font-semibold text-white shadow hover:opacity-90"
            >
              Voltar para a Visão Geral
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell usuario={usuarioLogado} wide>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-sidebar text-white shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-admin-foreground sm:text-3xl">
                  Usuários Administrativos
                </h1>
                <p className="text-xs text-admin-muted sm:text-sm">
                  Gerencie contas administrativas e atribua permissões granulares por funcionalidade.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={carregarUsuarios}
              disabled={carregandoLista}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${carregandoLista ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button
              onClick={abrirCriacao}
              size="sm"
              className="gap-2 bg-admin-sidebar text-white hover:opacity-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </Button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="rounded-xl border border-admin-border bg-admin-surface p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
              <Input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-admin-muted hover:text-admin-foreground"
                >
                  Limpar
                </button>
              )}
            </div>

            <div>
              <select
                aria-label="Filtro de Papel"
                value={filtroRole}
                onChange={(e) => setFiltroRole(e.target.value as any)}
                className="h-10 w-full rounded-md border border-admin-border bg-admin-background px-3 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-border"
              >
                <option value="TODOS">Todos os Papéis</option>
                <option value="MASTER">Apenas Master</option>
                <option value="ADMIN">Apenas Administradores</option>
              </select>
            </div>

            <div>
              <select
                aria-label="Filtro de Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="h-10 w-full rounded-md border border-admin-border bg-admin-background px-3 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-border"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ATIVO">Somente Ativos</option>
                <option value="INATIVO">Somente Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-sm">
          {carregandoLista ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-admin-muted" />
              <span className="ml-3 text-sm text-admin-muted">Carregando usuários...</span>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <Users className="h-10 w-10 text-admin-muted/60" />
              <p className="mt-3 text-base font-semibold text-admin-foreground">
                Nenhum usuário encontrado
              </p>
              <p className="mt-1 text-xs text-admin-muted">
                {busca || filtroStatus !== "TODOS" || filtroRole !== "TODOS"
                  ? "Tente ajustar seus filtros de busca."
                  : "Cadastre o primeiro usuário clicando no botão acima."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-admin-border bg-admin-background/60 text-xs font-semibold text-admin-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Usuário</th>
                    <th className="px-5 py-3.5">Papel</th>
                    <th className="px-5 py-3.5">Permissões de Acesso</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Criado em</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {usuariosFiltrados.map((u) => {
                    const isMaster = u.role === "MASTER";
                    const isSelf = u.id === usuarioLogado?.id;
                    const isMasterPrincipal = u.email === "admin@alvaraesmoderna.com.br";

                    return (
                      <tr
                        key={u.id}
                        className="transition-colors hover:bg-admin-background/40"
                      >
                        {/* Nome & Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-sidebar/10 font-bold text-admin-sidebar">
                              {u.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-admin-foreground">
                                {u.nome}
                                {isSelf && (
                                  <span className="ml-2 text-xs font-normal text-admin-muted">
                                    (você)
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-admin-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Papel */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isMaster ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                              <Sparkles className="mr-1 h-3 w-3 text-amber-700" />
                              MASTER
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="font-semibold">
                              ADMIN
                            </Badge>
                          )}
                        </td>

                        {/* Permissões */}
                        <td className="px-5 py-4">
                          {isMaster ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                              Acesso Total Irrestrito
                            </span>
                          ) : u.permissoes && u.permissoes.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {u.permissoes.map((p) => (
                                <span
                                  key={p}
                                  className="rounded bg-admin-border/50 px-2 py-0.5 text-[11px] font-medium text-admin-foreground border border-admin-border"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-admin-muted italic">
                              Nenhuma permissão atribuída
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleAlterarStatus(u)}
                            disabled={alterandoStatusId === u.id || isMasterPrincipal || (isMaster && isSelf)}
                            title={
                              isMasterPrincipal
                                ? "O Administrador Master principal não pode ser desativado."
                                : isSelf
                                ? "Você não pode desativar seu próprio usuário."
                                : "Clique para alterar o status"
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                              u.ativo
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100"
                            } ${(alterandoStatusId === u.id || isMasterPrincipal || (isMaster && isSelf)) ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {alterandoStatusId === u.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : u.ativo ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-rose-600" />
                            )}
                            {u.ativo ? "Ativo" : "Inativo"}
                          </button>
                        </td>

                        {/* Data */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-admin-muted">
                          {formatarDataPtBr(u.criadoEm)}
                        </td>

                        {/* Ações */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirEdicao(u)}
                              title="Editar usuário e permissões"
                              className="h-8 w-8 text-admin-muted hover:text-admin-foreground"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUsuarioParaExcluir(u)}
                              disabled={isMaster || isSelf}
                              title={
                                isMaster
                                  ? "Contas Master não podem ser excluídas."
                                  : isSelf
                                  ? "Você não pode excluir sua própria conta."
                                  : "Excluir usuário"
                              }
                              className={`h-8 w-8 text-admin-muted hover:text-rose-600 ${
                                isMaster || isSelf ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CRIAR / EDITAR */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Shield className="h-5 w-5 text-admin-sidebar" />
              {usuarioEditando ? "Editar Usuário Administrativo" : "Novo Usuário Administrativo"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do usuário e defina as permissões individuais de acesso.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvar} className="space-y-5 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={nomeForm}
                  onChange={(e) => setNomeForm(e.target.value)}
                  placeholder="Ex: João da Silva"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail de Acesso *</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailForm}
                  onChange={(e) => setEmailForm(e.target.value)}
                  placeholder="usuario@alvaraesmoderna.com.br"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="senha">
                  {usuarioEditando ? "Nova Senha (opcional)" : "Senha de Acesso *"}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={senhaForm}
                  onChange={(e) => setSenhaForm(e.target.value)}
                  placeholder={
                    usuarioEditando
                      ? "Deixe em branco para não alterar"
                      : "Mínimo de 6 caracteres"
                  }
                  required={!usuarioEditando}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Papel / Nível de Acesso</Label>
                <select
                  id="role"
                  value={roleForm}
                  disabled={usuarioEditando?.email === "admin@alvaraesmoderna.com.br" || usuarioLogado?.role !== "MASTER"}
                  onChange={(e) => setRoleForm(e.target.value as RoleUsuario)}
                  className="h-10 w-full rounded-md border border-admin-border bg-admin-background px-3 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-border disabled:opacity-60"
                >
                  <option value="ADMIN">ADMIN (Permissões personalizadas)</option>
                  <option value="MASTER">MASTER (Acesso total irrestrito)</option>
                </select>
              </div>
            </div>

            {/* SEÇÃO DE PERMISSÕES */}
            <div className="space-y-3 pt-2 border-t border-admin-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-admin-foreground">
                    Permissões de Funcionalidade
                  </h3>
                  <p className="text-xs text-admin-muted">
                    Marque as seções do painel que este usuário poderá visualizar e gerenciar.
                  </p>
                </div>
                {roleForm !== "MASTER" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={marcarTodas}
                      className="text-xs font-semibold text-admin-sidebar hover:underline"
                    >
                      Marcar todas
                    </button>
                    <span className="text-xs text-admin-muted">•</span>
                    <button
                      type="button"
                      onClick={desmarcarTodas}
                      className="text-xs font-semibold text-admin-muted hover:underline"
                    >
                      Desmarcar todas
                    </button>
                  </div>
                )}
              </div>

              {roleForm === "MASTER" ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">
                        Administrador Master com Acesso Total
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        O Administrador Master possui acesso completo e irrestrito a todas as funcionalidades, rotas e módulos do painel. Suas permissões não dependem de caixas de seleção.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {TODAS_PERMISSOES.map((item) => {
                    const marcada = permissoesForm.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        onClick={() => alternarPermissao(item.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          marcada
                            ? "border-admin-sidebar bg-admin-sidebar/5"
                            : "border-admin-border bg-admin-background hover:bg-admin-border/20"
                        }`}
                      >
                        <Checkbox
                          checked={marcada}
                          onCheckedChange={() => alternarPermissao(item.id)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-admin-foreground">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-admin-muted leading-relaxed">
                            {item.descricao}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-admin-border gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalAberto(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvando}
                className="bg-admin-sidebar text-white hover:opacity-95"
              >
                {salvando ? "Salvando..." : usuarioEditando ? "Salvar Alterações" : "Cadastrar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG EXCLUSÃO */}
      <AlertDialog
        open={Boolean(usuarioParaExcluir)}
        onOpenChange={(aberto) => !aberto && setUsuarioParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-rose-700 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Usuário Administrativo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o usuário{" "}
              <strong className="text-admin-foreground font-semibold">
                '{usuarioParaExcluir?.nome}' ({usuarioParaExcluir?.email})
              </strong>
              ? Esta ação não pode ser desfeita. O histórico de logs de auditoria permanecerá preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              disabled={excluindo}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {excluindo ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
