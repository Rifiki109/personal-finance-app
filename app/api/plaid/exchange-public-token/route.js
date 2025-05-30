import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request) {
  try {
    console.log('=== Token Exchange Started ===')
    
    const body = await request.json()
    const { public_token } = body
    
    if (!public_token) {
      return NextResponse.json(
        { error: 'No public token provided' },
        { status: 400 }
      )
    }

    console.log('Public token received, exchanging for access token...')

    // Exchange public token for access token
    const exchangeResponse = await fetch('https://production.plaid.com/item/public_token/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID?.trim(),
        secret: process.env.PLAID_SECRET?.trim(),
        public_token: public_token
      })
    })

    if (!exchangeResponse.ok) {
      const errorText = await exchangeResponse.text()
      console.error('Exchange API error:', errorText)
      return NextResponse.json(
        { error: 'Token exchange failed', details: errorText },
        { status: 500 }
      )
    }

    const exchangeData = await exchangeResponse.json()
    const access_token = exchangeData.access_token
    console.log('Access token received successfully')

    // Get accounts
    console.log('Fetching accounts...')
    const accountsResponse = await fetch('https://production.plaid.com/accounts/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID?.trim(),
        secret: process.env.PLAID_SECRET?.trim(),
        access_token: access_token
      })
    })

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text()
      console.error('Accounts API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch accounts', details: errorText },
        { status: 500 }
      )
    }

    const accountsData = await accountsResponse.json()
    console.log(`Found ${accountsData.accounts.length} accounts`)

    // Store accounts in database
    let accountCount = 0
    for (const account of accountsData.accounts) {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('plaid_account_id', account.account_id)
        .single()

      if (existingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('accounts')
          .update({
            name: account.name,
            official_name: account.official_name,
            type: account.type,
            subtype: account.subtype,
            balance_available: account.balances.available,
            balance_current: account.balances.current,
            balance_limit: account.balances.limit,
          })
          .eq('plaid_account_id', account.account_id)
        
        if (error) {
          console.error('Error updating account:', error)
        } else {
          console.log(`Updated account: ${account.name}`)
        }
      } else {
        // Insert new account
        const { error } = await supabase.from('accounts').insert({
          plaid_account_id: account.account_id,
          name: account.name,
          official_name: account.official_name,
          type: account.type,
          subtype: account.subtype,
          balance_available: account.balances.available,
          balance_current: account.balances.current,
          balance_limit: account.balances.limit,
        })
        
        if (error) {
          console.error('Error saving account:', error)
        } else {
          accountCount++
          console.log(`Saved new account: ${account.name}`)
        }
      }
    }

    // Get recent transactions (force fetch, no graceful handling)
    console.log('Fetching transactions...')
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days

    let transactionCount = 0
    
    const transactionsResponse = await fetch('https://production.plaid.com/transactions/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID?.trim(),
        secret: process.env.PLAID_SECRET?.trim(),
        access_token: access_token,
        start_date: startDate,
        end_date: endDate
      })
    })

    if (!transactionsResponse.ok) {
      const errorText = await transactionsResponse.text()
      console.error('Transactions API error:', errorText)
      // Don't fail the whole process, but log the error
    } else {
      const transactionsData = await transactionsResponse.json()
      console.log(`Found ${transactionsData.transactions.length} transactions`)

      // Store transactions in database
      for (const transaction of transactionsData.transactions) {
        // Check if transaction already exists
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('plaid_transaction_id', transaction.transaction_id)
          .single()

        if (!existing) {
          const { error } = await supabase.from('transactions').insert({
            plaid_transaction_id: transaction.transaction_id,
            account_id: transaction.account_id,
            amount: -transaction.amount, // Plaid uses positive for expenses
            name: transaction.name,
            merchant_name: transaction.merchant_name,
            date: transaction.date,
            category_primary: transaction.category?.[0],
            category_detailed: transaction.category?.join(', '),
            pending: transaction.pending,
            user_category: suggestCategory(transaction),
          })
          
          if (error) {
            console.error('Error saving transaction:', error)
          } else {
            transactionCount++
          }
        }
      }
    }

    console.log(`=== Exchange Complete: ${accountCount} accounts, ${transactionCount} transactions ===`)

    // Determine success message based on results
    let message = 'Bank connected successfully!'
    if (accountCount > 0 && transactionCount > 0) {
      message = `🎉 Success! Connected ${accountCount} accounts with ${transactionCount} transactions.`
    } else if (accountCount > 0) {
      message = `🎉 Success! Connected ${accountCount} accounts. Transactions may take a few minutes to appear.`
    }

    return NextResponse.json({ 
      success: true,
      accounts: accountCount,
      transactions: transactionCount,
      message: message
    })

  } catch (error) {
    console.error('Exchange error:', error)
    return NextResponse.json(
      { error: 'Token exchange failed', details: error.message },
      { status: 500 }
    )
  }
}

function suggestCategory(plaidTransaction) {
  const name = plaidTransaction.name.toLowerCase()
  const category = plaidTransaction.category?.[0]?.toLowerCase()

  if (plaidTransaction.amount < 0) return 'Income'
  if (category?.includes('food') || name.includes('restaurant') || name.includes('coffee')) return 'Food & Dining'
  if (category?.includes('transportation') || name.includes('gas') || name.includes('uber')) return 'Transportation'
  if (category?.includes('payment') || name.includes('electric') || name.includes('internet')) return 'Bills & Utilities'
  if (category?.includes('shops') || name.includes('amazon') || name.includes('target')) return 'Shopping'
  
  return 'Other'
}