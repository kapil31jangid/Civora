import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, UserRound } from 'lucide-react'
import type { Message } from '../../types'

export function MessageList({ messages, sending }: { messages: Message[]; sending: boolean }) {
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, sending])
  return <div className="mx-auto w-full max-w-3xl px-4 pb-44 pt-6 sm:px-6" aria-live="polite">
    {messages.map((message) => <article key={message.id} className={`mb-7 flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
      {message.role === 'assistant' && <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-900 text-white"><Bot aria-hidden className="h-4 w-4" /></span>}
      <div className={message.role === 'user' ? 'max-w-[85%] rounded-2xl rounded-br-md bg-navy-900 px-4 py-3 text-[15px] leading-6 text-white' : 'min-w-0 max-w-[calc(100%-44px)] pt-1 text-[15px] leading-7 text-slate-700'}>
        <span className="sr-only">{message.role === 'user' ? 'You' : 'Civora'} said:</span>
        {message.role === 'assistant' ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
          h2: ({ children }) => <h2 className="mb-2 mt-5 text-base font-bold text-navy-900 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 mt-4 font-bold text-navy-900">{children}</h3>,
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 marker:text-civic-600">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 marker:font-semibold marker:text-civic-600">{children}</ol>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2">{children}</a>,
          strong: ({ children }) => <strong className="font-bold text-navy-900">{children}</strong>,
        }}>{message.content}</ReactMarkdown> : message.content}
      </div>
      {message.role === 'user' && <span className="mt-1 hidden h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-700 sm:grid"><UserRound aria-hidden className="h-4 w-4" /></span>}
    </article>)}
    {sending && <div className="flex items-center gap-3" role="status"><span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-white"><Bot aria-hidden className="h-4 w-4" /></span><div className="flex items-center gap-1.5 text-sm text-slate-500"><span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" /><span className="ml-1">Civora is thinking…</span></div></div>}
    <div ref={end} />
  </div>
}
