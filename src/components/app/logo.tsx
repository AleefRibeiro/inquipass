import Link from "next/link";
import { FileKey2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <FileKey2 className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg tracking-normal">InquiPass</span>
    </Link>
  );
}
