'use client'

import { useState } from 'react'

import {
  Sheet,
  SheetTitle,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet'

import { useDocsConfig } from '@/lib/opendocs/hooks/use-docs-config'
import { DocsSidebarNav } from './docs/sidebar-nav'
import { ScrollArea } from './ui/scroll-area'
import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'
import { MobileLink } from './mobile-link'
import { Button } from './ui/button'

interface MobileNavProps {
  messages: {
    menu: string
    toggleMenu: string
  }
}

export function MobileNav({ messages }: MobileNavProps) {
  const docsConfig = useDocsConfig()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Icons.menu className="size-5" />
          <span className="sr-only">${messages.toggleMenu}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="pr-0">
        <SheetTitle className="sr-only">{messages.menu}</SheetTitle>

        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Icons.logo className="mr-2 size-4" />
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>

        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {docsConfig.docs.mainNav?.map(
              (item) =>
                item.href && (
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    onOpenChange={setOpen}
                  >
                    {item.title[docsConfig.currentLocale]}
                  </MobileLink>
                )
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <DocsSidebarNav
              isMobile
              locale={docsConfig.currentLocale}
              items={docsConfig.docs.sidebarNav}
              handleMobileSidebar={setOpen}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
