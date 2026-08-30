import { NextRequest, NextResponse } from 'next/server';
import { authorizeBasicCredentials, validateSecurityConfiguration } from '@/lib/security';

// ponytail: single shared passcode, no sessions/roles — upgrade to real auth if more than one person ever needs access.
function isAuthorized(request: NextRequest): boolean {
  const user = process.env.APP_USER;
  const password = process.env.APP_PASSWORD;
  const configuration = validateSecurityConfiguration(process.env);
  if (!configuration.ok) return false;
  if (!user || !password) return true;

  return authorizeBasicCredentials(request.headers.get('authorization'), user, password);
}

export function proxy(request: NextRequest): NextResponse {
  if (isAuthorized(request)) return NextResponse.next();

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Zuzim"' },
  });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon).*)',
};
