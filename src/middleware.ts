
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Autenticação desabilitada: permite acesso a todas as rotas.
  console.debug('Auth is globally disabled in middleware, allowing access to:', request.nextUrl.pathname);
  return NextResponse.next();
}

// Este config corresponde a todas as rotas, exceto as listadas.
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
};
