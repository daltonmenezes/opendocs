/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from 'next/og'

import type { LocaleOptions } from '@/lib/opendocs/types/i18n'
import type { NextRequest } from 'next/server'

import { allBlogs, type Blog } from 'contentlayer/generated'
import { absoluteUrl, truncateText } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { getFonts } from '@/lib/fonts'

interface BlogOgProps {
  params: { slug: string; locale: LocaleOptions }
}

export const runtime = 'edge'
export const dynamicParams = true

export async function GET(_: NextRequest, { params }: BlogOgProps) {
  const post = getBlogPostBySlugAndLocale(params.slug, params.locale)

  if (!post) {
    return new ImageResponse(<Fallback src="/og.jpg" />, {
      ...siteConfig.og.size,
    })
  }

  const { bold, regular } = await getFonts()

  return new ImageResponse(
    (
      <div
        tw={`bg-black flex flex-col min-w-full h-[${siteConfig.og.size.height}px] relative`}
      >
        <Background src="/og-background.jpg" />

        <div tw="my-10 mx-14 flex flex-col">
          <Logo src="/logo.svg" />

          <div tw="flex flex-col h-full max-h-[300px]">
            <Title>{post.title}</Title>
            <Author post={post} />
          </div>
        </div>
      </div>
    ),
    {
      ...siteConfig.og.size,
      fonts: [
        {
          name: 'Geist',
          data: regular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Geist',
          data: bold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}

function Author({ post }: { post: Blog }) {
  return (
    <div tw="flex items-center pt-10">
      {post.author?.image && (
        <img
          tw="w-20 h-20 rounded-full border-gray-800 border-4"
          src={absoluteUrl(post.author?.image)}
          alt=""
        />
      )}

      <span tw="ml-3 text-gray-400 text-3xl">{post.author?.name}</span>
    </div>
  )
}

function Background({ src }: { src: string }) {
  return (
    <img
      alt=""
      src={absoluteUrl(src)}
      tw="w-full h-full absolute left-0 top-0 opacity-70"
    />
  )
}

function Logo({ src }: { src: string }) {
  return <img tw="w-28 h-28 rounded-full" src={absoluteUrl(src)} alt="" />
}

function Title({ children }: { children: string }) {
  return (
    <div tw="pt-4 flex flex-col h-full justify-center">
      <h1 tw="text-white text-7xl w-full">{truncateText(children)}</h1>
    </div>
  )
}

function Fallback({ src }: { src: string }) {
  return (
    <div tw="flex w-full h-full">
      <img src={absoluteUrl(src)} tw="w-full h-full" alt="" />
    </div>
  )
}

function getBlogPostBySlugAndLocale(slug: string, locale: LocaleOptions) {
  return allBlogs.find((post) => {
    const [postLocale, ...slugs] = post.slugAsParams.split('/')

    return slugs.join('/') === slug && postLocale === locale
  })
}

export async function generateStaticParams(): Promise<BlogOgProps['params'][]> {
  const blog = allBlogs.map((blog) => {
    const [locale, ...slugs] = blog.slugAsParams.split('/')

    return {
      slug: slugs.join('/'),
      locale: locale as LocaleOptions,
    }
  })

  return blog
}
