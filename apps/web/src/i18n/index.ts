import { getRequestConfig } from 'next-intl/server'
import deepmerge from 'deepmerge'

import type { AbstractIntlMessages } from 'next-intl'

import { defaultLocale } from '@/config/i18n'

export default getRequestConfig(async ({ locale }) => {
  const fallbackMessages: AbstractIntlMessages = await import(
    `@/i18n/locales/${defaultLocale}.json`
  )

  let messagesFromCurrentLocale: AbstractIntlMessages = {}

  try {
    messagesFromCurrentLocale = await import(`@/i18n/locales/${locale}.json`)
  } catch {}

  const messages = deepmerge(fallbackMessages, messagesFromCurrentLocale)

  return { messages }
})
