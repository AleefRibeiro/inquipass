"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Save } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInquiPassStore } from "@/lib/mock-store";

export default function PersonalDataPage() {
  const { ready, activeProfile, updateProfile } = useInquiPassStore();
  const [consentOverride, setConsentOverride] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  if (!ready) {
    return <LoadingState />;
  }

  if (!activeProfile) {
    return (
      <DashboardShell title="Dados pessoais">
        <Card className="rounded-md">
          <CardContent className="p-6">
            <Button asChild className="h-10 rounded-md">
              <Link href="/login">Entrar para preencher</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const consent = consentOverride ?? activeProfile.lgpd_consent;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateProfile({
      full_name: String(data.get("full_name")),
      cpf: String(data.get("cpf")),
      birth_date: String(data.get("birth_date")),
      email: String(data.get("email")),
      phone: String(data.get("phone")),
      marital_status: String(data.get("marital_status")),
      profession: String(data.get("profession")),
      city: String(data.get("city")),
      state: String(data.get("state")),
      current_address: String(data.get("current_address")),
      lgpd_consent: consent,
    });
    setSaved(true);
  }

  return (
    <DashboardShell
      title="Dados pessoais"
      description="Essas informacoes formam a base do seu passaporte e precisam do seu consentimento LGPD."
    >
      <Card className="rounded-md">
        <CardContent className="p-6">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo" name="full_name" defaultValue={activeProfile.full_name} required />
              <Field label="CPF" name="cpf" defaultValue={activeProfile.cpf} required />
              <Field label="Data de nascimento" name="birth_date" type="date" defaultValue={activeProfile.birth_date} required />
              <Field label="Email" name="email" type="email" defaultValue={activeProfile.email} required />
              <Field label="Celular" name="phone" defaultValue={activeProfile.phone} required />
              <div className="grid gap-2">
                <Label>Estado civil</Label>
                <Select name="marital_status" defaultValue={activeProfile.marital_status || "Solteiro"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado">Casado(a)</SelectItem>
                    <SelectItem value="Uniao estavel">Uniao estavel</SelectItem>
                    <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="Viuvo">Viuvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Profissao" name="profession" defaultValue={activeProfile.profession} required />
              <Field label="Cidade" name="city" defaultValue={activeProfile.city} required />
              <Field label="Estado" name="state" defaultValue={activeProfile.state} required />
              <Field label="Endereco atual" name="current_address" defaultValue={activeProfile.current_address} required />
            </div>

            <label className="flex items-start gap-3 rounded-md border bg-slate-50 p-4 text-sm">
              <Checkbox checked={consent} onCheckedChange={(value) => setConsentOverride(Boolean(value))} />
              <span>
                Autorizo o tratamento dos meus dados pessoais para criacao, verificacao e compartilhamento do
                meu InquiPass conforme a LGPD.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="h-10 rounded-md" disabled={!consent}>
                <Save className="size-4" aria-hidden="true" />
                Salvar dados
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-md">
                <Link href="/dashboard/documentos">
                  Proximo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              {saved ? <span className="text-sm text-emerald-700">Dados salvos.</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}
