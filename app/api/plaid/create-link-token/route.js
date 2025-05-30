import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.PLAID_CLIENT_ID?.trim()
  const secret = process.env.PLAID_SECRET?.trim()
  
  return NextResponse.json({ 
    message: 'NEW create-link-token endpoint is working',
    timestamp: new Date().toISOString(),
    credentials: {
      client_id_length: clientId ? clientId.length : 0,
      secret_length: secret ? secret.length : 0,
      client_id_present: !!clientId,
      secret_present: !!secret
    }
  })
}

export async function POST() {
  try {
    console.log('=== NEW POST request received for link token ===')
    
    const clientId = process.env.PLAID_CLIENT_ID?.trim()
    const secret = process.env.PLAID_SECRET?.trim()
    
    if (!clientId || !secret) {
      return NextResponse.json(
        { error: 'Missing Plaid credentials' },
        { status: 500 }
      )
    }

    const requestBody = {
      client_id: clientId,
      secret: secret,
      client_name: 'Personal Finance App',
      country_codes: ['US'],
      language: 'en',
      user: {
        client_user_id: `user_${Date.now()}`
      },
      products: ['transactions']
    }

    console.log('Making request to Plaid sandbox...')

    const response = await fetch('https://production.plaid.com/link/token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    console.log('Plaid response status:', response.status)
    console.log('Plaid response:', responseText.substring(0, 200))

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Plaid API error',
          status: response.status,
          details: responseText
        },
        { status: 500 }
      )
    }

    const data = JSON.parse(responseText)

    return NextResponse.json({ 
      link_token: data.link_token,
      success: true
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
