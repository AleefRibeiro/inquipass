"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, Mail, Phone, UserRound } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInquiPassStore } from "@/lib/mock-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AccountType } from "@/lib/types";

function routeFor(type?: AccountType) {
  if (type === "agency") {
    return "/imobiliaria";
  }

  if (type === "admin") {
    return "/admin";
  }

  return "/dashboard";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register, adoptAuthenticatedAccount } = useInquiPassStore();
  const [accountType, setAccountType] = useState<AccountType>("tenant");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  function mapAuthError(message?: string) {
    const normalized = (message ?? "").toLowerCase();

    if (!normalized) {
      return "Nao foi possivel autenticar agora.";
    }

    if (normalized.includes("invalid login credentials")) {
      return "Email ou senha invalidos.";
    }

    if (normalized.includes("email not confirmed")) {
      return "Seu email ainda nao foi confirmado.";
    }

    if (normalized.includes("too many requests")) {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }

    return "Nao foi possivel autenticar agora.";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const data = new FormData(event.currentTarget);

    if (mode === "login") {
      const email = String(data.get("email"));
      const password = String(data.get("password"));
      const result = login(email, password);

      if (result.success) {
        router.push(routeFor(result.accountType));
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setMessage("Login externo indisponivel: Supabase nao configurado no ambiente.");
        setSubmitting(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setMessage(mapAuthError(authError?.message));
        setSubmitting(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users_profile")
        .select("auth_user_id, account_type, full_name, email, phone")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

      if (profileError) {
        setMessage("Falha ao carregar perfil. Tente novamente.");
        setSubmitting(false);
        return;
      }

      if (profile) {
        adoptAuthenticatedAccount({
          auth_user_id: profile.auth_user_id,
          account_type: profile.account_type as AccountType,
          full_name: profile.full_name,
          email: profile.email ?? email,
          phone: profile.phone ?? "",
          company_name: profile.account_type === "agency" ? "Imobiliária Demo" : undefined,
        });
        router.push(routeFor(profile.account_type as AccountType));
        return;
      }

      const inferredType = (authData.user.user_metadata?.account_type as AccountType | undefined) ?? "tenant";
      const fullName =
        typeof authData.user.user_metadata?.full_name === "string" && authData.user.user_metadata.full_name
          ? authData.user.user_metadata.full_name
          : email.split("@")[0];

      const { data: createdProfile, error: createProfileError } = await supabase
        .from("users_profile")
        .insert({
          auth_user_id: authData.user.id,
          account_type: inferredType,
          full_name: fullName,
          email: authData.user.email ?? email,
          phone: "",
          lgpd_consent: true,
        })
        .select("auth_user_id, account_type, full_name, email, phone")
        .single();

      if (createProfileError || !createdProfile) {
        setMessage("Conta autenticada, mas nao foi possivel criar perfil. Contate o suporte.");
        setSubmitting(false);
        return;
      }

      adoptAuthenticatedAccount({
        auth_user_id: createdProfile.auth_user_id,
        account_type: createdProfile.account_type as AccountType,
        full_name: createdProfile.full_name,
        email: createdProfile.email ?? email,
        phone: createdProfile.phone ?? "",
      });
      router.push(routeFor(createdProfile.account_type as AccountType));
      return;
    }

    const account = register({
      full_name: String(data.get("full_name")),
      email: String(data.get("email")),
      phone: String(data.get("phone")),
      password: String(data.get("password")),
      account_type: accountType,
      company_name: String(data.get("company_name") || ""),
    });

    router.push(routeFor(account?.account_type));
  }

  async function handlePasswordReset() {
    setMessage("");

    if (!email) {
      setMessage("Informe seu email para receber o link de redefinicao.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Recuperacao indisponivel no momento.");
      return;
    }

    setResetSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetar-senha`,
    });

    setResetSubmitting(false);
    setMessage(
      error
        ? "Nao foi possivel enviar o email agora."
        : "Enviamos um link para redefinir sua senha.",
    );
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <Image
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-slate-950/76" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo className="text-white" />
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <KeyRound className="size-4" aria-hidden="true" />
              Cadastro portatil e verificavel
            </div>
            <h1 className="text-4xl font-semibold tracking-normal">
              Um unico perfil para apresentar documentos, renda e historico.
            </h1>
            <p className="mt-4 leading-7 text-white/72">
              Organize as informacoes essenciais da locacao e compartilhe um perfil verificavel com
              consentimento e seguranca.
            </p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>{mode === "login" ? "Entrar no InquiPass" : "Criar conta"}</CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Acesse como inquilino, imobiliaria ou admin."
                  : "Monte seu acesso para iniciar o passaporte."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Nome</Label>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="full_name" name="full_name" className="pl-9" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Celular</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="phone" name="phone" className="pl-9" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipo de conta</Label>
                      <Select value={accountType} onValueChange={(value) => setAccountType(value as AccountType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant">Inquilino</SelectItem>
                          <SelectItem value="agency">Imobiliaria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {accountType === "agency" ? (
                      <div className="grid gap-2">
                        <Label htmlFor="company_name">Empresa</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input id="company_name" name="company_name" className="pl-9" />
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="pl-9"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password">Senha</Label>
                    {mode === "login" ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={handlePasswordReset}
                        disabled={resetSubmitting}
                      >
                        {resetSubmitting ? "Enviando..." : "Esqueci minha senha"}
                      </button>
                    ) : null}
                  </div>
                  <Input id="password" name="password" type="password" required />
                </div>
                {message ? <p className="text-sm text-destructive">{message}</p> : null}
                <Button type="submit" className="h-10 rounded-md bg-primary" disabled={submitting}>
                  {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
                </Button>
              </form>
              <p className="mt-5 text-sm text-muted-foreground">
                {mode === "login" ? "Ainda nao tem conta?" : "Ja tem conta?"}{" "}
                <Link href={mode === "login" ? "/cadastro" : "/login"} className="font-medium text-primary">
                  {mode === "login" ? "Criar conta" : "Entrar"}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
