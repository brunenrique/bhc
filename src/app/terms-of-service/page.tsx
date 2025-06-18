import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-6 bg-gradient-to-br from-background to-secondary">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-3xl font-headline font-bold text-center">Termos de Serviço Thalamus</h1>
        <p className="text-muted-foreground leading-relaxed">
          Ao acessar e utilizar o Thalamus, você concorda em cumprir estes termos.
          O serviço é fornecido no estado em que se encontra e pode ser alterado
          ou interrompido a qualquer momento.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          É sua responsabilidade manter suas credenciais seguras e garantir que o
          uso da plataforma esteja em conformidade com as leis aplicáveis.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Reservamo-nos o direito de atualizar estes termos periodicamente. O uso
          contínuo do Thalamus após mudanças implica sua concordância com as novas
          condições.
        </p>
      </div>
      <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
        <Link href="/">Voltar para a Página Inicial</Link>
      </Button>
    </div>
  );
}
