import { NextRequest, NextResponse } from 'next/server';

// ponytail: single shared passcode, no sessions/roles — upgrade to real auth if more than one person ever needs access.
function isAuthorized(request: NextRequest): boolean {
  const user = process.env.APP_USER;
  const password = process.env.APP_PASSWORD;
  if (!user || !password) return true; // no credentials configured — local dev stays open

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return false;

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8');
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return false;

  return decoded.slice(0, separatorIndex) === user && decoded.slice(separatorIndex + 1) === password;
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
