"use client";

import Link from "next/link";
import { FileCheck2, FileX2, ShieldCheck, WalletCards } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInquiPassStore } from "@/lib/mock-store";
import { documentLabel, formatCurrency } from "@/lib/calculations";

export default function AdminPage() {
  const {
    ready,
    activeAccount,
    state,
    getSnapshot,
    updateDocumentStatus,
    markIncomeVerified,
    markPassportVerified,
  } = useInquiPassStore();

  if (!ready) {
    return <LoadingState />;
  }

  if (!state || activeAccount?.account_type !== "admin") {
    return (
      <DashboardShell title="Admin interno">
        <Card className="rounded-md">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Entre com admin@demo.com para revisar passaportes.</p>
            <Button asChild className="h-10 rounded-md">
              <Link href="/login">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const rows = state.tenant_passports
    .map((passport) => getSnapshot(passport.id))
    .filter(Boolean);

  return (
    <DashboardShell
      title="Admin interno"
      description="Revise documentos, renda e status dos passaportes cadastrados."
    >
      <div className="grid gap-6">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Passaportes</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completude</TableHead>
                  <TableHead>Docs enviados</TableHead>
                  <TableHead>Renda</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((snapshot) => {
                  if (!snapshot) {
                    return null;
                  }

                  return (
                    <TableRow key={snapshot.passport.id}>
                      <TableCell className="font-medium">{snapshot.profile?.full_name}</TableCell>
                      <TableCell>
                        <StatusBadge status={snapshot.passport.status} />
                      </TableCell>
                      <TableCell>{snapshot.passport.completion_percentage}%</TableCell>
                      <TableCell>{snapshot.documents.length}</TableCell>
                      <TableCell>{formatCurrency(snapshot.income?.verified_income ?? 0)}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          className="h-9 rounded-md"
                          onClick={() => markIncomeVerified(snapshot.passport.id)}
                        >
                          <WalletCards className="size-4" aria-hidden="true" />
                          Marcar renda
                        </Button>
                        <Button className="h-9 rounded-md" onClick={() => markPassportVerified(snapshot.passport.id)}>
                          <ShieldCheck className="size-4" aria-hidden="true" />
                          Verificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {rows.map((snapshot) => {
            if (!snapshot) {
              return null;
            }

            return (
              <Card key={snapshot.passport.id} className="rounded-md">
                <CardHeader>
                  <CardTitle className="text-base">Documentos de {snapshot.profile?.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {snapshot.documents.map((document) => (
                    <div key={document.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{documentLabel(document.document_type)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{document.file_name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={document.status} />
                        <Button
                          variant="outline"
                          className="h-9 rounded-md"
                          onClick={() => updateDocumentStatus(document.id, "approved")}
                        >
                          <FileCheck2 className="size-4" aria-hidden="true" />
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          className="h-9 rounded-md"
                          onClick={() => updateDocumentStatus(document.id, "rejected", "Rejeitado na revisao manual do MVP")}
                        >
                          <FileX2 className="size-4" aria-hidden="true" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!snapshot.documents.length ? (
                    <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
