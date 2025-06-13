import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
      <header className="container mx-auto py-6 px-4 md:px-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold text-primary">PsiGuard</h1>
          </div>
          <nav>
            <Button variant="ghost" asChild>
              <Link href={APP_ROUTES.login}>Entrar</Link>
            </Button>
            <Button asChild className="ml-2">
              <Link href={APP_ROUTES.signup}>Cadastre-se</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center justify-center text-center px-4 py-12 md:py-24">
        <h2 className="text-5xl md:text-6xl font-headline font-bold mb-6 text-foreground">
          Capacitando Profissionais de Saúde Mental
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          PsiGuard oferece uma plataforma segura, intuitiva e aprimorada por IA para gerenciar seu consultório de psicologia, para que você possa focar no que mais importa: seus pacientes.
        </p>
        <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={APP_ROUTES.dashboard}>Comece Agora</Link>
        </Button>
      </main>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-headline font-bold text-center mb-12 text-foreground">Principais Funcionalidades</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-10 h-10 text-accent" />}
              title="Seguro e Confiável"
              description="Controle de acesso baseado em função e criptografia AES do lado do cliente para prontuários garantem a privacidade e segurança dos dados."
            />
            <FeatureCard
              icon={<Brain className="w-10 h-10 text-accent" />}
              title="Insights com IA"
              description="Use IA para análise de notas de sessão, geração de modelos e identificação de tendências de progresso do paciente."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-accent" />}
              title="Fluxo de Trabalho Otimizado"
              description="Agendamento integrado, gerenciamento de tarefas e notificações automatizadas para otimizar seu consultório."
            />
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PsiGuard. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="items-center">
        {icon}
      </CardHeader>
      <CardContent>
        <CardTitle className="font-headline text-2xl mb-2 text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
