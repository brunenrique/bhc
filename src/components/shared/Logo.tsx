import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 24, className, showText = true }: LogoProps) {
  return (
    <Link href="/dashboard" className={cn("flex items-center gap-2 text-primary hover:text-primary/90 transition-colors", className)}>
      <ShieldCheck size={size} strokeWidth={2.5} />
      {showText && <span className="font-headline text-lg font-semibold">PsiGuard</span>}
    </Link>
  );
}

// Helper for cn if not globally available, or import from "@/lib/utils"
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
