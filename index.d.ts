import type { IntlMessages as Messages } from '@/lib/opendocs/types/i18n'

declare global {
  interface IntlMessages extends Messages {}

  type AbstractIntlMessages = Messages
}
