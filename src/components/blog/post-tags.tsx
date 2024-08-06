import type { Blog } from 'contentlayer/generated'

import { badgeVariants } from '../ui/badge'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'

export async function BlogPostTags({ post }: { post: Blog }) {
  if (!post.tags) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 pt-4">
      {post.tags.map((tag) => (
        <Link
          key={tag}
          href={`/blog?tag=${encodeURI(tag)}`}
          className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
