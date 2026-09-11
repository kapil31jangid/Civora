const key = 'civora-client-id'

export function getClientId() {
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  localStorage.setItem(key, value)
  return value
}
