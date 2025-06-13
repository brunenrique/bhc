
import ForgotPasswordForm from "@/components/forms/auth/forgot-password-form";
import { Brain } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-primary">PsiGuard</h1>
          </Link>
          <h2 className="text-2xl font-headline font-semibold tracking-tight text-foreground">
            Esqueceu sua Senha?
          </h2>
          <p className="text-sm text-muted-foreground">
            Digite seu endereço de e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Lembrou sua senha?{" "}
          <Link
            href={APP_ROUTES.login}
            className="underline underline-offset-4 hover:text-primary"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
