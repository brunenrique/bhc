import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function createRequest(cookie?: string) {
  return new NextRequest('http://localhost/protected', {
    headers: cookie ? { cookie } : {},
  });
}

describe('middleware', () => {
  test('redirects to login when no session', () => {
    const res = middleware(createRequest());
    expect(res.headers.get('location')).toContain('/login');
  });

  test('rewrites to /403 when role invalid', () => {
    const session = encodeURIComponent(JSON.stringify({ user: { role: 'Visitor' } }));
    const res = middleware(createRequest(`session=${session}`));
    expect(res.headers.get('x-middleware-rewrite')).toContain('/403');
  });

  test('allows access with valid role', () => {
    const session = encodeURIComponent(JSON.stringify({ user: { role: 'Psychologist' } }));
    const res = middleware(createRequest(`session=${session}`));
    expect(res.headers.get('location')).toBeNull();
  });
});
