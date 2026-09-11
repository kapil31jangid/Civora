import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, Check, Copy, UserRound } from 'lucide-react'
import type { Message } from '../../types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-navy-900 active:scale-95"
      aria-label="Copy response to clipboard"
    >
      {copied ? (
        <>
          <Check aria-hidden className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy aria-hidden className="h-3.5 w-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

export function MessageList({ messages, sending }: { messages: Message[]; sending: boolean }) {
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pt-4 pb-48 sm:px-6 sm:pt-6" aria-live="polite">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`mb-6 flex gap-2.5 sm:gap-3.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-navy-900 text-white shadow-sm">
              <Bot aria-hidden className="h-4 w-4" />
            </span>
          )}

          <div
            className={
              message.role === 'user'
                ? 'max-w-[88%] sm:max-w-[80%] rounded-2xl rounded-br-md bg-navy-900 px-4 py-3 text-[14px] sm:text-[15px] leading-relaxed text-white shadow-sm'
                : 'min-w-0 max-w-[calc(100%-42px)] pt-1 text-[14px] sm:text-[15px] leading-relaxed text-slate-700'
            }
          >
            <span className="sr-only">{message.role === 'user' ? 'You' : 'Civora'} said:</span>
            {message.role === 'assistant' ? (
              <div className="space-y-3">
                <div className="prose prose-slate max-w-none text-slate-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="mb-3 mt-4 text-lg font-extrabold text-navy-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-bold text-navy-900">{children}</h2>,
                      h3: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-bold text-navy-900">{children}</h3>,
                      p: ({ children }) => <p className="mb-2.5 leading-relaxed last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1 marker:text-civic-600">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1 marker:font-semibold marker:text-civic-600">{children}</ol>,
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900">
                          {children}
                        </a>
                      ),
                      strong: ({ children }) => <strong className="font-bold text-navy-900">{children}</strong>,
                      blockquote: ({ children }) => (
                        <blockquote className="my-2 border-l-2 border-civic-500 bg-civic-50/50 py-1.5 pl-3 text-sm italic text-slate-700">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <CopyButton text={message.content} />
                </div>
              </div>
            ) : (
              message.content
            )}
          </div>

          {message.role === 'user' && (
            <span className="mt-1 hidden h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-200 text-slate-700 shadow-sm sm:grid">
              <UserRound aria-hidden className="h-4 w-4" />
            </span>
          )}
        </article>
      ))}

      {sending && (
        <div className="flex items-center gap-3 pt-2" role="status">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-900 text-white shadow-sm">
            <Bot aria-hidden className="h-4 w-4" />
          </span>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-civic-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-civic-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-civic-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-1.5 text-xs font-medium text-slate-600">Civora AI is analyzing…</span>
          </div>
        </div>
      )}

      <div ref={end} />
    </div>
  )
}
