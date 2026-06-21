export async function callClaude(
  system: string,
  userContent: string,
  model: string = 'claude-sonnet-4-6'
): Promise<string> {
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, user: userContent, model }),
    })

    if (res.ok) {
      const data = await res.json()
      return data.content?.[0]?.text?.trim() || ''
    }

    console.warn(
      'Server-side API route failed (possibly missing key). Falling back to direct client-side fetch.'
    )
  } catch (error) {
    console.warn(
      'Server-side API route request failed. Falling back to direct client-side fetch.',
      error
    )
  }

  // Client-side fallback (direct request) which is intercepted in the sandbox.
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Direct Anthropic API call failed: ${res.statusText}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text?.trim() || ''
}
