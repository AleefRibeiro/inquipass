import {
  BadgeCheck,
  CalendarDays,
  FileText,
  IdCard,
  Landmark,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/app/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  countApprovedDocuments,
  documentLabel,
  formatCurrency,
  formatPercent,
  verificationLabel,
} from "@/lib/calculations";
import { formatDate } from "@/lib/date";
import type { PassportSnapshot } from "@/lib/types";

export function PassportView({
  snapshot,
  publicMode = false,
  onRequestAccess,
}: {
  snapshot: PassportSnapshot;
  publicMode?: boolean;
  onRequestAccess?: () => void;
}) {
  const { profile, passport, documents, income, rentalHistory, references, checks } = snapshot;
  const initials =
    profile?.full_name
      ?.split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "IP";

  const verifiedChecks = checks.filter((check) => check.status === "verified").length;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-md border bg-white">
        <div className="bg-slate-950 px-6 py-8 text-white">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border border-white/20">
                <AvatarFallback className="bg-emerald-500 text-xl font-semibold text-slate-950">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-500 text-slate-950 hover:bg-emerald-500">
                    <BadgeCheck className="mr-1 size-3" aria-hidden="true" />
                    InquiPass Verificado
                  </Badge>
                  <StatusBadge status={passport.profile_level} />
                </div>
                <h2 className="text-3xl font-semibold tracking-normal">{profile?.full_name ?? "Inquilino"}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="size-4" aria-hidden="true" />
                  {[profile?.city, profile?.state].filter(Boolean).join(", ") || "Cidade nao informada"}
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-white/76">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden="true" />
                Emissao: {formatDate(passport.issue_date)}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden="true" />
                Validade: {formatDate(passport.expiration_date)}
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="font-medium">Completude</span>
              <span className="text-sm text-muted-foreground">{formatPercent(passport.completion_percentage)}</span>
            </div>
            <Progress value={passport.completion_percentage} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Identidade verificada", checks.some((check) => check.check_type === "identity" && check.status === "verified")],
                ["Renda comprovada", Boolean(income?.verified_income)],
                ["Historico informado", Boolean(rentalHistory)],
                ["Documentos analisados", documents.length > 0],
                ["Referencias cadastradas", references.length > 0],
              ].map(([label, ok]) => (
                <div key={String(label)} className="flex items-center gap-2 text-sm">
                  <ShieldCheck className={ok ? "size-4 text-emerald-700" : "size-4 text-muted-foreground"} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <Card className="rounded-md bg-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Landmark className="size-4 text-emerald-700" aria-hidden="true" />
                Aluguel recomendado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-normal">{formatCurrency(passport.recommended_rent)}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Regra temporaria do MVP: renda comprovada multiplicada por 30%.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-emerald-700" aria-hidden="true" />
              Documentos disponiveis
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <span className="text-sm font-medium">{documentLabel(document.document_type)}</span>
                <StatusBadge status={document.status} />
              </div>
            ))}
            {!documents.length ? <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p> : null}
            <p className="text-xs text-muted-foreground">
              Arquivos brutos nao sao expostos nesta visualizacao. O acesso completo depende do consentimento do titular.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="size-5 text-emerald-700" aria-hidden="true" />
              Sinais do perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Verificacoes</span>
              <span className="font-medium">
                {verifiedChecks}/{checks.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Docs aprovados</span>
              <span className="font-medium">{countApprovedDocuments(documents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Renda comprovada</span>
              <span className="font-medium">{formatCurrency(income?.verified_income ?? 0)}</span>
            </div>
            <Separator />
            <div className="grid gap-2">
              {checks.map((check) => (
                <div key={check.id} className="flex items-center justify-between gap-3">
                  <span>{verificationLabel(check.check_type)}</span>
                  <StatusBadge status={check.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {publicMode ? (
        <div className="rounded-md border bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Acesso completo mediante consentimento</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Este passaporte so pode ser visualizado mediante consentimento do titular.
              </p>
            </div>
            <Button className="h-10 rounded-md" onClick={onRequestAccess}>
              Solicitar acesso completo
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
