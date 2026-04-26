"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ClipboardCheck,
  FileText,
  Gauge,
  History,
  Home,
  IdCard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useInquiPassStore } from "@/lib/mock-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const tenantNav = [
  { href: "/dashboard", label: "Painel", icon: Gauge },
  { href: "/dashboard/dados-pessoais", label: "Dados pessoais", icon: UserRound },
  { href: "/dashboard/documentos", label: "Documentos", icon: FileText },
  { href: "/dashboard/renda", label: "Renda", icon: WalletCards },
  { href: "/dashboard/historico", label: "Historico", icon: History },
  { href: "/dashboard/referencias", label: "Referencias", icon: Users },
  { href: "/dashboard/verificacoes", label: "Verificacoes", icon: ShieldCheck },
  { href: "/passport", label: "Passaporte", icon: IdCard },
];

const agencyNav = [
  { href: "/imobiliaria", label: "Imobiliaria", icon: Building2 },
  { href: "/passport/public/demo-marina-costa", label: "Link demo", icon: IdCard },
];

const adminNav = [
  { href: "/admin", label: "Admin", icon: ClipboardCheck },
  { href: "/dashboard", label: "Demo inquilino", icon: Home },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { activeAccount } = useInquiPassStore();
  const nav =
    activeAccount?.account_type === "agency"
      ? agencyNav
      : activeAccount?.account_type === "admin"
        ? adminNav
        : tenantNav;

  return (
    <nav className="grid gap-1">
      {nav.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { activeAccount, logout } = useInquiPassStore();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="size-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navegacao</SheetTitle>
                  <Logo href="/dashboard" />
                </SheetHeader>
                <div className="mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            <Logo href="/dashboard" />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm sm:block">
              <span className="block font-medium">{activeAccount?.full_name ?? "Visitante"}</span>
              <span className="block text-xs text-muted-foreground">{activeAccount?.email ?? "modo demo"}</span>
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Sair"
              onClick={() => {
                void handleLogout();
              }}
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <NavLinks />
          </div>
        </aside>
        <main className="min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">{title}</h1>
            {description ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
