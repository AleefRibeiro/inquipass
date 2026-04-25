"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("Validando link de redefinicao...");
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => setMessage("Recuperacao indisponivel no momento."));
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      setMessage(
        data.session
          ? "Digite sua nova senha."
          : "Abra esta pagina pelo link enviado por email para redefinir a senha.",
      );
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setMessage("Digite sua nova senha.");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const passwordConfirmation = String(data.get("password_confirmation"));

    if (password.length < 8) {
      setMessage("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setMessage("As senhas nao conferem.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setMessage("Nao foi possivel atualizar a senha. Solicite um novo link.");
      return;
    }

    setMessage("Senha atualizada. Voce ja pode entrar.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo />
        </div>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-emerald-700" aria-hidden="true" />
              Redefinir senha
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input id="password" name="password" type="password" required disabled={!ready || submitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  disabled={!ready || submitting}
                />
              </div>
              <Button type="submit" className="h-10 rounded-md" disabled={!ready || submitting}>
                {submitting ? "Atualizando..." : "Atualizar senha"}
              </Button>
            </form>
            <Button asChild variant="link" className="mt-4 h-auto p-0">
              <Link href="/login">Voltar para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
