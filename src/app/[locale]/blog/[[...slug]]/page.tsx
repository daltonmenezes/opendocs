import { unstable_setRequestLocale, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import type { LocaleOptions } from '@/lib/opendocs/types/i18n'
import type { Metadata } from 'next'

import '@/styles/mdx.css'

import { PaginatedBlogPosts } from '@/components/blog/paginated-posts'
import { BlogPostBreadcrumb } from '@/components/blog/breadcrumb'
import { DashboardTableOfContents } from '@/components/docs/toc'
import { getTableOfContents } from '@/lib/opendocs/utils/toc'
import { getBlogFromParams } from '@/lib/opendocs/utils/blog'
import { BlogPostHeading } from '@/components/blog/heading'
import { BlogPostTags } from '@/components/blog/post-tags'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AuthorCard } from '@/components/blog/author'
import { allBlogs } from 'contentlayer/generated'
import { defaultLocale } from '@/config/i18n'
import { Mdx } from '@/components/docs/mdx'
import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'
import { absoluteUrl } from '@/lib/utils'

interface BlogPageProps {
  params: {
    slug: string[]
    locale: LocaleOptions
  }
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const locale = params.locale || defaultLocale

  unstable_setRequestLocale(locale)

  const [t, blogPost] = await Promise.all([
    getTranslations('site'),
    getBlogFromParams({ params }),
  ])

  if (!blogPost) {
    const title = t('words.blog')
    const description = t('description')

    const tags = new Set(
      allBlogs
        .map((blog) => blog.tags)
        .flat()
        .filter(Boolean)
    )

    const ogImage = absoluteUrl(`/blog-og/introducing-blogs-og.jpg`)

    return {
      title,
      description,
      keywords: Array.from(tags),

      openGraph: {
        title,
        description,
        type: 'website',
        url: absoluteUrl(`/${locale}/blog`),

        images: [
          {
            ...siteConfig.og.size,
            url: ogImage,
            alt: siteConfig.name,
          },
        ],
      },

      twitter: {
        title,
        description,
        images: [ogImage],
        card: 'summary_large_image',
        creator: siteConfig.links.twitter.username,
      },
    }
  }

  const [, ...blogSlugList] = blogPost.slugAsParams.split('/')
  const blogSlug = blogSlugList.join('/') || ''

  const postAuthorName = blogPost.author?.name || siteConfig.author.name
  const postAuthorUrl = blogPost.author?.site || siteConfig.author.site

  const postAuthorTwitter =
    blogPost.author?.social?.twitter || siteConfig.links.twitter.username

  const postOgImage = blogPost.og_image
    ? absoluteUrl(`/blog-og/${blogPost.og_image}`)
    : absoluteUrl(`/${locale}/blog/og/${blogSlug}`)

  return {
    title: blogPost.title,
    description: blogPost.excerpt,
    keywords: blogPost.tags || [],

    authors: {
      url: postAuthorUrl,
      name: postAuthorName,
    },

    openGraph: {
      type: 'article',
      title: blogPost.title,
      authors: postAuthorName,
      description: blogPost.excerpt,
      url: absoluteUrl(`/${locale}/blog/${blogSlug}`),

      images: [
        {
          ...siteConfig.og.size,
          url: postOgImage,
          alt: blogPost.title,
        },
      ],
    },

    twitter: {
      title: blogPost.title,
      images: [postOgImage],
      creator: postAuthorTwitter,
      card: 'summary_large_image',
      description: blogPost.excerpt,
    },
  }
}

export async function generateStaticParams(): Promise<
  BlogPageProps['params'][]
> {
  const blog = allBlogs.map((blog) => {
    const [locale, ...slugs] = blog.slugAsParams.split('/')

    return {
      slug: slugs,
      locale: locale as LocaleOptions,
    }
  })

  return blog
}

export default async function BlogPage({ params }: BlogPageProps) {
  const locale = params.locale || defaultLocale

  unstable_setRequestLocale(locale)

  const t = await getTranslations()
  const blogPost = await getBlogFromParams({ params })

  if (!blogPost) {
    return (
      <Suspense
        fallback={
          <div className="h-64 md:h-96 w-full flex flex-1 items-center justify-center">
            <Icons.spinner
              className="animate-spin max-h-32 max-w-32 min-h-20 min-w-20 h-full w-full"
              strokeWidth="1"
            />
          </div>
        }
      >
        <PaginatedBlogPosts
          posts={allBlogs}
          locale={locale}
          perPage={6}
          messages={{
            by: t('blog.words.by'),
            next: t('blog.buttons.next'),
            min_read: t('blog.cards.min_read'),
            previous: t('blog.buttons.previous'),
            rss_feed: t('blog.buttons.rss_feed'),
            read_more: t('blog.buttons.read_more'),
            go_to_next_page: t('blog.buttons.go_to_next_page'),
            go_to_previous_page: t('blog.buttons.go_to_previous_page'),
          }}
        />
      </Suspense>
    )
  }

  const toc = await getTableOfContents(blogPost.body.raw)

  return (
    <main className="relative space-y-12 lg:gap-10 lg:grid lg:grid-cols-[1fr_250px]">
      <div className="mx-auto min-w-0 max-w-4xl">
        <BlogPostBreadcrumb
          post={blogPost}
          messages={{
            posts: t('blog.words.posts'),
          }}
        />

        <BlogPostHeading
          post={blogPost}
          locale={locale}
          messages={{
            by: t('blog.words.by'),
            min_read: t('blog.cards.min_read'),
          }}
        />

        <BlogPostTags post={blogPost} />

        <div className="pb-12 pt-8">
          <Mdx code={blogPost.body.code} />
        </div>

        <AuthorCard post={blogPost} />
      </div>

      <div className="hidden text-sm lg:block">
        <div className="sticky top-16 -mt-10 pt-4">
          <ScrollArea className="pb-10">
            <div className="sticky top-16 -mt-10 h-fit py-12">
              <DashboardTableOfContents
                sourceFilePath={blogPost._raw.sourceFilePath}
                toc={toc}
                messages={{
                  onThisPage: t('docs.on_this_page'),
                  editPageOnGitHub: t('docs.edit_page_on_github'),
                  startDiscussionOnGitHub: t('docs.start_discussion_on_github'),
                }}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  )
}
