'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3',
        'prose-p:my-2 prose-p:leading-relaxed',
        'prose-ul:my-2 prose-ol:my-2',
        'prose-li:my-1',
        'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg',
        'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'dark:prose-invert',
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

