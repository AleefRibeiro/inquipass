"use client";

import Link from "next/link";
import { Building2, Eye, Landmark, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { MetricCard } from "@/components/app/metric-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInquiPassStore } from "@/lib/mock-store";
import { formatCurrency } from "@/lib/calculations";
import { formatDate } from "@/lib/date";

export default function AgencyDashboardPage() {
  const { ready, activeAccount, state, getSnapshot } = useInquiPassStore();

  if (!ready) {
    return <LoadingState />;
  }

  if (!state || activeAccount?.account_type !== "agency") {
    return (
      <DashboardShell title="Dashboard da imobiliaria">
        <Card className="rounded-md">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Entre com a conta imobiliaria@demo.com para acessar a demo.</p>
            <Button asChild className="h-10 rounded-md">
              <Link href="/login">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const logs = state.share_access_logs.filter(
    (log) => log.viewer_email.toLowerCase() === activeAccount.email.toLowerCase(),
  );

  const rows = logs
    .map((log) => {
      const snapshot = getSnapshot(log.passport_id);
      return snapshot ? { log, snapshot } : undefined;
    })
    .filter(Boolean);

  return (
    <DashboardShell
      title="Dashboard da imobiliaria"
      description="Passaportes acessados por token e registrados na trilha de auditoria."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard icon={UsersRound} label="Passaportes acessados" value={String(rows.length)} />
          <MetricCard icon={Landmark} label="Media aluguel recomendado" value={formatCurrency(avg(rows.map((row) => row!.snapshot.passport.recommended_rent)))} />
          <MetricCard icon={Building2} label="Empresa" value={activeAccount.company_name ?? "Imobiliaria"} />
        </section>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Passaportes consultados</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de acesso</TableHead>
                  <TableHead>Completude</TableHead>
                  <TableHead>Renda comprovada</TableHead>
                  <TableHead>Aluguel recomendado</TableHead>
                  <TableHead className="text-right">Acao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  if (!row) {
                    return null;
                  }
                  const { snapshot, log } = row;

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{snapshot.profile?.full_name}</TableCell>
                      <TableCell>
                        <StatusBadge status={snapshot.passport.status} />
                      </TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell>{snapshot.passport.completion_percentage}%</TableCell>
                      <TableCell>{formatCurrency(snapshot.income?.verified_income ?? 0)}</TableCell>
                      <TableCell>{formatCurrency(snapshot.passport.recommended_rent)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" className="h-9 rounded-md">
                          <Link href={`/passport/public/${snapshot.passport.public_token}`}>
                            <Eye className="size-4" aria-hidden="true" />
                            Ver
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function avg(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
