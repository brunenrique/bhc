import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 space-y-4">
      <h1 className="text-4xl font-headline font-bold">403 - Acesso Negado</h1>
      <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      <Button asChild>
        <Link href={APP_ROUTES.login}>Ir para Login</Link>
      </Button>
    </div>
  );
}
