"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('psychologist');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, role);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <ShieldCheck className="h-16 w-16 text-primary mb-2" />
          <CardTitle className="font-headline text-3xl text-primary">PsiGuard</CardTitle>
          <CardDescription>Bem-vindo! Faça login para acessar o sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
               <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role" className="w-full bg-input">
                  <SelectValue placeholder="Selecione sua função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psychologist">Psicólogo(a)</SelectItem>
                  <SelectItem value="secretary">Secretário(a)</SelectItem>
                  <SelectItem value="admin">Administrador(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <p className="text-muted-foreground">
            Não tem uma conta? <Link href="#" className="text-primary hover:underline">Contate o administrador</Link>
          </p>
          {/* For prototype, can add a mock registration or different roles */}
           <p className="text-xs text-muted-foreground mt-2">
            (Protótipo: qualquer email/senha funcionará)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
