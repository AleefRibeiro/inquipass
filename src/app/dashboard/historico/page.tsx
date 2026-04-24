"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Save, Upload } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInquiPassStore } from "@/lib/mock-store";
import { uploadPassportDocument } from "@/lib/supabase/storage";

export default function RentalHistoryPage() {
  const { ready, activePassport, activeSnapshot, updateHistory } = useInquiPassStore();
  const history = activeSnapshot?.rentalHistory;
  const [hasRentedOverride, setHasRentedOverride] = useState<boolean | null>(null);
  const [proofName, setProofName] = useState("");
  const [saved, setSaved] = useState(false);

  if (!ready) {
    return <LoadingState />;
  }

  if (!activePassport) {
    return (
      <DashboardShell title="Historico de aluguel">
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

  const hasRented = hasRentedOverride ?? history?.has_rented_before ?? true;

  async function handleProof(file?: File) {
    if (!file || !activePassport) {
      return;
    }

    const uploaded = await uploadPassportDocument({
      passportId: activePassport.id,
      documentType: "rental_history_proof",
      file,
    });

    setProofName(uploaded.fileName);
    updateHistory(activePassport.id, { proof_file_url: uploaded.fileUrl });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePassport) {
      return;
    }

    const data = new FormData(event.currentTarget);

    updateHistory(activePassport.id, {
      has_rented_before: hasRented,
      previous_landlord_name: String(data.get("previous_landlord_name")),
      previous_landlord_contact: String(data.get("previous_landlord_contact")),
      rental_period: String(data.get("rental_period")),
      rent_amount: Number(data.get("rent_amount")),
      paid_on_time: String(data.get("paid_on_time")) === "sim",
      notes: String(data.get("notes")),
    });
    setSaved(true);
  }

  return (
    <DashboardShell
      title="Historico de aluguel"
      description="Registre experiencias anteriores de locacao e comprovantes que ajudem na analise."
    >
      <Card className="rounded-md">
        <CardContent className="p-6">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Ja alugou imovel antes?</Label>
                <Select value={hasRented ? "sim" : "nao"} onValueChange={(value) => setHasRentedOverride(value === "sim")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Nao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Nome da imobiliaria/proprietario anterior" name="previous_landlord_name" defaultValue={history?.previous_landlord_name} disabled={!hasRented} />
              <Field label="Contato anterior" name="previous_landlord_contact" defaultValue={history?.previous_landlord_contact} disabled={!hasRented} />
              <Field label="Periodo de locacao" name="rental_period" defaultValue={history?.rental_period} disabled={!hasRented} />
              <NumberField label="Valor do aluguel" name="rent_amount" defaultValue={history?.rent_amount ?? 0} disabled={!hasRented} />
              <div className="grid gap-2">
                <Label>Pagava em dia?</Label>
                <Select name="paid_on_time" defaultValue={history?.paid_on_time === false ? "nao" : "sim"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Nao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea id="notes" name="notes" defaultValue={history?.notes} rows={4} />
            </div>

            <Label htmlFor="history-proof" className="flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm text-muted-foreground hover:bg-slate-100">
              <Upload className="size-5" aria-hidden="true" />
              {proofName || "Enviar comprovantes de aluguel"}
            </Label>
            <Input id="history-proof" type="file" className="sr-only" onChange={(event) => handleProof(event.target.files?.[0])} />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="h-10 rounded-md">
                <Save className="size-4" aria-hidden="true" />
                Salvar historico
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-md">
                <Link href="/dashboard/referencias">
                  Proximo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              {saved ? <span className="text-sm text-emerald-700">Historico salvo.</span> : null}
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
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: number;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="number" min="0" step="100" defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}
