import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 space-y-4">
      <h1 className="text-4xl font-headline font-bold">404 - Página Não Encontrada</h1>
      <p className="text-muted-foreground">Não conseguimos encontrar a página que você procurava.</p>
      <Button asChild>
        <Link href="/">Voltar para o início</Link>
      </Button>
    </div>
  );
}
