import type { Locales } from '@/lib/opendocs/types/i18n'

export const defaultLocale = 'en' as const

export const locale = {
  en: defaultLocale,
  pt: 'pt',
} as const

export const labels = {
  [defaultLocale]: 'English',
  [locale.pt]: 'Português',
} as const

export const locales = Object.values(locale) as Locales
