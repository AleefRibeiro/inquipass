"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Copy, Eye, FileText, Send, ShieldCheck, WalletCards } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { MetricCard } from "@/components/app/metric-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInquiPassStore } from "@/lib/mock-store";
import { formatCurrency, formatPercent } from "@/lib/calculations";

export default function TenantDashboardPage() {
  const { ready, activeAccount, activeSnapshot, activePassport, ensureShareToken } = useInquiPassStore();

  if (!ready) {
    return <LoadingState />;
  }

  if (!activeAccount || !activeSnapshot || !activePassport) {
    return (
      <DashboardShell title="Painel do inquilino" description="Entre para criar e gerenciar seu passaporte.">
        <Card className="rounded-md">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Use a conta demo de inquilino ou crie uma nova conta.</p>
            <Button asChild className="h-10 rounded-md">
              <Link href="/login">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const checklist = [
    ["Dados pessoais", Boolean(activeSnapshot.profile?.lgpd_consent), "/dashboard/dados-pessoais"],
    ["Documentos", activeSnapshot.documents.length >= 3, "/dashboard/documentos"],
    ["Renda", Boolean(activeSnapshot.income?.verified_income), "/dashboard/renda"],
    ["Historico de aluguel", Boolean(activeSnapshot.rentalHistory), "/dashboard/historico"],
    ["Referencias", activeSnapshot.references.length > 0, "/dashboard/referencias"],
    [
      "Verificacoes",
      activeSnapshot.checks.every((check) => check.status === "verified"),
      "/dashboard/verificacoes",
    ],
    ["Revisao final", activePassport.completion_percentage >= 90, "/passport"],
  ] as const;

  const nextStep = checklist.find((item) => !item[1]) ?? checklist[checklist.length - 1];

  function copyShareLink() {
    if (!activePassport) {
      return;
    }

    const token = ensureShareToken(activePassport.id);
    const link = `${window.location.origin}/passport/public/${token}`;
    navigator.clipboard?.writeText(link);
  }

  return (
    <DashboardShell
      title="Dashboard do inquilino"
      description="Acompanhe a criacao do seu passaporte, complete pendencias e compartilhe um link seguro."
    >
      <div className="grid gap-6">
        <section className="rounded-md border bg-white p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-emerald-700">Seu InquiPass</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Seu InquiPass esta {formatPercent(activePassport.completion_percentage)} completo
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Complete os blocos abaixo para gerar um dossie mais forte. A decisao final sempre fica com
                a imobiliaria ou proprietario.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="h-10 rounded-md">
                <Link href="/passport">
                  <Eye className="size-4" aria-hidden="true" />
                  Visualizar passaporte
                </Link>
              </Button>
              <Button className="h-10 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" onClick={copyShareLink}>
                <Copy className="size-4" aria-hidden="true" />
                Compartilhar link
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <Progress value={activePassport.completion_percentage} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard icon={ShieldCheck} label="Status do passaporte" value={activePassport.status === "draft" ? "Rascunho" : "Verificado"} />
          <MetricCard
            icon={WalletCards}
            label="Aluguel recomendado"
            value={formatCurrency(activePassport.recommended_rent)}
            detail="30% da renda comprovada"
          />
          <MetricCard
            icon={FileText}
            label="Documentos"
            value={`${activeSnapshot.documents.length}/5`}
            detail="Obrigatorios e opcionais"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Checklist do passaporte</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {checklist.map(([label, done, href]) => (
                <Link
                  href={href}
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-md border p-3 transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    {done ? (
                      <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" />
                    ) : (
                      <Clock3 className="size-5 text-muted-foreground" aria-hidden="true" />
                    )}
                    {label}
                  </span>
                  <StatusBadge status={done ? "verified" : "pending"} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Proximos passos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">Continue por</p>
                <p className="mt-1 font-semibold">{nextStep[0]}</p>
              </div>
              <Button asChild className="h-10 rounded-md">
                <Link href={nextStep[2]}>Continuar preenchimento</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-md">
                <Link href="/passport/public/demo-marina-costa">
                  <Send className="size-4" aria-hidden="true" />
                  Abrir link publico demo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
