import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, CheckCircle, ShieldCheck, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: "IA para Psicólogos",
    description: "Otimize seu tempo com resumos de sessão, insights e sugestões de plano de tratamento gerados por IA.",
    dataAiHint: "cérebro tecnologia"
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    title: "Agenda Inteligente",
    description: "Gerenciamento fácil de consultas, lembretes automáticos e visualização clara da sua semana.",
    dataAiHint: "calendário organização"
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: "Prontuários Seguros",
    description: "Registros criptografados e em conformidade com a LGPD, garantindo a privacidade dos seus pacientes.",
    dataAiHint: "segurança dados"
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
    title: "Métricas e Relatórios",
    description: "Acompanhe o progresso dos pacientes e a performance da sua clínica com dados visuais.",
    dataAiHint: "gráfico análise"
  },
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-headline font-bold text-primary">Thalamus</span>
          </Link>
          <nav className="flex items-center gap-4">
            {/* <Link href="/features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Recursos</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Preços</Link> */}
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/signup">Criar Conta Grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24 lg:py-32">
          <div className="space-y-6">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary">
              Eleve sua Prática Psicológica com Inteligência Artificial
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
              Thalamus é a plataforma completa para psicólogos modernos. Agenda, prontuários seguros, insights com IA e ferramentas que transformam sua rotina clínica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6">
                <Link href="/signup">
                  <span>
                    Comece Agora (Grátis por 14 dias)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
              {/* <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Demonstração
              </Button> */}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <Image
              src="https://placehold.co/600x400.png" // Placeholder image
              alt="Interface da plataforma Thalamus em um laptop"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl"
              data-ai-hint="software interface"
            />
             <div className="absolute -top-8 -right-8 bg-primary/10 p-4 rounded-lg shadow-lg w-48">
                <Brain className="w-6 h-6 text-primary mb-2" />
                <p className="text-xs font-semibold text-primary-foreground/80">Insights de IA potencializando sua clínica.</p>
            </div>
             <div className="absolute -bottom-8 -left-8 bg-secondary p-4 rounded-lg shadow-lg w-56">
                <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-xs font-semibold text-secondary-foreground">"Finalmente uma ferramenta que entende minhas necessidades!" - Psicóloga Satisfeita</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold sm:text-4xl">Tudo que Você Precisa em um Só Lugar</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Funcionalidades pensadas para simplificar seu dia a dia e potencializar seus atendimentos.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                  <CardHeader className="items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24">
          <div className="container text-center">
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">Pronto para Transformar Sua Prática?</h2>
            <p className="mt-4 mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
              Junte-se a centenas de psicólogos que estão usando o Thalamus para focar no que realmente importa: seus pacientes.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6">
              <Link href="/signup">
                <span>
                  Experimente o Thalamus Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Thalamus. Todos os direitos reservados.</p>
          <nav className="flex gap-4">
            <Link href="/terms-of-service" className="hover:text-primary">Termos de Serviço</Link>
            <Link href="/privacy-policy" className="hover:text-primary">Política de Privacidade</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
