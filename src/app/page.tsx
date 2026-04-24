import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileLock2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const steps = [
  "Crie seu perfil",
  "Envie documentos",
  "Faca as verificacoes",
  "Compartilhe seu passaporte",
];

const tenantBenefits = [
  "Pare de preencher cadastro toda vez",
  "Organize seus documentos em um so lugar",
  "Ganhe mais confianca na negociacao",
  "Compartilhe seu perfil com seguranca",
];

const agencyBenefits = [
  "Receba leads mais completos",
  "Reduza retrabalho de analise",
  "Ganhe velocidade na aprovacao",
  "Consulte informacoes com consentimento do inquilino",
];

const trustItems = [
  { icon: FileLock2, title: "LGPD", text: "Consentimento explicito e dados tratados com finalidade clara." },
  { icon: LockKeyhole, title: "Link seguro", text: "O titular decide quando e com quem compartilhar." },
  { icon: ShieldCheck, title: "Validade", text: "Emissao e expiracao ajudam a manter a analise atualizada." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo className="text-white" />
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="#como-funciona" className="hover:text-white">
              Como funciona
            </a>
            <a href="#beneficios" className="hover:text-white">
              Beneficios
            </a>
            <a href="#precos" className="hover:text-white">
              Precos
            </a>
          </nav>
          <Button asChild className="h-9 rounded-md bg-emerald-500 px-4 text-slate-950 hover:bg-emerald-400">
            <Link href="/cadastro">Criar passaporte</Link>
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-[84svh] items-center overflow-hidden bg-slate-950 pt-20 text-white">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1800&q=85"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.34]"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/90">
              <KeyRound className="size-4" aria-hidden="true" />
              Passaporte portatil para locacao
            </div>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">
              Alugue com menos burocracia usando seu InquiPass.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Crie um perfil verificado com documentos, renda, historico e referencias. Compartilhe
              com imobiliarias e proprietarios em poucos cliques.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-md bg-emerald-500 px-5 text-slate-950 hover:bg-emerald-400">
                <Link href="/cadastro">
                  Criar meu passaporte
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-md border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/login">Sou imobiliaria</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-emerald-700">Como funciona</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">Um dossie pronto para compartilhar</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <Card key={step} className="rounded-md">
                <CardHeader>
                  <span className="flex size-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <CardTitle className="text-base">{step}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRoundCheck className="size-5 text-emerald-700" aria-hidden="true" />
                Para inquilinos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {tenantBenefits.map((benefit) => (
                <p key={benefit} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 text-emerald-700" aria-hidden="true" />
                  {benefit}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-emerald-700" aria-hidden="true" />
                Para imobiliarias
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {agencyBenefits.map((benefit) => (
                <p key={benefit} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 text-emerald-700" aria-hidden="true" />
                  {benefit}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-md border bg-slate-50 p-5">
                  <Icon className="mb-4 size-6 text-emerald-700" aria-hidden="true" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="precos" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="rounded-md border-emerald-200">
              <CardHeader>
                <CardTitle>Inquilino</CardTitle>
                <p className="text-3xl font-semibold tracking-normal">R$ 29,90</p>
                <p className="text-sm text-muted-foreground">Dossie verificado para compartilhar.</p>
              </CardHeader>
              <CardContent>
                <Button asChild className="h-10 rounded-md bg-primary px-4">
                  <Link href="/cadastro">Criar meu InquiPass</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-md">
              <CardHeader>
                <CardTitle>Imobiliaria</CardTitle>
                <p className="text-3xl font-semibold tracking-normal">Sob consulta</p>
                <p className="text-sm text-muted-foreground">Fluxo de consulta e auditoria por consentimento.</p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="h-10 rounded-md px-4">
                  <Link href="/login">Acessar demo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="size-5" aria-hidden="true" />
            <p className="text-sm font-medium uppercase tracking-[0.12em]">FAQ</p>
          </div>
          <div className="mt-6 grid gap-5">
            {[
              ["O InquiPass garante aprovacao?", "Nao. Ele organiza e verifica informacoes, mas a decisao final e da imobiliaria ou proprietario."],
              ["Documentos ficam publicos?", "Nao. O link publico mostra status e resumo. Arquivos brutos nao sao expostos."],
              ["Posso revogar o acesso?", "O MVP registra acessos. A revogacao granular entra como proxima evolucao."],
            ].map(([question, answer]) => (
              <div key={question}>
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{answer}</p>
                <Separator className="mt-5 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo className="text-slate-950" />
          <span>InquiPass MVP. Analise com consentimento, sem prometer aprovacao garantida.</span>
        </div>
      </footer>
    </main>
  );
}
