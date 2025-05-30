import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('Creating Plaid link token...')
    
    // Check environment variables
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      console.error('Missing Plaid credentials')
      return NextResponse.json(
        { error: 'Missing Plaid credentials' },
        { status: 500 }
      )
    }

    console.log('Plaid Client ID:', process.env.PLAID_CLIENT_ID)
    console.log('Environment:', process.env.PLAID_ENV || 'sandbox')

    // Prepare request for Plaid
    const plaidRequest = {
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      client_name: 'Personal Finance App',
      country_codes: ['US'],
      language: 'en',
      user: {
        client_user_id: 'user_' + Date.now()
      },
      products: ['transactions']
    }

    console.log('Making request to Plaid sandbox...')

    // Make request to Plaid sandbox
    const plaidResponse = await fetch('https://sandbox.plaid.com/link/token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plaidRequest)
    })

    const responseText = await plaidResponse.text()
    console.log('Plaid response status:', plaidResponse.status)
    
    if (!plaidResponse.ok) {
      console.error('Plaid error response:', responseText)
      return NextResponse.json(
        { 
          error: 'Plaid API error',
          status: plaidResponse.status,
          details: responseText
        },
        { status: 500 }
      )
    }

    const plaidData = JSON.parse(responseText)
    console.log('Plaid response success, link_token created')

    return NextResponse.json({ 
      link_token: plaidData.link_token,
      success: true
    })

  } catch (error) {
    console.error('Error in create-link-token:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Also handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'create-link-token endpoint is working',
    method: 'Use POST to create a link token'
  })
}