import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownProps {
  content: string
}

/**
 * Renders untrusted Markdown safely — rehype-sanitize strips any raw HTML/script
 * content, so this never needs (and never uses) dangerouslySetInnerHTML.
 */
export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-invert dark:prose-a:text-blue-400 prose-pre:bg-slate-900 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
