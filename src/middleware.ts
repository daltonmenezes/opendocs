export { default } from '@/lib/opendocs/middleware'

export const config = {
  matcher: [
    '/((?!api/|_next/|_proxy/|_vercel|_static|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
    '/([\\w-]+)?/docs/(.+)',
  ],
}
