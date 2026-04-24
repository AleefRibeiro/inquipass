import { Badge } from "@/components/ui/badge";
import type { DocumentStatus, PassportStatus, ProfileLevel, VerificationStatus } from "@/lib/types";

const labels: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em analise",
  verified: "Verificado",
  expired: "Expirado",
  pending: "Pendente",
  uploaded: "Enviado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  requested: "Solicitada",
  confirmed: "Confirmada",
  basic: "Basico",
  complete: "Completo",
};

export function StatusBadge({
  status,
}: {
  status: PassportStatus | DocumentStatus | VerificationStatus | ProfileLevel | "requested" | "confirmed";
}) {
  const variant =
    status === "verified" || status === "approved" || status === "confirmed"
      ? "default"
      : status === "rejected" || status === "expired"
        ? "destructive"
        : "secondary";

  return (
    <Badge
      variant={variant}
      className={
        status === "verified" || status === "approved" || status === "confirmed"
          ? "bg-emerald-600 text-white hover:bg-emerald-600"
          : ""
      }
    >
      {labels[status] ?? status}
    </Badge>
  );
}
