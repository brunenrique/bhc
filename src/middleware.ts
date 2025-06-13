import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_ROUTES } from './lib/routes';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(APP_ROUTES.login, request.url));
  }

  try {
    const session = JSON.parse(sessionCookie);
    const role = session.user?.role;
    if (role !== 'Psychologist' && role !== 'Admin') {
      return NextResponse.rewrite(new URL('/403', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL(APP_ROUTES.login, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/).*)'],
};
