import { defaultLocale } from '@/config/i18n'

import type { LocaleOptions } from '../types/i18n'

export function getObjectValueByLocale(
  obj: Record<string, string>,
  locale: LocaleOptions
) {
  return obj?.[locale] || obj?.[defaultLocale]
}
