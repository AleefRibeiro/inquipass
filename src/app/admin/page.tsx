"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DocumentStatus, PassportSnapshot, PassportStatus } from "@/lib/types";

type AdminRow = {
  passport: {
    id: string;
    status: PassportStatus;
    completion_percentage: number;
    recommended_rent: number;
  };
  profile?: {
    id: string;
    full_name: string;
    email?: string;
  };
  documents: Array<{
    id: string;
    passport_id: string;
    document_type: string;
    file_name?: string;
    status: DocumentStatus;
  }>;
  income?: {
    passport_id: string;
    verified_income: number;
    status?: string;
  };
  source: "supabase" | "mock";
};

function snapshotToRow(snapshot: PassportSnapshot): AdminRow {
  return {
    passport: snapshot.passport,
    profile: snapshot.profile,
    documents: snapshot.documents,
    income: snapshot.income,
    source: "mock",
  };
}

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
  const [remoteRows, setRemoteRows] = useState<AdminRow[] | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);

  const mockRows = useMemo(
    () =>
      state?.tenant_passports
        .map((passport) => getSnapshot(passport.id))
        .filter(Boolean)
        .map((snapshot) => snapshotToRow(snapshot as PassportSnapshot)) ?? [],
    [getSnapshot, state?.tenant_passports],
  );

  useEffect(() => {
    if (activeAccount?.account_type !== "admin") {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    const client = supabase;

    let cancelled = false;

    async function loadPassports() {
      setRemoteLoading(true);
      const { data: passports, error } = await client
        .from("tenant_passports")
        .select("id,user_id,status,completion_percentage,recommended_rent")
        .order("completion_percentage", { ascending: false });

      if (cancelled) {
        return;
      }

      if (error || !passports?.length) {
        setRemoteRows(error ? null : []);
        setRemoteLoading(false);
        return;
      }

      const userIds = passports.map((passport) => passport.user_id);
      const passportIds = passports.map((passport) => passport.id);

      const [{ data: profiles }, { data: documents }, { data: incomes }] = await Promise.all([
        client.from("users_profile").select("id,full_name,email").in("id", userIds),
        client.from("documents").select("id,passport_id,document_type,file_name,status").in("passport_id", passportIds),
        client.from("income_records").select("passport_id,verified_income,status").in("passport_id", passportIds),
      ]);

      if (cancelled) {
        return;
      }

      setRemoteRows(
        passports.map((passport) => ({
          passport: {
            id: passport.id,
            status: passport.status as PassportStatus,
            completion_percentage: passport.completion_percentage,
            recommended_rent: Number(passport.recommended_rent ?? 0),
          },
          profile: profiles?.find((profile) => profile.id === passport.user_id),
          documents:
            documents
              ?.filter((document) => document.passport_id === passport.id)
              .map((document) => ({
                ...document,
                file_name: document.file_name ?? undefined,
                status: document.status as DocumentStatus,
              })) ?? [],
          income: incomes?.find((income) => income.passport_id === passport.id)
            ? {
                passport_id: passport.id,
                verified_income: Number(
                  incomes.find((income) => income.passport_id === passport.id)?.verified_income ?? 0,
                ),
                status: incomes.find((income) => income.passport_id === passport.id)?.status ?? undefined,
              }
            : undefined,
          source: "supabase",
        })),
      );
      setRemoteLoading(false);
    }

    loadPassports();

    return () => {
      cancelled = true;
    };
  }, [activeAccount?.account_type]);

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

  const rows = remoteRows ?? mockRows;

  async function handleDocumentStatus(documentId: string, status: DocumentStatus) {
    const supabase = getSupabaseBrowserClient();
    if (supabase && remoteRows) {
      await supabase
        .from("documents")
        .update({
          status,
          rejection_reason: status === "rejected" ? "Rejeitado na revisao manual." : null,
        })
        .eq("id", documentId);

      setRemoteRows((current) =>
        current?.map((row) => ({
          ...row,
          documents: row.documents.map((document) =>
            document.id === documentId ? { ...document, status } : document,
          ),
        })) ?? null,
      );
      return;
    }

    updateDocumentStatus(
      documentId,
      status,
      status === "rejected" ? "Rejeitado na revisao manual do MVP" : undefined,
    );
  }

  async function handleIncomeVerified(passportId: string) {
    const supabase = getSupabaseBrowserClient();
    if (supabase && remoteRows) {
      await supabase
        .from("income_records")
        .update({ status: "verified" })
        .eq("passport_id", passportId);

      setRemoteRows((current) =>
        current?.map((row) =>
          row.passport.id === passportId && row.income
            ? { ...row, income: { ...row.income, status: "verified" } }
            : row,
        ) ?? null,
      );
      return;
    }

    markIncomeVerified(passportId);
  }

  async function handlePassportVerified(passportId: string) {
    const supabase = getSupabaseBrowserClient();
    if (supabase && remoteRows) {
      await supabase.from("tenant_passports").update({ status: "verified" }).eq("id", passportId);
      setRemoteRows((current) =>
        current?.map((row) =>
          row.passport.id === passportId
            ? { ...row, passport: { ...row.passport, status: "verified" } }
            : row,
        ) ?? null,
      );
      return;
    }

    markPassportVerified(passportId);
  }

  return (
    <DashboardShell
      title="Admin interno"
      description="Revise documentos, renda e status dos passaportes cadastrados."
    >
      <div className="grid gap-6">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Passaportes {remoteLoading ? "carregando..." : ""}</CardTitle>
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
                {rows.map((row) => {
                  return (
                    <TableRow key={row.passport.id}>
                      <TableCell className="font-medium">{row.profile?.full_name}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.passport.status} />
                      </TableCell>
                      <TableCell>{row.passport.completion_percentage}%</TableCell>
                      <TableCell>{row.documents.length}</TableCell>
                      <TableCell>{formatCurrency(row.income?.verified_income ?? 0)}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          className="h-9 rounded-md"
                          onClick={() => handleIncomeVerified(row.passport.id)}
                        >
                          <WalletCards className="size-4" aria-hidden="true" />
                          Marcar renda
                        </Button>
                        <Button className="h-9 rounded-md" onClick={() => handlePassportVerified(row.passport.id)}>
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
          {rows.map((row) => {
            return (
              <Card key={row.passport.id} className="rounded-md">
                <CardHeader>
                  <CardTitle className="text-base">Documentos de {row.profile?.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {row.documents.map((document) => (
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
                          onClick={() => handleDocumentStatus(document.id, "approved")}
                        >
                          <FileCheck2 className="size-4" aria-hidden="true" />
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          className="h-9 rounded-md"
                          onClick={() => handleDocumentStatus(document.id, "rejected")}
                        >
                          <FileX2 className="size-4" aria-hidden="true" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!row.documents.length ? (
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
