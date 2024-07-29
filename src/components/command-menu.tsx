'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useTheme } from 'next-themes'

import type { AlertDialogProps } from '@radix-ui/react-alert-dialog'

import type { NavItemWithChildren } from '@/lib/opendocs/types/nav'

import {
  SunIcon,
  FileIcon,
  MoonIcon,
  LaptopIcon,
  CircleIcon,
} from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/navigation'
import { cn } from '@/lib/utils'

import {
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandDialog,
  CommandSeparator,
} from './ui/command'

import { useDocsConfig } from '@/lib/opendocs/hooks/use-docs-config'
import { getObjectValueByLocale } from '@/lib/opendocs/utils/locale'

function DocsCommandMenu({
  runCommand,
}: {
  runCommand: (command: () => unknown) => void
}) {
  const router = useRouter()
  const docsConfig = useDocsConfig()

  function renderItems(items: NavItemWithChildren[]) {
    return items.map((navItem) => {
      if (!navItem.href) {
        return (
          <Fragment
            key={getObjectValueByLocale(
              navItem.title,
              docsConfig.currentLocale
            )}
          >
            <CommandGroup
              heading={getObjectValueByLocale(
                navItem.title,
                docsConfig.currentLocale
              )}
            >
              {renderItems(navItem.items)}
            </CommandGroup>
          </Fragment>
        )
      }

      return (
        <Fragment key={navItem.href}>
          <CommandItem
            value={getObjectValueByLocale(
              navItem.title,
              docsConfig.currentLocale
            )}
            onSelect={() => {
              runCommand(() => router.push(navItem.href as string))
            }}
          >
            <div className="mr-2 flex size-4 items-center justify-center">
              <CircleIcon className="size-3" />
            </div>

            {getObjectValueByLocale(navItem.title, docsConfig.currentLocale)}
          </CommandItem>

          {navItem?.items?.length > 0 && (
            <CommandGroup>{renderItems(navItem.items)}</CommandGroup>
          )}
        </Fragment>
      )
    })
  }

  return docsConfig.docs.sidebarNav.map((group) => (
    <CommandGroup
      key={getObjectValueByLocale(group.title, docsConfig.currentLocale)}
      heading={getObjectValueByLocale(group.title, docsConfig.currentLocale)}
    >
      {renderItems(group.items)}
    </CommandGroup>
  ))
}

interface CommandMenuProps extends AlertDialogProps {
  messages: {
    search: string
    noResultsFound: string
    searchDocumentation: string
    typeCommandOrSearch: string

    themes: {
      theme: string
      dark: string
      light: string
      system: string
    }
  }
}

export function CommandMenu({ messages, ...props }: CommandMenuProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const docsConfig = useDocsConfig()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'bg-card-primary text-muted-foreground relative h-8 w-full justify-start rounded-lg text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">
          {messages.searchDocumentation}...
        </span>

        <span className="inline-flex lg:hidden">{messages.search}...</span>

        <kbd className="bg-muted pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={`${messages.typeCommandOrSearch}...`} />

        <CommandList>
          <CommandEmpty>{messages.noResultsFound}.</CommandEmpty>

          <CommandGroup heading="Links">
            {docsConfig.docs.mainNav
              .filter((navitem) => !navitem.external)
              .map((navItem) => (
                <CommandItem
                  key={navItem.href}
                  value={getObjectValueByLocale(
                    navItem.title,
                    docsConfig.currentLocale
                  )}
                  onSelect={() =>
                    runCommand(() => router.push(navItem.href as string))
                  }
                >
                  <FileIcon className="mr-2 size-4" />

                  {getObjectValueByLocale(
                    navItem.title,
                    docsConfig.currentLocale
                  )}
                </CommandItem>
              ))}
          </CommandGroup>

          <DocsCommandMenu runCommand={runCommand} />

          <CommandSeparator />

          <CommandGroup heading={messages.themes.theme}>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunIcon className="mr-2 size-4" />
              {messages.themes.light}
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <MoonIcon className="mr-2 size-4" />
              {messages.themes.dark}
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <LaptopIcon className="mr-2 size-4" />
              {messages.themes.system}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
