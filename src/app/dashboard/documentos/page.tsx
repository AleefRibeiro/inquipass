"use client";

import Link from "next/link";
import { ArrowRight, FileUp, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInquiPassStore } from "@/lib/mock-store";
import { documentLabel } from "@/lib/calculations";
import { uploadPassportDocument } from "@/lib/supabase/storage";

const documentTypes = [
  { type: "rg_cnh", required: true },
  { type: "residence_proof", required: true },
  { type: "income_proof", required: true },
  { type: "previous_contract", required: false },
  { type: "rent_receipts", required: false },
];

export default function DocumentsPage() {
  const { ready, activeSnapshot, activePassport, upsertDocument } = useInquiPassStore();

  if (!ready) {
    return <LoadingState />;
  }

  if (!activePassport || !activeSnapshot) {
    return (
      <DashboardShell title="Documentos">
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

  async function handleFile(type: string, file?: File) {
    if (!file || !activePassport) {
      return;
    }

    const uploaded = await uploadPassportDocument({
      passportId: activePassport.id,
      documentType: type,
      file,
    });

    upsertDocument({
      passport_id: activePassport.id,
      document_type: type,
      file_name: uploaded.fileName,
      file_url: uploaded.fileUrl,
      status: "uploaded",
    });
  }

  return (
    <DashboardShell
      title="Documentos"
      description="Envie os arquivos principais. No modo demo, os uploads sao salvos como referencias mockadas; com Supabase configurado, vao para Storage."
    >
      <div className="grid gap-6">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 size-5" aria-hidden="true" />
            <p>O link publico mostra apenas status dos documentos. Arquivos brutos ficam protegidos.</p>
          </div>
        </div>

        <div className="grid gap-4">
          {documentTypes.map((item) => {
            const document = activeSnapshot.documents.find((doc) => doc.document_type === item.type);

            return (
              <Card key={item.type} className="rounded-md">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{documentLabel(item.type)}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.required ? "Obrigatorio" : "Opcional"}
                    </p>
                  </div>
                  <StatusBadge status={document?.status ?? "pending"} />
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Label htmlFor={item.type} className="flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm text-muted-foreground hover:bg-slate-100">
                    <FileUp className="size-5" aria-hidden="true" />
                    {document?.file_name ?? "Selecionar arquivo"}
                  </Label>
                  <Input
                    id={item.type}
                    type="file"
                    className="sr-only"
                    onChange={(event) => handleFile(item.type, event.target.files?.[0])}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button asChild className="h-10 rounded-md">
            <Link href="/dashboard/renda">
              Proximo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
