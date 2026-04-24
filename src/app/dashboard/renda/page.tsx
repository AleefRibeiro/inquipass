"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Save, Upload, WalletCards } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { MetricCard } from "@/components/app/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInquiPassStore } from "@/lib/mock-store";
import { calculateRecommendedRent, formatCurrency } from "@/lib/calculations";
import { uploadPassportDocument } from "@/lib/supabase/storage";
import type { IncomeType } from "@/lib/types";

export default function IncomePage() {
  const { ready, activePassport, activeSnapshot, updateIncome } = useInquiPassStore();
  const income = activeSnapshot?.income;
  const [declaredOverride, setDeclaredOverride] = useState<number | null>(null);
  const [verifiedOverride, setVerifiedOverride] = useState<number | null>(null);
  const [proofName, setProofName] = useState("");
  const [saved, setSaved] = useState(false);

  if (!ready) {
    return <LoadingState />;
  }

  if (!activePassport) {
    return (
      <DashboardShell title="Renda">
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

  const declared = declaredOverride ?? income?.declared_income ?? 0;
  const verified = verifiedOverride ?? income?.verified_income ?? 0;

  async function handleProof(file?: File) {
    if (!file || !activePassport) {
      return;
    }

    const uploaded = await uploadPassportDocument({
      passportId: activePassport.id,
      documentType: "income_extra_proof",
      file,
    });

    setProofName(uploaded.fileName);
    updateIncome(activePassport.id, { proof_file_url: uploaded.fileUrl });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePassport) {
      return;
    }

    const data = new FormData(event.currentTarget);

    updateIncome(activePassport.id, {
      income_type: String(data.get("income_type")) as IncomeType,
      declared_income: Number(data.get("declared_income")),
      verified_income: Number(data.get("verified_income")),
      company_name: String(data.get("company_name")),
      activity_time: String(data.get("activity_time")),
      complementary_income: Number(data.get("complementary_income")),
    });

    setSaved(true);
  }

  const recommended = calculateRecommendedRent(verified);

  return (
    <DashboardShell
      title="Renda"
      description="Informe a renda declarada e a renda comprovada. A recomendacao temporaria usa 30% da renda comprovada."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard icon={WalletCards} label="Renda declarada" value={formatCurrency(declared)} />
          <MetricCard icon={WalletCards} label="Renda comprovada" value={formatCurrency(verified)} />
          <MetricCard icon={WalletCards} label="Comprometimento sugerido" value={formatCurrency(recommended)} detail="Aluguel recomendado" />
        </section>

        <Card className="rounded-md">
          <CardContent className="p-6">
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Tipo de renda</Label>
                  <Select name="income_type" defaultValue={income?.income_type ?? "CLT"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="autonomo">Autonomo</SelectItem>
                      <SelectItem value="aposentado">Aposentado</SelectItem>
                      <SelectItem value="estudante">Estudante</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <NumberField
                  label="Renda mensal declarada"
                  name="declared_income"
                  defaultValue={income?.declared_income ?? 0}
                  onChange={setDeclaredOverride}
                />
                <NumberField
                  label="Renda comprovada"
                  name="verified_income"
                  defaultValue={income?.verified_income ?? 0}
                  onChange={setVerifiedOverride}
                />
                <Field label="Empresa/atividade" name="company_name" defaultValue={income?.company_name} />
                <Field label="Tempo na atividade" name="activity_time" defaultValue={income?.activity_time} />
                <NumberField
                  label="Renda complementar"
                  name="complementary_income"
                  defaultValue={income?.complementary_income ?? 0}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="income-proof" className="flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm text-muted-foreground hover:bg-slate-100">
                  <Upload className="size-5" aria-hidden="true" />
                  {proofName || "Enviar comprovantes adicionais"}
                </Label>
                <Input id="income-proof" type="file" className="sr-only" onChange={(event) => handleProof(event.target.files?.[0])} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="h-10 rounded-md">
                  <Save className="size-4" aria-hidden="true" />
                  Salvar renda
                </Button>
                <Button asChild variant="outline" className="h-10 rounded-md">
                  <Link href="/dashboard/historico">
                    Proximo
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                {saved ? <span className="text-sm text-emerald-700">Renda salva.</span> : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        min="0"
        step="100"
        defaultValue={defaultValue}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </div>
  );
}
