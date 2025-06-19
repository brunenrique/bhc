"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 space-y-4">
      <h1 className="text-4xl font-headline font-bold">Algo deu errado</h1>
      <p className="text-muted-foreground">Ocorreu um erro inesperado. Tente novamente mais tarde.</p>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Link className={buttonVariants({ variant: "ghost" })} href="/">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
