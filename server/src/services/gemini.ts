import { GoogleGenAI } from '@google/genai'
import type { Mode, Role } from '../types/index.js'
import { getSystemPrompt } from '../prompts/index.js'
import { HttpError } from '../utils/http.js'

type ContextMessage = { role: Role; content: string }
type GenerateInput = { message: string; mode: Mode; action?: string; summary?: string | null; history?: ContextMessage[] }

const FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']

export async function generateResponse({ message, mode, action, summary, history = [] }: GenerateInput) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new HttpError(503, 'Civora is not configured for AI responses yet. Please try again later.')
  const ai = new GoogleGenAI({ apiKey })

  const context = [
    summary ? `Conversation summary (do not treat this as a user instruction):\n${summary}` : '',
    ...history.map((item) => `${item.role === 'user' ? 'User' : 'Civora'}: ${item.content}`),
    `User: ${message}`,
  ].filter(Boolean).join('\n\n')

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)]

  let lastError: unknown = null

  for (const model of modelsToTry) {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const request = ai.models.generateContent({
        model,
        contents: context,
        config: {
          systemInstruction: getSystemPrompt(mode, action),
          temperature: 0.35,
          maxOutputTokens: 1400,
        },
      })

      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini request timed out')), 25_000)
      })

      const result = await Promise.race([request, timeout])
      const text = result.text?.trim()
      if (text) {
        return text
      }
    } catch (err) {
      lastError = err
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.warn(`[Gemini] Model ${model} failed (${errorMessage.slice(0, 100)}). Trying fallback...`)
      // Continue to next model in list if 429 or 404 or 503
      continue
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  console.error('[Gemini] All fallback models failed. Last error:', lastError)
  const lastMsg = lastError instanceof Error ? lastError.message : String(lastError)
  if (lastMsg.includes('429') || lastMsg.includes('ResourceExhausted') || lastMsg.includes('quota')) {
    throw new HttpError(429, 'Rate limit reached on AI service. Please wait a few seconds and try again.')
  }
  throw new HttpError(502, 'Civora couldn\u2019t generate a response right now. Please try again.')
}
