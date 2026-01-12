import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  // No protection - allow all requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
