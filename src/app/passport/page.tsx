"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { LoadingState } from "@/components/app/loading-state";
import { PassportView } from "@/components/passport/passport-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInquiPassStore } from "@/lib/mock-store";

export default function PassportPage() {
  const { ready, activeSnapshot, activePassport, ensureShareToken } = useInquiPassStore();

  if (!ready) {
    return <LoadingState />;
  }

  if (!activeSnapshot || !activePassport) {
    return (
      <DashboardShell title="Visualizacao do passaporte">
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

  const publicHref = `/passport/public/${activePassport.public_token}`;

  function copyLink() {
    if (!activePassport) {
      return;
    }

    const token = ensureShareToken(activePassport.id);
    navigator.clipboard?.writeText(`${window.location.origin}/passport/public/${token}`);
  }

  return (
    <DashboardShell
      title="Visualizacao do passaporte"
      description="Revise como seu perfil aparece para uma imobiliaria ou proprietario."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Button className="h-10 rounded-md" onClick={copyLink}>
          <Copy className="size-4" aria-hidden="true" />
          Compartilhar link
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-md">
          <Link href={publicHref}>
            <ExternalLink className="size-4" aria-hidden="true" />
            Abrir publico
          </Link>
        </Button>
      </div>
      <PassportView snapshot={activeSnapshot} />
    </DashboardShell>
  );
}
