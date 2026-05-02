import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Mostra totes les cookies per diagnòstic
  const cookies = request.cookies.getAll()
  const cookieNames = cookies.map(c => c.name).join(', ')
  
  // Busca qualsevol cookie de supabase
  const hasAuth = cookies.some(c => 
    c.name.includes('auth') || 
    c.name.includes('supabase') || 
    c.name.includes('sb-')
  )

  if (!hasAuth) {
    const url = new URL('/login', request.url)
    url.searchParams.set('debug', cookieNames || 'cap-cookie')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
