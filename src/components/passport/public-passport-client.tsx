"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Building2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { LoadingState } from "@/components/app/loading-state";
import { PassportView } from "@/components/passport/passport-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/app/status-badge";
import { useInquiPassStore } from "@/lib/mock-store";
import { formatCurrency } from "@/lib/calculations";

export function PublicPassportClient({ token }: { token: string }) {
  const { ready, getPassportByToken, getSnapshot, registerAccess } = useInquiPassStore();
  const [unlocked, setUnlocked] = useState(false);

  const passport = getPassportByToken(token);
  const snapshot = passport ? getSnapshot(passport.id) : undefined;

  if (!ready) {
    return <LoadingState />;
  }

  if (!passport || !snapshot) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
            <Logo />
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <Card className="rounded-md">
            <CardContent className="p-6">
              <h1 className="text-xl font-semibold">Link nao encontrado</h1>
              <p className="mt-2 text-sm text-muted-foreground">Confira o token ou solicite um novo link ao inquilino.</p>
              <Button asChild className="mt-5 h-10 rounded-md">
                <Link href="/">Voltar ao inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  async function handleAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passport) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const payload = {
      passport_id: passport.id,
      viewer_name: String(data.get("viewer_name")),
      viewer_email: String(data.get("viewer_email")),
      viewer_company: String(data.get("viewer_company")),
      viewer_document: String(data.get("viewer_document")),
      access_reason: String(data.get("access_reason")),
      ip_address: "127.0.0.1",
    };

    await fetch("/api/share-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    registerAccess(payload);
    setUnlocked(true);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button asChild variant="outline" className="h-9 rounded-md">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
        <section>
          {unlocked ? (
            <PassportView snapshot={snapshot} publicMode onRequestAccess={() => setUnlocked(false)} />
          ) : (
            <div className="rounded-md border bg-white">
              <div className="bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/70">Versao resumida</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-normal">
                      {snapshot.profile?.full_name ?? "Inquilino"}
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                      {[snapshot.profile?.city, snapshot.profile?.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <StatusBadge status={snapshot.passport.status} />
                </div>
              </div>
              <div className="grid gap-5 p-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Completude</span>
                    <span>{snapshot.passport.completion_percentage}%</span>
                  </div>
                  <Progress value={snapshot.passport.completion_percentage} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs text-muted-foreground">Faixa</p>
                    <p className="mt-1 font-semibold capitalize">{snapshot.passport.profile_level}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs text-muted-foreground">Aluguel recomendado</p>
                    <p className="mt-1 font-semibold">{formatCurrency(snapshot.passport.recommended_rent)}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs text-muted-foreground">Documentos</p>
                    <p className="mt-1 font-semibold">{snapshot.documents.length} enviados</p>
                  </div>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  Este passaporte so pode ser visualizado mediante consentimento do titular. Arquivos
                  brutos nao sao expostos no link publico.
                </div>
              </div>
            </div>
          )}
        </section>

        <Card className="h-fit rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-emerald-700" aria-hidden="true" />
              Solicitar acesso completo
            </CardTitle>
            <CardDescription>Registre quem esta consultando e o motivo do acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleAccess}>
              <Field icon={UserRound} label="Nome" name="viewer_name" required />
              <Field icon={Mail} label="Email" name="viewer_email" type="email" required />
              <Field icon={Building2} label="Empresa" name="viewer_company" required />
              <Field label="CNPJ opcional" name="viewer_document" />
              <div className="grid gap-2">
                <Label htmlFor="access_reason">Motivo do acesso</Label>
                <Textarea id="access_reason" name="access_reason" required rows={4} />
              </div>
              <Button type="submit" className="h-10 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                Ver detalhes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  icon: Icon,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        {Icon ? <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /> : null}
        <Input id={name} name={name} type={type} required={required} className={Icon ? "pl-9" : ""} />
      </div>
    </div>
  );
}
