import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-6 bg-gradient-to-br from-background to-secondary">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-3xl font-headline font-bold text-center">Política de Privacidade Thalamus</h1>
        <p className="text-muted-foreground leading-relaxed">
          Sua privacidade é prioridade no Thalamus. Todas as informações coletadas
          são utilizadas exclusivamente para oferecer e aprimorar nossos serviços.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Mantemos seus dados protegidos de acordo com a Lei Geral de Proteção de
          Dados (LGPD) e não compartilhamos suas informações pessoais com terceiros
          sem o seu consentimento.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Ao utilizar o Thalamus, você concorda com o tratamento de dados descrito
          nesta política. Em caso de dúvidas, entre em contato com nossa equipe de
          suporte.
        </p>
      </div>
      <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
        <Link href="/">Voltar para a Página Inicial</Link>
      </Button>
    </div>
  );
}
