import { absoluteUrl } from '@/lib/utils'
import en from '@/i18n/locales/en.json'
import pt from '@/i18n/locales/pt.json'

export const siteConfig = {
  name: 'opendocs',

  description: {
    en: en.site.description,
    pt: pt.site.description,
  },

  url: process.env.NEXT_PUBLIC_APP_URL,

  og: {
    image: absoluteUrl('/og.jpg'),

    size: {
      width: 1200,
      height: 630,
    },
  },

  app: {
    latestVersion: '2.1.0',
  },

  author: {
    name: 'Dalton Menezes',
    site: 'https://daltonmenezes.com',
  },

  links: {
    twitter: {
      label: 'Twitter',
      username: '@daltonmenezes',
      url: 'https://twitter.com/daltonmenezes',
    },

    github: {
      label: 'GitHub',
      url: 'https://github.com/daltonmenezes/opendocs',
    },
  },
} as const

export type SiteConfig = typeof siteConfig
