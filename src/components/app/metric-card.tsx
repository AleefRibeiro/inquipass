import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card className="rounded-md">
      <CardContent className="flex items-start gap-3 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm text-muted-foreground">{label}</span>
          <span className="mt-1 block text-2xl font-semibold tracking-normal">{value}</span>
          {detail ? <span className="mt-1 block text-xs text-muted-foreground">{detail}</span> : null}
        </span>
      </CardContent>
    </Card>
  );
}
