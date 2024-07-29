import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode, { Options } from 'rehype-pretty-code'
import { codeImport } from 'remark-code-import'
import { visit } from 'unist-util-visit'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import {
  makeSource,
  ComputedFields,
  defineNestedType,
  defineDocumentType,
} from 'contentlayer2/source-files'

import { rehypeNpmCommand } from './src/lib/opendocs/utils/rehype-npm-command'
import { getContentLayerCodeTheme } from './src/lib/opendocs/utils/code-theme'

const computedFields: ComputedFields = {
  slug: {
    type: 'string',
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },

  slugAsParams: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.split('/').slice(1).join('/'),
  },
}

const LinksProperties = defineNestedType(() => ({
  name: 'LinksProperties',

  fields: {
    doc: {
      type: 'string',
    },

    api: {
      type: 'string',
    },
  },
}))

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  contentType: 'mdx',
  filePathPattern: `docs/**/**/**/**/*.mdx`,

  fields: {
    title: {
      type: 'string',
      required: true,
    },

    description: {
      type: 'string',
      required: true,
    },

    published: {
      type: 'boolean',
      default: true,
    },

    links: {
      type: 'nested',
      of: LinksProperties,
    },

    featured: {
      type: 'boolean',
      default: false,
      required: false,
    },

    component: {
      type: 'boolean',
      default: false,
      required: false,
    },

    toc: {
      type: 'boolean',
      default: true,
      required: false,
    },
  },

  computedFields,
}))

export default makeSource({
  documentTypes: [Doc],
  contentDirPath: './content',
  contentDirInclude: ['docs'],

  mdx: {
    remarkPlugins: [remarkGfm, codeImport],

    rehypePlugins: [
      rehypeSlug,
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'pre') {
            const [codeEl] = node.children
            if (codeEl.tagName !== 'code') {
              return
            }

            node.__rawString__ = codeEl.children?.[0].value
            node.__src__ = node.properties?.__src__
            node.__style__ = node.properties?.__style__
          }
        })
      },

      [
        rehypePrettyCode,
        {
          keepBackground: false,
          theme: getContentLayerCodeTheme(),

          onVisitLine(node) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }]
            }
          },

          onVisitHighlightedLine(node) {
            node?.properties?.className?.push('line--highlighted')
          },

          onVisitHighlightedChars(node) {
            node.properties.className = ['word--highlighted']
          },
        } as Options,
      ],

      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && !!node?.tagName) {
            const preElement = node?.children?.at(-1)

            if (preElement?.tagName !== 'pre') {
              return
            }

            preElement.properties['__withMeta__'] =
              node?.children?.at(0)?.tagName === 'div'

            preElement.properties['__rawString__'] = node?.__rawString__

            if (node?.__src__) {
              preElement.properties['__src__'] = node.__src__
            }

            if (node?.__style__) {
              preElement.properties['__style__'] = node.__style__
            }
          }
        })
      },

      rehypeNpmCommand,

      [
        rehypeAutolinkHeadings,

        {
          properties: {
            ariaLabel: 'Link to section',
            className: ['subheading-anchor'],
          },
        },
      ],
    ],
  },
})
