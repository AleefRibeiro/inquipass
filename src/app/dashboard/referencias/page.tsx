"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInquiPassStore } from "@/lib/mock-store";

export default function ReferencesPage() {
  const { ready, activePassport, activeSnapshot, addReference, removeReference } = useInquiPassStore();
  const references = activeSnapshot?.references ?? [];

  if (!ready) {
    return <LoadingState />;
  }

  if (!activePassport) {
    return (
      <DashboardShell title="Referencias">
        <Card className="rounded-md">
          <CardContent className="p-6">
            <Button asChild className="h-10 rounded-md">
              <Link href="/login">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePassport) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    addReference(activePassport.id, {
      name: String(data.get("name")),
      relationship: String(data.get("relationship")),
      email: String(data.get("email")),
      phone: String(data.get("phone")),
      status: "pending",
      notes: String(data.get("notes")),
    });

    form.reset();
  }

  return (
    <DashboardShell
      title="Referencias"
      description="Adicione ate 3 referencias. No MVP, os dados ficam salvos sem envio real de email."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          {references.map((reference) => (
            <Card key={reference.id} className="rounded-md">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{reference.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{reference.relationship}</p>
                </div>
                <StatusBadge status={reference.status} />
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <p>{reference.email}</p>
                <p>{reference.phone}</p>
                {reference.notes ? <p>{reference.notes}</p> : null}
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-fit rounded-md"
                  onClick={() => removeReference(reference.id)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remover
                </Button>
              </CardContent>
            </Card>
          ))}
          {!references.length ? (
            <div className="rounded-md border border-dashed bg-white p-8 text-sm text-muted-foreground">
              Nenhuma referencia cadastrada.
            </div>
          ) : null}
        </div>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Nova referencia</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Field label="Nome" name="name" required />
              <Field label="Relacao" name="relationship" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Telefone" name="phone" required />
              <div className="grid gap-2">
                <Label htmlFor="notes">Observacao</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <Button type="submit" className="h-10 rounded-md" disabled={references.length >= 3}>
                <Plus className="size-4" aria-hidden="true" />
                Adicionar
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-md">
                <Link href="/dashboard/verificacoes">
                  Proximo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}
