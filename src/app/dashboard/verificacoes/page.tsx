"use client";

import Link from "next/link";
import { CheckCircle2, PlugZap, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInquiPassStore } from "@/lib/mock-store";
import { verificationLabel } from "@/lib/calculations";

const futureProviders = ["Serasa", "Quod", "Unico", "Clicksign", "Pluggy/Open Finance"];

export default function VerificationsPage() {
  const { ready, activePassport, activeSnapshot, simulateVerifications } = useInquiPassStore();

  if (!ready) {
    return <LoadingState />;
  }

  if (!activePassport || !activeSnapshot) {
    return (
      <DashboardShell title="Verificacoes">
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

  const allVerified = activeSnapshot.checks.every((check) => check.status === "verified");

  return (
    <DashboardShell
      title="Verificacoes"
      description="Simule a camada antifraude e de validacao. Os providers reais ja tem pontos de extensao no backend."
    >
      <div className="grid gap-6">
        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Status das verificacoes</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Identidade, CPF, credito, antifraude e renda podem ser substituidos por providers reais.
              </p>
            </div>
            <Button className="h-10 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => simulateVerifications(activePassport.id)}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              Simular verificacao
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {activeSnapshot.checks.map((check) => (
              <div key={check.id} className="flex items-center justify-between gap-4 rounded-md border p-4">
                <div>
                  <p className="font-medium">{verificationLabel(check.check_type)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Provider: {check.provider} {check.score ? `| score ${check.score}` : ""}
                  </p>
                </div>
                <StatusBadge status={check.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlugZap className="size-5 text-emerald-700" aria-hidden="true" />
                Preparado para integracoes
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {futureProviders.map((provider) => (
                <p key={provider} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-700" aria-hidden="true" />
                  {provider}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-md bg-slate-950 text-white">
            <CardContent className="p-6">
              <p className="text-sm text-white/70">Resultado</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">
                {allVerified ? "Verificacoes concluidas" : "Ainda ha verificacoes pendentes"}
              </p>
              <Button asChild className="mt-5 h-10 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                <Link href="/passport">Visualizar passaporte</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
