import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { system, user, model } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
        { status: 500 }
      )
    }

    const targetModel = model === 'claude-sonnet-4-6' ? 'claude-3-5-sonnet-20241022' : (model || 'claude-3-5-sonnet-20241022')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json(
        { error: `Anthropic API error: ${res.statusText}`, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Server proxy failed', details: message },
      { status: 500 }
    )
  }
}
