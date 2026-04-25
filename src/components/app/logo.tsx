import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span className="relative flex size-9 shrink-0 overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src="/inquipass-logo-icon.png"
          alt=""
          fill
          sizes="36px"
          className="object-cover"
          priority
        />
      </span>
      <span className="text-lg tracking-normal">InquiPass</span>
    </Link>
  );
}
