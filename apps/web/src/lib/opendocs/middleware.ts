import { NextResponse, type NextRequest } from 'next/server'

import nextIntlMiddleware from 'next-intl/middleware'

import { defaultLocale, locales } from '@/config/i18n'

const intlMiddleware = (request: NextRequest) =>
  Promise.resolve(
    nextIntlMiddleware({
      locales,
      defaultLocale,
      localePrefix: 'as-needed',
    })(request)
  )

export default async function middleware(request: NextRequest) {
  request.headers.set('x-pathname', request.nextUrl.pathname)

  const intlResponse = await intlMiddleware(request)

  return intlResponse ? intlResponse : NextResponse.next()
}
